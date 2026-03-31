"""
M-Pesa Daraja API integration service.
Handles STK Push, callback processing, and transaction queries.
"""
import base64
import requests
import logging
from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone
from django.db import transaction
from finance.models import PaymentRequest, PaymentCallback, Payment, Invoice
from tenants.utils import get_current_tenant

logger = logging.getLogger(__name__)


class MpesaService:
    """
    Service for M-Pesa Daraja API integration.
    Implements STK Push (Lipa Na M-Pesa Online) and callback handling.
    """
    
    def __init__(self):
        self.environment = settings.MPESA_ENVIRONMENT
        self.consumer_key = settings.MPESA_CONSUMER_KEY
        self.consumer_secret = settings.MPESA_CONSUMER_SECRET
        self.shortcode = settings.MPESA_SHORTCODE
        self.passkey = settings.MPESA_PASSKEY
        self.callback_url = settings.MPESA_CALLBACK_URL
        
        # API endpoints
        if self.environment == 'sandbox':
            self.base_url = 'https://sandbox.safaricom.co.ke'
        else:
            self.base_url = 'https://api.safaricom.co.ke'
        
        self.auth_url = f'{self.base_url}/oauth/v1/generate?grant_type=client_credentials'
        self.stk_push_url = f'{self.base_url}/mpesa/stkpush/v1/processrequest'
        self.query_url = f'{self.base_url}/mpesa/stkpushquery/v1/query'
    
    def get_access_token(self):
        """
        Get OAuth access token from M-Pesa API.
        """
        try:
            auth_string = f"{self.consumer_key}:{self.consumer_secret}"
            auth_bytes = auth_string.encode('ascii')
            auth_base64 = base64.b64encode(auth_bytes).decode('ascii')
            
            headers = {
                'Authorization': f'Basic {auth_base64}'
            }
            
            response = requests.get(self.auth_url, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            return data.get('access_token')
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to get M-Pesa access token: {str(e)}")
            raise Exception(f"M-Pesa authentication failed: {str(e)}")
    
    def generate_password(self, timestamp):
        """
        Generate password for STK Push request.
        Password = Base64(Shortcode + Passkey + Timestamp)
        """
        data_to_encode = f"{self.shortcode}{self.passkey}{timestamp}"
        encoded = base64.b64encode(data_to_encode.encode()).decode('utf-8')
        return encoded
    
    def format_phone_number(self, phone):
        """
        Format phone number to M-Pesa format (254XXXXXXXXX).
        """
        # Remove any spaces, dashes, or plus signs
        phone = phone.replace(' ', '').replace('-', '').replace('+', '')
        
        # If starts with 0, replace with 254
        if phone.startswith('0'):
            phone = '254' + phone[1:]
        
        # If doesn't start with 254, add it
        if not phone.startswith('254'):
            phone = '254' + phone
        
        return phone
    
    @transaction.atomic
    def initiate_stk_push(self, invoice_id, phone_number, amount, account_reference=None):
        """
        Initiate STK Push payment request.
        
        Args:
            invoice_id: Invoice UUID
            phone_number: Customer phone number
            amount: Amount to pay
            account_reference: Optional reference (defaults to invoice number)
        
        Returns:
            PaymentRequest object
        """
        try:
            tenant = get_current_tenant()
            if not tenant:
                raise Exception("Tenant context required for payment request")
            
            # Get invoice
            invoice = Invoice.objects.get(id=invoice_id, tenant=tenant)
            
            # Format phone number
            formatted_phone = self.format_phone_number(phone_number)
            
            # Generate timestamp and password
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            password = self.generate_password(timestamp)
            
            # Get access token
            access_token = self.get_access_token()
            
            # Prepare request
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            # Account reference defaults to invoice number
            if not account_reference:
                account_reference = invoice.invoice_number
            
            payload = {
                'BusinessShortCode': self.shortcode,
                'Password': password,
                'Timestamp': timestamp,
                'TransactionType': 'CustomerPayBillOnline',
                'Amount': int(amount),
                'PartyA': formatted_phone,
                'PartyB': self.shortcode,
                'PhoneNumber': formatted_phone,
                'CallBackURL': self.callback_url,
                'AccountReference': account_reference,
                'TransactionDesc': f'Payment for {account_reference}'
            }
            
            # Make API request
            response = requests.post(
                self.stk_push_url,
                json=payload,
                headers=headers,
                timeout=30
            )
            response.raise_for_status()
            
            response_data = response.json()
            
            # Create payment request record
            payment_request = PaymentRequest.objects.create(
                tenant=tenant,
                request_id=f"MPR-{timezone.now().strftime('%Y%m%d%H%M%S')}-{invoice.id}",
                invoice=invoice,
                student=invoice.student,
                amount=amount,
                currency='KES',
                phone_number=formatted_phone,
                provider='mpesa',
                provider_request_id=response_data.get('CheckoutRequestID', ''),
                provider_response=response_data,
                status='sent',
                expires_at=timezone.now() + timedelta(minutes=5)
            )
            
            logger.info(f"STK Push initiated: {payment_request.request_id}")
            
            return payment_request
            
        except Invoice.DoesNotExist:
            logger.error(f"Invoice not found: {invoice_id}")
            raise Exception("Invoice not found")
        
        except requests.exceptions.RequestException as e:
            logger.error(f"M-Pesa API request failed: {str(e)}")
            raise Exception(f"Payment request failed: {str(e)}")
        
        except Exception as e:
            logger.error(f"STK Push initiation failed: {str(e)}")
            raise
    
    def query_transaction_status(self, payment_request_id):
        """
        Query the status of an STK Push transaction.
        """
        try:
            payment_request = PaymentRequest.objects.get(id=payment_request_id)
            
            if not payment_request.provider_request_id:
                raise Exception("No provider request ID available")
            
            # Generate timestamp and password
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            password = self.generate_password(timestamp)
            
            # Get access token
            access_token = self.get_access_token()
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'BusinessShortCode': self.shortcode,
                'Password': password,
                'Timestamp': timestamp,
                'CheckoutRequestID': payment_request.provider_request_id
            }
            
            response = requests.post(
                self.query_url,
                json=payload,
                headers=headers,
                timeout=30
            )
            response.raise_for_status()
            
            return response.json()
            
        except PaymentRequest.DoesNotExist:
            logger.error(f"Payment request not found: {payment_request_id}")
            raise Exception("Payment request not found")
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Transaction query failed: {str(e)}")
            raise Exception(f"Query failed: {str(e)}")
    
    @transaction.atomic
    def process_callback(self, callback_data, ip_address=None):
        """
        Process M-Pesa callback data.
        
        Args:
            callback_data: Callback payload from M-Pesa
            ip_address: IP address of callback request
        
        Returns:
            Processed payment or None
        """
        try:
            tenant = get_current_tenant()
            
            # Log callback
            callback_log = PaymentCallback.objects.create(
                tenant=tenant,
                provider='mpesa',
                callback_data=callback_data,
                ip_address=ip_address
            )
            
            # Extract callback data
            body = callback_data.get('Body', {})
            stk_callback = body.get('stkCallback', {})
            
            checkout_request_id = stk_callback.get('CheckoutRequestID')
            result_code = stk_callback.get('ResultCode')
            result_desc = stk_callback.get('ResultDesc')
            
            if not checkout_request_id:
                logger.error("No CheckoutRequestID in callback")
                callback_log.processing_error = "Missing CheckoutRequestID"
                callback_log.save()
                return None
            
            # Find payment request
            try:
                payment_request = PaymentRequest.objects.get(
                    provider_request_id=checkout_request_id,
                    tenant=tenant
                )
                callback_log.payment_request = payment_request
                callback_log.save()
                
            except PaymentRequest.DoesNotExist:
                logger.error(f"Payment request not found: {checkout_request_id}")
                callback_log.processing_error = "Payment request not found"
                callback_log.save()
                return None
            
            # Check if already processed (idempotency)
            if payment_request.status == 'completed':
                logger.info(f"Payment request already processed: {payment_request.request_id}")
                callback_log.is_processed = True
                callback_log.processed_at = timezone.now()
                callback_log.save()
                return payment_request.payment
            
            # Process based on result code
            if result_code == 0:
                # Success
                callback_metadata = stk_callback.get('CallbackMetadata', {})
                items = callback_metadata.get('Item', [])
                
                # Extract metadata
                metadata = {}
                for item in items:
                    name = item.get('Name')
                    value = item.get('Value')
                    metadata[name] = value
                
                # Create payment record
                payment = Payment.objects.create(
                    tenant=tenant,
                    payment_reference=f"PAY-{timezone.now().strftime('%Y%m%d%H%M%S')}-{payment_request.invoice.id}",
                    invoice=payment_request.invoice,
                    student=payment_request.student,
                    amount=metadata.get('Amount', payment_request.amount),
                    currency='KES',
                    payment_method='mpesa',
                    payment_date=timezone.now(),
                    transaction_id=metadata.get('MpesaReceiptNumber', ''),
                    transaction_reference=checkout_request_id,
                    payer_name=metadata.get('PhoneNumber', ''),
                    payer_phone=metadata.get('PhoneNumber', ''),
                    status='completed'
                )
                
                # Update payment request
                payment_request.status = 'completed'
                payment_request.completed_at = timezone.now()
                payment_request.payment = payment
                payment_request.save()
                
                # Update invoice
                invoice = payment_request.invoice
                invoice.amount_paid += payment.amount
                invoice.balance = invoice.total_amount - invoice.amount_paid
                
                if invoice.balance <= 0:
                    invoice.status = 'paid'
                else:
                    invoice.status = 'partially_paid'
                
                invoice.save()
                
                # Mark callback as processed
                callback_log.is_processed = True
                callback_log.processed_at = timezone.now()
                callback_log.save()
                
                logger.info(f"Payment processed successfully: {payment.payment_reference}")
                
                return payment
                
            else:
                # Failed
                payment_request.status = 'failed'
                payment_request.provider_response['failure_reason'] = result_desc
                payment_request.save()
                
                callback_log.is_processed = True
                callback_log.processed_at = timezone.now()
                callback_log.processing_error = result_desc
                callback_log.save()
                
                logger.warning(f"Payment failed: {result_desc}")
                
                return None
                
        except Exception as e:
            logger.error(f"Callback processing failed: {str(e)}")
            if 'callback_log' in locals():
                callback_log.processing_error = str(e)
                callback_log.save()
            raise
    
    def verify_callback_signature(self, request):
        """
        Verify M-Pesa callback signature (if implemented by Safaricom).
        Currently M-Pesa doesn't provide signature verification,
        so we rely on IP whitelisting and HTTPS.
        """
        # TODO: Implement IP whitelisting
        # Safaricom callback IPs should be whitelisted
        return True
