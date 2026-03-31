"""
Notification service for managing multi-channel notifications.
Orchestrates SMS, Email, and In-App notifications.
"""
import logging
from django.db import transaction
from django.utils import timezone
from communications.models import Notification, BroadcastMessage
from communications.services.sms_service import SMSService
from communications.services.email_service import EmailService
from communications.services.template_service import TemplateService
from tenants.utils import get_current_tenant

logger = logging.getLogger(__name__)


class NotificationService:
    """
    Service for creating and sending multi-channel notifications.
    """
    
    def __init__(self):
        self.sms_service = SMSService()
        self.email_service = EmailService()
        self.template_service = TemplateService()
    
    @transaction.atomic
    def create_notification(self, channel, recipient_type, recipient_id=None, 
                          recipient_email=None, recipient_phone=None,
                          subject='', message='', template_type=None, 
                          context=None, student=None, priority=5, 
                          scheduled_for=None):
        """
        Create a notification record.
        
        Args:
            channel: 'sms', 'email', or 'in_app'
            recipient_type: 'user', 'guardian', or 'custom'
            recipient_id: User or Guardian ID
            recipient_email: Email address (for custom recipients)
            recipient_phone: Phone number (for custom recipients)
            subject: Notification subject
            message: Notification message
            template_type: Optional template type to use
            context: Context for template rendering
            student: Related student
            priority: Priority (1=highest, 10=lowest)
            scheduled_for: Optional scheduled delivery time
        
        Returns:
            Notification object
        """
        tenant = get_current_tenant()
        
        # Render template if provided
        if template_type and context:
            rendered = self.template_service.render_notification(
                template_type=template_type,
                context=context,
                channel=channel
            )
            subject = rendered['subject'] or subject
            message = rendered['message'] or message
        
        # Create notification
        notification_data = {
            'tenant': tenant,
            'channel': channel,
            'subject': subject,
            'message': message,
            'priority': priority,
            'status': 'pending'
        }
        
        # Set recipient based on type
        if recipient_type == 'user':
            from accounts.models import User
            notification_data['recipient_user_id'] = recipient_id
        elif recipient_type == 'guardian':
            from sis.models import Guardian
            notification_data['recipient_guardian_id'] = recipient_id
        else:
            notification_data['recipient_email'] = recipient_email
            notification_data['recipient_phone'] = recipient_phone
        
        if student:
            notification_data['student'] = student
        
        if scheduled_for:
            notification_data['scheduled_for'] = scheduled_for
        
        notification = Notification.objects.create(**notification_data)
        
        logger.info(f"Notification created: {notification.id} ({channel})")
        
        return notification
    
    def send_notification(self, notification_id):
        """
        Send a notification via its specified channel.
        
        Args:
            notification_id: Notification ID
        
        Returns:
            dict: Delivery result
        """
        try:
            notification = Notification.objects.select_related(
                'recipient_user', 'recipient_guardian', 'tenant'
            ).get(id=notification_id)
            
            # Check if already sent
            if notification.status == 'sent':
                logger.info(f"Notification {notification_id} already sent")
                return {'success': True, 'message': 'Already sent'}
            
            # Check if scheduled for future
            if notification.scheduled_for and notification.scheduled_for > timezone.now():
                logger.info(f"Notification {notification_id} scheduled for {notification.scheduled_for}")
                return {'success': True, 'message': 'Scheduled for future'}
            
            # Get recipient contact info
            email = self._get_recipient_email(notification)
            phone = self._get_recipient_phone(notification)
            
            # Send based on channel
            if notification.channel == 'sms':
                if not phone:
                    raise ValueError("No phone number available for SMS")
                result = self._send_sms(notification, phone)
            elif notification.channel == 'email':
                if not email:
                    raise ValueError("No email address available")
                result = self._send_email(notification, email)
            elif notification.channel == 'in_app':
                result = self._send_in_app(notification)
            else:
                raise ValueError(f"Unsupported channel: {notification.channel}")
            
            # Update notification status
            if result['success']:
                notification.status = 'sent'
                notification.sent_at = timezone.now()
                notification.delivery_status = 'delivered'
            else:
                notification.status = 'failed'
                notification.error_message = result.get('error', 'Unknown error')
            
            notification.save()
            
            return result
            
        except Notification.DoesNotExist:
            logger.error(f"Notification not found: {notification_id}")
            return {'success': False, 'error': 'Notification not found'}
        except Exception as e:
            logger.error(f"Failed to send notification {notification_id}: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _get_recipient_email(self, notification):
        """Get email address from notification recipient."""
        if notification.recipient_email:
            return notification.recipient_email
        elif notification.recipient_user:
            return notification.recipient_user.email
        elif notification.recipient_guardian:
            return notification.recipient_guardian.email
        return None
    
    def _get_recipient_phone(self, notification):
        """Get phone number from notification recipient."""
        if notification.recipient_phone:
            return notification.recipient_phone
        elif notification.recipient_user:
            return notification.recipient_user.phone
        elif notification.recipient_guardian:
            return notification.recipient_guardian.phone
        return None
    
    def _send_sms(self, notification, phone):
        """Send SMS notification."""
        result = self.sms_service.send_sms(
            phone_number=phone,
            message=notification.message
        )
        return result
    
    def _send_email(self, notification, email):
        """Send email notification."""
        result = self.email_service.send_email(
            to_email=email,
            subject=notification.subject,
            message=notification.message
        )
        return result
    
    def _send_in_app(self, notification):
        """Mark as sent for in-app notification (already in database)."""
        return {'success': True, 'message': 'In-app notification created'}
    
    def send_bulk_notifications(self, notifications):
        """
        Send multiple notifications.
        
        Args:
            notifications: List of notification IDs or queryset
        
        Returns:
            dict: Summary of results
        """
        results = {
            'total': len(notifications),
            'successful': 0,
            'failed': 0,
            'details': []
        }
        
        for notification_id in notifications:
            result = self.send_notification(notification_id)
            
            if result['success']:
                results['successful'] += 1
            else:
                results['failed'] += 1
            
            results['details'].append({
                'notification_id': notification_id,
                'success': result['success'],
                'error': result.get('error')
            })
        
        return results
    
    @transaction.atomic
    def create_broadcast(self, title, message, target_audience, 
                        send_via_sms=False, send_via_email=False, 
                        send_via_in_app=True, target_filters=None,
                        scheduled_for=None, created_by=None):
        """
        Create a broadcast message.
        
        Args:
            title: Broadcast title
            message: Broadcast message
            target_audience: Target audience type
            send_via_sms: Send via SMS
            send_via_email: Send via email
            send_via_in_app: Send via in-app
            target_filters: Additional filters
            scheduled_for: Optional scheduled time
            created_by: User creating the broadcast
        
        Returns:
            BroadcastMessage object
        """
        tenant = get_current_tenant()
        
        broadcast = BroadcastMessage.objects.create(
            tenant=tenant,
            title=title,
            message=message,
            target_audience=target_audience,
            target_filters=target_filters or {},
            send_via_sms=send_via_sms,
            send_via_email=send_via_email,
            send_via_in_app=send_via_in_app,
            scheduled_for=scheduled_for,
            created_by=created_by,
            status='draft' if scheduled_for else 'scheduled'
        )
        
        logger.info(f"Broadcast created: {broadcast.id} - {title}")
        
        return broadcast
    
    def send_broadcast(self, broadcast_id):
        """
        Send a broadcast message to all recipients.
        
        Args:
            broadcast_id: BroadcastMessage ID
        
        Returns:
            dict: Summary of results
        """
        try:
            broadcast = BroadcastMessage.objects.get(id=broadcast_id)
            
            # Get recipients based on target audience
            recipients = self._get_broadcast_recipients(broadcast)
            
            broadcast.total_recipients = len(recipients)
            broadcast.status = 'sending'
            broadcast.save()
            
            sent_count = 0
            failed_count = 0
            
            # Create notifications for each recipient
            for recipient in recipients:
                try:
                    # Create notifications based on selected channels
                    if broadcast.send_via_sms and recipient.get('phone'):
                        notification = self.create_notification(
                            channel='sms',
                            recipient_type=recipient['type'],
                            recipient_id=recipient.get('id'),
                            recipient_phone=recipient.get('phone'),
                            message=broadcast.message,
                            priority=3
                        )
                        result = self.send_notification(notification.id)
                        if result['success']:
                            sent_count += 1
                        else:
                            failed_count += 1
                    
                    if broadcast.send_via_email and recipient.get('email'):
                        notification = self.create_notification(
                            channel='email',
                            recipient_type=recipient['type'],
                            recipient_id=recipient.get('id'),
                            recipient_email=recipient.get('email'),
                            subject=broadcast.title,
                            message=broadcast.message,
                            priority=3
                        )
                        result = self.send_notification(notification.id)
                        if result['success']:
                            sent_count += 1
                        else:
                            failed_count += 1
                    
                    if broadcast.send_via_in_app:
                        notification = self.create_notification(
                            channel='in_app',
                            recipient_type=recipient['type'],
                            recipient_id=recipient.get('id'),
                            subject=broadcast.title,
                            message=broadcast.message,
                            priority=3
                        )
                        sent_count += 1
                
                except Exception as e:
                    failed_count += 1
                    logger.error(f"Failed to send broadcast to recipient: {str(e)}")
            
            # Update broadcast status
            broadcast.sent_count = sent_count
            broadcast.failed_count = failed_count
            broadcast.status = 'sent'
            broadcast.sent_at = timezone.now()
            broadcast.save()
            
            logger.info(f"Broadcast sent: {broadcast_id} - {sent_count} successful, {failed_count} failed")
            
            return {
                'success': True,
                'total_recipients': broadcast.total_recipients,
                'sent_count': sent_count,
                'failed_count': failed_count
            }
            
        except BroadcastMessage.DoesNotExist:
            logger.error(f"Broadcast not found: {broadcast_id}")
            return {'success': False, 'error': 'Broadcast not found'}
        except Exception as e:
            logger.error(f"Broadcast sending failed: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _get_broadcast_recipients(self, broadcast):
        """
        Get recipients for a broadcast based on target audience.
        
        Args:
            broadcast: BroadcastMessage object
        
        Returns:
            list: List of recipient dictionaries
        """
        from sis.models import Guardian
        from accounts.models import User
        
        recipients = []
        tenant = broadcast.tenant
        
        if broadcast.target_audience == 'all_parents':
            guardians = Guardian.objects.filter(tenant=tenant)
            for guardian in guardians:
                recipients.append({
                    'type': 'guardian',
                    'id': guardian.id,
                    'email': guardian.email,
                    'phone': guardian.phone
                })
        
        elif broadcast.target_audience == 'all_teachers':
            from accounts.models import TenantUser
            teachers = TenantUser.objects.filter(
                tenant=tenant,
                role='teacher',
                is_active=True
            ).select_related('user')
            for teacher in teachers:
                recipients.append({
                    'type': 'user',
                    'id': teacher.user.id,
                    'email': teacher.user.email,
                    'phone': teacher.user.phone
                })
        
        elif broadcast.target_audience == 'all_students':
            from accounts.models import TenantUser
            students = TenantUser.objects.filter(
                tenant=tenant,
                role='student',
                is_active=True
            ).select_related('user')
            for student in students:
                recipients.append({
                    'type': 'user',
                    'id': student.user.id,
                    'email': student.user.email,
                    'phone': student.user.phone
                })
        
        # Apply additional filters if provided
        # TODO: Implement filtering logic based on target_filters
        
        return recipients
