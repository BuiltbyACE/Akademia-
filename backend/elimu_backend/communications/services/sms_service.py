"""
SMS service for sending SMS notifications.
Supports multiple providers: Africa's Talking, Twilio, etc.
"""
import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


class SMSService:
    """
    Service for sending SMS messages via various providers.
    Default provider: Africa's Talking (popular in Africa)
    """
    
    def __init__(self, provider='africas_talking'):
        self.provider = provider
        self.api_key = settings.SMS_API_KEY
        self.username = settings.SMS_USERNAME
        
        if self.provider == 'africas_talking':
            self.base_url = 'https://api.africastalking.com/version1/messaging'
        elif self.provider == 'twilio':
            # Twilio configuration
            self.account_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', '')
            self.auth_token = getattr(settings, 'TWILIO_AUTH_TOKEN', '')
            self.from_number = getattr(settings, 'TWILIO_FROM_NUMBER', '')
            self.base_url = f'https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Messages.json'
    
    def send_sms(self, phone_number, message, sender_id=None):
        """
        Send SMS to a phone number.
        
        Args:
            phone_number: Recipient phone number (international format)
            message: SMS message text
            sender_id: Optional sender ID/name
        
        Returns:
            dict: Response with status and message_id
        """
        try:
            if self.provider == 'africas_talking':
                return self._send_africas_talking(phone_number, message, sender_id)
            elif self.provider == 'twilio':
                return self._send_twilio(phone_number, message)
            else:
                raise ValueError(f"Unsupported SMS provider: {self.provider}")
                
        except Exception as e:
            logger.error(f"SMS sending failed: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message_id': None
            }
    
    def _send_africas_talking(self, phone_number, message, sender_id=None):
        """
        Send SMS via Africa's Talking API.
        """
        headers = {
            'apiKey': self.api_key,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        }
        
        data = {
            'username': self.username,
            'to': phone_number,
            'message': message,
        }
        
        if sender_id:
            data['from'] = sender_id
        
        try:
            response = requests.post(
                self.base_url,
                headers=headers,
                data=data,
                timeout=30
            )
            response.raise_for_status()
            
            result = response.json()
            
            # Africa's Talking response format
            sms_messages = result.get('SMSMessageData', {}).get('Recipients', [])
            
            if sms_messages and len(sms_messages) > 0:
                recipient = sms_messages[0]
                status = recipient.get('status')
                
                if status == 'Success':
                    return {
                        'success': True,
                        'message_id': recipient.get('messageId'),
                        'status': status,
                        'cost': recipient.get('cost')
                    }
                else:
                    return {
                        'success': False,
                        'error': status,
                        'message_id': None
                    }
            else:
                return {
                    'success': False,
                    'error': 'No recipients in response',
                    'message_id': None
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Africa's Talking API error: {str(e)}")
            raise
    
    def _send_twilio(self, phone_number, message):
        """
        Send SMS via Twilio API.
        """
        import base64
        
        auth_string = f"{self.account_sid}:{self.auth_token}"
        auth_bytes = auth_string.encode('ascii')
        auth_base64 = base64.b64encode(auth_bytes).decode('ascii')
        
        headers = {
            'Authorization': f'Basic {auth_base64}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        data = {
            'From': self.from_number,
            'To': phone_number,
            'Body': message
        }
        
        try:
            response = requests.post(
                self.base_url,
                headers=headers,
                data=data,
                timeout=30
            )
            response.raise_for_status()
            
            result = response.json()
            
            return {
                'success': True,
                'message_id': result.get('sid'),
                'status': result.get('status'),
                'price': result.get('price')
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Twilio API error: {str(e)}")
            raise
    
    def send_bulk_sms(self, recipients, message, sender_id=None):
        """
        Send SMS to multiple recipients.
        
        Args:
            recipients: List of phone numbers
            message: SMS message text
            sender_id: Optional sender ID
        
        Returns:
            dict: Summary of sent messages
        """
        results = {
            'total': len(recipients),
            'successful': 0,
            'failed': 0,
            'details': []
        }
        
        for phone_number in recipients:
            try:
                result = self.send_sms(phone_number, message, sender_id)
                
                if result['success']:
                    results['successful'] += 1
                else:
                    results['failed'] += 1
                
                results['details'].append({
                    'phone_number': phone_number,
                    'success': result['success'],
                    'message_id': result.get('message_id'),
                    'error': result.get('error')
                })
                
            except Exception as e:
                results['failed'] += 1
                results['details'].append({
                    'phone_number': phone_number,
                    'success': False,
                    'error': str(e)
                })
                logger.error(f"Failed to send SMS to {phone_number}: {str(e)}")
        
        return results
    
    def get_delivery_status(self, message_id):
        """
        Get delivery status of a sent message.
        
        Args:
            message_id: Message ID from send response
        
        Returns:
            dict: Delivery status information
        """
        # Implementation depends on provider
        # Africa's Talking provides delivery reports via callback
        # Twilio provides status via API
        
        if self.provider == 'twilio':
            return self._get_twilio_status(message_id)
        
        # For Africa's Talking, status is typically received via callback
        return {
            'message_id': message_id,
            'status': 'unknown',
            'note': 'Status available via delivery callback'
        }
    
    def _get_twilio_status(self, message_id):
        """
        Get message status from Twilio.
        """
        import base64
        
        auth_string = f"{self.account_sid}:{self.auth_token}"
        auth_bytes = auth_string.encode('ascii')
        auth_base64 = base64.b64encode(auth_bytes).decode('ascii')
        
        headers = {
            'Authorization': f'Basic {auth_base64}'
        }
        
        url = f'https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Messages/{message_id}.json'
        
        try:
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            
            return {
                'message_id': message_id,
                'status': result.get('status'),
                'error_code': result.get('error_code'),
                'error_message': result.get('error_message'),
                'price': result.get('price'),
                'date_sent': result.get('date_sent')
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to get Twilio message status: {str(e)}")
            return {
                'message_id': message_id,
                'status': 'unknown',
                'error': str(e)
            }
    
    def validate_phone_number(self, phone_number):
        """
        Validate phone number format.
        
        Args:
            phone_number: Phone number to validate
        
        Returns:
            tuple: (is_valid, formatted_number)
        """
        import re
        
        # Remove spaces, dashes, parentheses
        cleaned = re.sub(r'[\s\-\(\)]', '', phone_number)
        
        # Remove leading + if present
        if cleaned.startswith('+'):
            cleaned = cleaned[1:]
        
        # Check if it's all digits
        if not cleaned.isdigit():
            return False, None
        
        # Should be between 10-15 digits
        if len(cleaned) < 10 or len(cleaned) > 15:
            return False, None
        
        # Format with + prefix
        formatted = f'+{cleaned}'
        
        return True, formatted
