"""
Celery tasks for communications module.
Handles async notification delivery and processing.
"""
from celery import shared_task
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def send_notification_async(self, notification_id):
    """
    Send a notification asynchronously.
    
    Args:
        notification_id: Notification ID to send
    """
    from communications.services import NotificationService
    
    try:
        service = NotificationService()
        result = service.send_notification(notification_id)
        
        if not result['success']:
            # Retry on failure
            raise Exception(result.get('error', 'Unknown error'))
        
        return result
        
    except Exception as e:
        logger.error(f"Notification sending failed: {str(e)}")
        # Retry with exponential backoff
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))


@shared_task
def send_pending_notifications():
    """
    Send all pending notifications.
    Runs periodically via Celery Beat.
    """
    from communications.models import Notification
    from communications.services import NotificationService
    
    try:
        # Get pending notifications
        pending = Notification.objects.filter(
            status='pending',
            scheduled_for__lte=timezone.now()
        ) | Notification.objects.filter(
            status='pending',
            scheduled_for__isnull=True
        )
        
        service = NotificationService()
        
        sent_count = 0
        failed_count = 0
        
        for notification in pending[:100]:  # Process in batches of 100
            try:
                result = service.send_notification(notification.id)
                if result['success']:
                    sent_count += 1
                else:
                    failed_count += 1
            except Exception as e:
                failed_count += 1
                logger.error(f"Failed to send notification {notification.id}: {str(e)}")
        
        logger.info(f"Sent {sent_count} notifications, {failed_count} failed")
        
        return {
            'sent': sent_count,
            'failed': failed_count
        }
        
    except Exception as e:
        logger.error(f"Failed to send pending notifications: {str(e)}")


@shared_task
def send_broadcast_async(broadcast_id):
    """
    Send a broadcast message asynchronously.
    
    Args:
        broadcast_id: BroadcastMessage ID
    """
    from communications.services import NotificationService
    
    try:
        service = NotificationService()
        result = service.send_broadcast(broadcast_id)
        
        logger.info(f"Broadcast {broadcast_id} sent: {result}")
        
        return result
        
    except Exception as e:
        logger.error(f"Broadcast sending failed: {str(e)}")
        raise


@shared_task
def process_scheduled_broadcasts():
    """
    Process scheduled broadcasts.
    Runs periodically via Celery Beat.
    """
    from communications.models import BroadcastMessage
    
    try:
        # Get scheduled broadcasts that are due
        scheduled = BroadcastMessage.objects.filter(
            status='scheduled',
            scheduled_for__lte=timezone.now()
        )
        
        for broadcast in scheduled:
            try:
                send_broadcast_async.delay(str(broadcast.id))
                logger.info(f"Queued broadcast {broadcast.id} for sending")
            except Exception as e:
                logger.error(f"Failed to queue broadcast {broadcast.id}: {str(e)}")
        
        return {'processed': scheduled.count()}
        
    except Exception as e:
        logger.error(f"Failed to process scheduled broadcasts: {str(e)}")


@shared_task
def cleanup_old_notifications(days=90):
    """
    Clean up old sent notifications.
    
    Args:
        days: Number of days to keep notifications
    """
    from communications.models import Notification
    from datetime import timedelta
    
    try:
        cutoff_date = timezone.now() - timedelta(days=days)
        
        deleted_count = Notification.objects.filter(
            status='sent',
            sent_at__lt=cutoff_date
        ).delete()[0]
        
        logger.info(f"Deleted {deleted_count} old notifications")
        
        return {'deleted': deleted_count}
        
    except Exception as e:
        logger.error(f"Failed to cleanup old notifications: {str(e)}")


@shared_task
def send_sms_notification(phone_number, message):
    """
    Send SMS notification directly.
    
    Args:
        phone_number: Recipient phone number
        message: SMS message
    """
    from communications.services import SMSService
    
    try:
        sms_service = SMSService()
        result = sms_service.send_sms(phone_number, message)
        
        logger.info(f"SMS sent to {phone_number}: {result}")
        
        return result
        
    except Exception as e:
        logger.error(f"SMS sending failed: {str(e)}")
        raise


@shared_task
def send_email_notification(to_email, subject, message, html_message=None):
    """
    Send email notification directly.
    
    Args:
        to_email: Recipient email
        subject: Email subject
        message: Email message
        html_message: Optional HTML message
    """
    from communications.services import EmailService
    
    try:
        email_service = EmailService()
        result = email_service.send_email(
            to_email=to_email,
            subject=subject,
            message=message,
            html_message=html_message
        )
        
        logger.info(f"Email sent to {to_email}: {result}")
        
        return result
        
    except Exception as e:
        logger.error(f"Email sending failed: {str(e)}")
        raise


@shared_task
def send_bulk_sms(recipients, message):
    """
    Send SMS to multiple recipients.
    
    Args:
        recipients: List of phone numbers
        message: SMS message
    """
    from communications.services import SMSService
    
    try:
        sms_service = SMSService()
        result = sms_service.send_bulk_sms(recipients, message)
        
        logger.info(f"Bulk SMS sent: {result}")
        
        return result
        
    except Exception as e:
        logger.error(f"Bulk SMS sending failed: {str(e)}")
        raise


@shared_task
def send_bulk_email(recipients, subject, message, html_message=None):
    """
    Send email to multiple recipients.
    
    Args:
        recipients: List of email addresses
        subject: Email subject
        message: Email message
        html_message: Optional HTML message
    """
    from communications.services import EmailService
    
    try:
        email_service = EmailService()
        result = email_service.send_bulk_email(
            recipients=recipients,
            subject=subject,
            message=message,
            html_message=html_message
        )
        
        logger.info(f"Bulk email sent: {result}")
        
        return result
        
    except Exception as e:
        logger.error(f"Bulk email sending failed: {str(e)}")
        raise


@shared_task
def create_default_templates_for_tenant(tenant_id):
    """
    Create default notification templates for a new tenant.
    
    Args:
        tenant_id: Tenant ID
    """
    from communications.services import TemplateService
    from tenants.models import Tenant
    
    try:
        tenant = Tenant.objects.get(id=tenant_id)
        template_service = TemplateService()
        
        templates = template_service.create_default_templates(tenant)
        
        logger.info(f"Created {len(templates)} default templates for tenant {tenant.name}")
        
        return {'created': len(templates)}
        
    except Tenant.DoesNotExist:
        logger.error(f"Tenant not found: {tenant_id}")
    except Exception as e:
        logger.error(f"Failed to create default templates: {str(e)}")


@shared_task
def retry_failed_notifications():
    """
    Retry failed notifications.
    Runs periodically via Celery Beat.
    """
    from communications.models import Notification
    from datetime import timedelta
    
    try:
        # Get failed notifications from last 24 hours
        cutoff_time = timezone.now() - timedelta(hours=24)
        
        failed = Notification.objects.filter(
            status='failed',
            created_at__gte=cutoff_time
        )
        
        retried_count = 0
        
        for notification in failed[:50]:  # Retry max 50 at a time
            try:
                # Reset status to pending
                notification.status = 'pending'
                notification.error_message = ''
                notification.save()
                
                # Queue for sending
                send_notification_async.delay(str(notification.id))
                retried_count += 1
                
            except Exception as e:
                logger.error(f"Failed to retry notification {notification.id}: {str(e)}")
        
        logger.info(f"Retried {retried_count} failed notifications")
        
        return {'retried': retried_count}
        
    except Exception as e:
        logger.error(f"Failed to retry notifications: {str(e)}")


@shared_task
def generate_notification_report(tenant_id, date_from, date_to):
    """
    Generate notification delivery report for a tenant.
    
    Args:
        tenant_id: Tenant ID
        date_from: Start date
        date_to: End date
    """
    from communications.models import Notification
    from tenants.models import Tenant
    from django.db.models import Count, Q
    
    try:
        tenant = Tenant.objects.get(id=tenant_id)
        
        notifications = Notification.objects.filter(
            tenant=tenant,
            created_at__gte=date_from,
            created_at__lte=date_to
        )
        
        report = {
            'tenant': tenant.name,
            'period': f"{date_from} to {date_to}",
            'total_notifications': notifications.count(),
            'by_status': {},
            'by_channel': {},
        }
        
        # Count by status
        status_counts = notifications.values('status').annotate(count=Count('id'))
        for item in status_counts:
            report['by_status'][item['status']] = item['count']
        
        # Count by channel
        channel_counts = notifications.values('channel').annotate(count=Count('id'))
        for item in channel_counts:
            report['by_channel'][item['channel']] = item['count']
        
        logger.info(f"Notification report generated for {tenant.name}")
        
        return report
        
    except Tenant.DoesNotExist:
        logger.error(f"Tenant not found: {tenant_id}")
    except Exception as e:
        logger.error(f"Failed to generate notification report: {str(e)}")
