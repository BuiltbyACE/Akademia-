# Phase 4: Communication System - Implementation Guide

## Overview

Phase 4 implements a comprehensive multi-channel notification system supporting SMS, Email, and In-App messaging. The system includes template management, async delivery, delivery tracking, and broadcast messaging capabilities.

## Components Implemented

### 1. SMS Service (`communications/services/sms_service.py`)

**Purpose**: Send SMS notifications via multiple providers

**Supported Providers**:
- **Africa's Talking** (default - popular in Africa)
- **Twilio** (alternative provider)

**Key Features**:
- Multi-provider support
- Phone number validation and formatting
- Bulk SMS sending
- Delivery status tracking
- International format handling

**Main Methods**:
```python
# Send single SMS
sms_service = SMSService()
result = sms_service.send_sms(
    phone_number='0712345678',
    message='Your payment has been received.'
)

# Send bulk SMS
result = sms_service.send_bulk_sms(
    recipients=['0712345678', '0723456789'],
    message='School will close early today.'
)

# Validate phone number
is_valid, formatted = sms_service.validate_phone_number('0712345678')
# Returns: (True, '+254712345678')
```

**Configuration**:
```env
# Africa's Talking
SMS_API_KEY=your_api_key
SMS_USERNAME=your_username

# Twilio (optional)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+1234567890
```

### 2. Email Service (`communications/services/email_service.py`)

**Purpose**: Send email notifications with template support

**Key Features**:
- Plain text and HTML emails
- Django template rendering
- Bulk email sending
- File attachments
- Email validation
- Pre-built notification templates

**Main Methods**:
```python
email_service = EmailService()

# Send simple email
result = email_service.send_email(
    to_email='parent@example.com',
    subject='Payment Receipt',
    message='Your payment has been received.',
    html_message='<p>Your payment has been received.</p>'
)

# Send template email
result = email_service.send_template_email(
    to_email='parent@example.com',
    subject='Payment Receipt',
    template_name='payment_receipt',
    context={
        'payment_reference': 'PAY-001',
        'amount': 5000,
        'student_name': 'John Doe'
    }
)

# Send with attachment
result = email_service.send_email_with_attachment(
    to_email='parent@example.com',
    subject='Report Card',
    message='Please find attached your child\'s report card.',
    attachment_path='/path/to/report.pdf'
)
```

**Pre-built Email Methods**:
- `send_payment_receipt()`: Payment confirmation emails
- `send_fee_reminder()`: Fee payment reminders
- `send_attendance_alert()`: Attendance notifications

### 3. Template Service (`communications/services/template_service.py`)

**Purpose**: Manage and render notification templates

**Key Features**:
- Variable substitution using `{{variable}}` syntax
- Template validation
- Default template creation
- Multi-channel templates (SMS & Email)

**Main Methods**:
```python
template_service = TemplateService()

# Render template
context = {
    'student_name': 'John Doe',
    'amount': 5000,
    'currency': 'KES'
}
rendered = template_service.render_notification(
    template_type='payment_confirmation',
    context=context,
    channel='sms'
)

# Create default templates for tenant
templates = template_service.create_default_templates(tenant)

# Validate template
is_valid, errors = template_service.validate_template(
    '{{student_name}} has {{status}} on {{date}}'
)
```

**Template Variables**:
Templates support dynamic variables:
- `{{student_name}}`: Student full name
- `{{guardian_name}}`: Guardian full name
- `{{amount}}`: Payment amount
- `{{currency}}`: Currency code
- `{{invoice_number}}`: Invoice number
- `{{date}}`: Date
- `{{school_name}}`: School name
- And more...

### 4. Notification Service (`communications/services/notification_service.py`)

**Purpose**: Orchestrate multi-channel notifications

**Key Features**:
- Multi-channel delivery (SMS, Email, In-App)
- Template-based notifications
- Scheduled notifications
- Broadcast messaging
- Delivery tracking
- Priority-based sending

**Main Methods**:
```python
notification_service = NotificationService()

# Create notification
notification = notification_service.create_notification(
    channel='sms',
    recipient_type='guardian',
    recipient_id=guardian.id,
    template_type='payment_confirmation',
    context={
        'student_name': 'John Doe',
        'amount': 5000,
        'receipt_number': 'RCP-001'
    },
    student=student,
    priority=3
)

# Send notification
result = notification_service.send_notification(notification.id)

# Create broadcast
broadcast = notification_service.create_broadcast(
    title='School Closure Notice',
    message='School will be closed tomorrow due to a public holiday.',
    target_audience='all_parents',
    send_via_sms=True,
    send_via_email=True
)

# Send broadcast
result = notification_service.send_broadcast(broadcast.id)
```

### 5. Celery Tasks (`communications/tasks.py`)

**Purpose**: Asynchronous notification processing

**Implemented Tasks**:

1. **send_notification_async**: Send single notification with retry
2. **send_pending_notifications**: Process pending notification queue (every 5 min)
3. **send_broadcast_async**: Send broadcast messages
4. **process_scheduled_broadcasts**: Process scheduled broadcasts (every 10 min)
5. **cleanup_old_notifications**: Clean up old notifications (weekly)
6. **retry_failed_notifications**: Retry failed notifications (every 6 hours)
7. **send_sms_notification**: Direct SMS sending
8. **send_email_notification**: Direct email sending
9. **send_bulk_sms**: Bulk SMS delivery
10. **send_bulk_email**: Bulk email delivery
11. **create_default_templates_for_tenant**: Setup templates for new tenant
12. **generate_notification_report**: Generate delivery reports

**Celery Beat Schedule**:
```python
CELERY_BEAT_SCHEDULE = {
    'send-pending-notifications': {
        'task': 'communications.tasks.send_pending_notifications',
        'schedule': crontab(minute='*/5'),  # Every 5 minutes
    },
    'process-scheduled-broadcasts': {
        'task': 'communications.tasks.process_scheduled_broadcasts',
        'schedule': crontab(minute='*/10'),  # Every 10 minutes
    },
    'retry-failed-notifications': {
        'task': 'communications.tasks.retry_failed_notifications',
        'schedule': crontab(hour='*/6', minute=0),  # Every 6 hours
    },
    'cleanup-old-notifications': {
        'task': 'communications.tasks.cleanup_old_notifications',
        'schedule': crontab(hour=2, minute=0, day_of_week=0),  # Weekly
    },
}
```

### 6. Django Admin Interface (`communications/admin.py`)

**Purpose**: Admin interface for notification management

**Features**:
- Template management
- Notification queue monitoring
- Broadcast message creation
- Delivery status tracking
- Bulk actions (resend, mark as sent/failed)

## Notification Flow

### 1. Single Notification Flow

```
1. Create Notification
   ↓
2. Store in Database (status: pending)
   ↓
3. Queue for Async Processing
   ↓
4. Celery Worker Picks Up Task
   ↓
5. Render Template (if applicable)
   ↓
6. Send via Channel (SMS/Email/In-App)
   ↓
7. Update Status (sent/failed)
   ↓
8. Log Delivery Status
```

### 2. Broadcast Flow

```
1. Create Broadcast Message
   ↓
2. Define Target Audience
   ↓
3. Select Channels (SMS/Email/In-App)
   ↓
4. Schedule or Send Immediately
   ↓
5. Get Recipients List
   ↓
6. Create Notification for Each Recipient
   ↓
7. Send via Selected Channels
   ↓
8. Track Delivery Statistics
```

### 3. Template-Based Notification

```
1. Select Template Type
   ↓
2. Provide Context Variables
   ↓
3. Render Template with Variables
   ↓
4. Create Notification with Rendered Content
   ↓
5. Send via Channel
```

## Database Schema

### Notification Template
```sql
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    name VARCHAR(200),
    template_type VARCHAR(50),
    subject VARCHAR(255),
    sms_template TEXT,
    email_template TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Notification
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    recipient_user_id UUID,
    recipient_guardian_id UUID,
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(20),
    channel VARCHAR(20),
    subject VARCHAR(255),
    message TEXT,
    template_id UUID,
    student_id UUID,
    status VARCHAR(20),
    sent_at TIMESTAMP,
    delivery_status VARCHAR(100),
    error_message TEXT,
    priority INTEGER DEFAULT 5,
    scheduled_for TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Broadcast Message
```sql
CREATE TABLE broadcast_messages (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    title VARCHAR(255),
    message TEXT,
    target_audience VARCHAR(50),
    target_filters JSONB,
    send_via_sms BOOLEAN DEFAULT FALSE,
    send_via_email BOOLEAN DEFAULT FALSE,
    send_via_in_app BOOLEAN DEFAULT TRUE,
    status VARCHAR(20),
    scheduled_for TIMESTAMP,
    sent_at TIMESTAMP,
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    created_by_id UUID,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Usage Examples

### 1. Send Payment Confirmation

```python
from communications.services import NotificationService
from sis.models import Student, StudentGuardian

# Get student and guardian
student = Student.objects.get(admission_number='2024001')
guardian_rel = StudentGuardian.objects.get(student=student, is_primary=True)
guardian = guardian_rel.guardian

# Send SMS notification
notification_service = NotificationService()
notification = notification_service.create_notification(
    channel='sms',
    recipient_type='guardian',
    recipient_id=guardian.id,
    template_type='payment_confirmation',
    context={
        'guardian_name': guardian.get_full_name(),
        'student_name': student.get_full_name(),
        'amount': 5000,
        'currency': 'KES',
        'receipt_number': 'RCP-20240101-001',
        'balance': 15000,
        'school_name': 'ABC School'
    },
    student=student,
    priority=2  # High priority
)

# Send immediately
result = notification_service.send_notification(notification.id)
```

### 2. Send Fee Reminder

```python
# Send email reminder
notification = notification_service.create_notification(
    channel='email',
    recipient_type='guardian',
    recipient_id=guardian.id,
    template_type='fee_reminder',
    context={
        'guardian_name': guardian.get_full_name(),
        'student_name': student.get_full_name(),
        'invoice_number': 'INV-2024-001',
        'amount': 20000,
        'currency': 'KES',
        'due_date': '2024-02-15',
        'days_overdue': 5,
        'school_name': 'ABC School'
    },
    student=student,
    priority=3
)

result = notification_service.send_notification(notification.id)
```

### 3. Send Attendance Alert

```python
# Send both SMS and Email
for channel in ['sms', 'email']:
    notification = notification_service.create_notification(
        channel=channel,
        recipient_type='guardian',
        recipient_id=guardian.id,
        template_type='attendance_alert',
        context={
            'guardian_name': guardian.get_full_name(),
            'student_name': student.get_full_name(),
            'date': '2024-01-15',
            'status': 'Absent',
            'message': 'Please contact the school if this is an error.',
            'school_name': 'ABC School'
        },
        student=student,
        priority=1  # Highest priority
    )
    notification_service.send_notification(notification.id)
```

### 4. Create Broadcast Announcement

```python
# Broadcast to all parents
broadcast = notification_service.create_broadcast(
    title='School Closure Notice',
    message='Dear Parents, the school will be closed tomorrow, January 20th, due to a public holiday. Classes will resume on January 21st.',
    target_audience='all_parents',
    send_via_sms=True,
    send_via_email=True,
    send_via_in_app=True,
    created_by=admin_user
)

# Send immediately
result = notification_service.send_broadcast(broadcast.id)

# Or schedule for later
from django.utils import timezone
from datetime import timedelta

broadcast = notification_service.create_broadcast(
    title='Exam Schedule',
    message='End of term exams will begin on February 1st. Please ensure your child is well prepared.',
    target_audience='all_parents',
    send_via_email=True,
    scheduled_for=timezone.now() + timedelta(days=7),
    created_by=admin_user
)
```

### 5. Send Async Notification

```python
from communications.tasks import send_notification_async

# Create notification
notification = notification_service.create_notification(...)

# Queue for async sending
send_notification_async.delay(str(notification.id))
```

## Default Templates

The system includes 6 default templates:

1. **Fee Payment Reminder**
2. **Payment Confirmation**
3. **Attendance Alert**
4. **Exam Schedule Notification**
5. **Behavior Alert**
6. **General Announcement**

Create default templates for a tenant:
```python
from communications.services import TemplateService

template_service = TemplateService()
templates = template_service.create_default_templates(tenant)
```

## Testing

### 1. Test SMS Sending

```python
from communications.services import SMSService

sms_service = SMSService(provider='africas_talking')

# Test with sandbox credentials
result = sms_service.send_sms(
    phone_number='+254712345678',
    message='Test message from Elimu School OS'
)

print(result)
# {'success': True, 'message_id': 'ATXid_...', 'status': 'Success'}
```

### 2. Test Email Sending

```python
from communications.services import EmailService

email_service = EmailService()

result = email_service.send_email(
    to_email='test@example.com',
    subject='Test Email',
    message='This is a test email from Elimu School OS.'
)

print(result)
# {'success': True, 'to_email': 'test@example.com', 'subject': 'Test Email'}
```

### 3. Test Template Rendering

```python
from communications.services import TemplateService

template_service = TemplateService()

context = {
    'student_name': 'John Doe',
    'amount': 5000,
    'currency': 'KES'
}

rendered = template_service.render_template(
    'Payment of {{currency}} {{amount}} received for {{student_name}}.',
    context
)

print(rendered)
# 'Payment of KES 5000 received for John Doe.'
```

## Monitoring & Logging

### Key Metrics

1. **Delivery Rate**: Sent / Total notifications
2. **Channel Performance**: Success rate per channel
3. **Average Delivery Time**: Time from creation to delivery
4. **Failed Notifications**: Count and reasons
5. **Broadcast Reach**: Recipients per broadcast

### Logging

```python
import logging

logger = logging.getLogger(__name__)

# Notification sent
logger.info(f"Notification sent: {notification.id} via {channel}")

# Notification failed
logger.error(f"Notification failed: {notification.id} - {error}")

# Broadcast sent
logger.info(f"Broadcast sent: {broadcast.id} - {sent_count} recipients")
```

## Security Considerations

1. **API Keys**: Store in environment variables
2. **Rate Limiting**: Prevent notification spam
3. **Recipient Validation**: Verify email/phone before sending
4. **Template Injection**: Sanitize template variables
5. **Delivery Tracking**: Log all notification attempts
6. **Privacy**: Don't log sensitive message content

## Cost Management

### SMS Cost Optimization

1. **Use Templates**: Shorter messages = lower cost
2. **Batch Sending**: Reduce API calls
3. **Priority-Based**: Send urgent messages only
4. **Opt-Out Support**: Respect user preferences
5. **Delivery Reports**: Track failed messages

### Email Cost Optimization

1. **HTML Templates**: Reusable designs
2. **Bulk Sending**: Batch email delivery
3. **Bounce Handling**: Remove invalid emails
4. **Unsubscribe**: Honor opt-out requests

## Troubleshooting

### Common Issues

**1. SMS Not Delivered**
- Check phone number format (+254XXXXXXXXX)
- Verify API credentials
- Check provider balance
- Review delivery reports

**2. Email Not Received**
- Check spam folder
- Verify email address
- Check email service configuration
- Review bounce logs

**3. Notification Stuck in Pending**
- Check Celery worker is running
- Review task queue
- Check for errors in logs
- Verify network connectivity

**4. Template Not Rendering**
- Validate template syntax
- Check variable names
- Verify context data
- Review template errors

## Next Steps

After Phase 4 completion:

1. **Phase 5**: REST API Layer - Build DRF endpoints for all services
2. **Phase 6**: Reporting & Analytics - PDF generation, dashboards
3. **Phase 7**: Frontend - Angular PWA with notification UI

## References

- [Africa's Talking API](https://africastalking.com/sms)
- [Twilio SMS API](https://www.twilio.com/docs/sms)
- [Django Email](https://docs.djangoproject.com/en/stable/topics/email/)
- [Celery Documentation](https://docs.celeryproject.org/)
