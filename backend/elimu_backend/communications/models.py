from django.db import models
from tenants.base_models import TenantAwareTimestampedModel
from accounts.models import User
from sis.models import Student, Guardian
import uuid


class NotificationTemplate(TenantAwareTimestampedModel):
    """
    Reusable notification templates.
    """
    TEMPLATE_TYPES = [
        ('fee_reminder', 'Fee Reminder'),
        ('attendance_alert', 'Attendance Alert'),
        ('exam_schedule', 'Exam Schedule'),
        ('behavior_alert', 'Behavior Alert'),
        ('general_announcement', 'General Announcement'),
        ('payment_confirmation', 'Payment Confirmation'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    template_type = models.CharField(max_length=50, choices=TEMPLATE_TYPES)
    
    # Template content with placeholders
    subject = models.CharField(max_length=255, blank=True)
    sms_template = models.TextField(blank=True, help_text="SMS message template")
    email_template = models.TextField(blank=True, help_text="Email message template")
    
    # Status
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'notification_templates'
        unique_together = [['tenant', 'name']]
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.template_type})"


class Notification(TenantAwareTimestampedModel):
    """
    Notification queue for multi-channel delivery.
    """
    CHANNELS = [
        ('sms', 'SMS'),
        ('email', 'Email'),
        ('in_app', 'In-App'),
        ('whatsapp', 'WhatsApp'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Recipient
    recipient_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications_received'
    )
    recipient_guardian = models.ForeignKey(
        Guardian,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications_received'
    )
    recipient_email = models.EmailField(blank=True)
    recipient_phone = models.CharField(max_length=20, blank=True)
    
    # Message content
    channel = models.CharField(max_length=20, choices=CHANNELS)
    subject = models.CharField(max_length=255, blank=True)
    message = models.TextField()
    
    # Template reference
    template = models.ForeignKey(
        NotificationTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications'
    )
    
    # Related entities
    student = models.ForeignKey(
        Student,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='related_notifications'
    )
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Delivery tracking
    sent_at = models.DateTimeField(null=True, blank=True)
    delivery_status = models.CharField(max_length=100, blank=True)
    error_message = models.TextField(blank=True)
    
    # Priority
    priority = models.IntegerField(default=5, help_text="1=highest, 10=lowest")
    
    # Scheduled delivery
    scheduled_for = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['tenant', 'recipient_user']),
            models.Index(fields=['channel']),
            models.Index(fields=['scheduled_for']),
        ]
    
    def __str__(self):
        return f"{self.channel} - {self.subject or self.message[:50]}"


class BroadcastMessage(TenantAwareTimestampedModel):
    """
    Broadcast messages to groups of recipients.
    """
    TARGET_AUDIENCES = [
        ('all_parents', 'All Parents'),
        ('all_students', 'All Students'),
        ('all_teachers', 'All Teachers'),
        ('grade_specific', 'Specific Grade'),
        ('class_specific', 'Specific Class'),
        ('custom', 'Custom Selection'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('scheduled', 'Scheduled'),
        ('sending', 'Sending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    title = models.CharField(max_length=255)
    message = models.TextField()
    
    # Targeting
    target_audience = models.CharField(max_length=50, choices=TARGET_AUDIENCES)
    target_filters = models.JSONField(
        default=dict,
        blank=True,
        help_text="Additional filters for targeting"
    )
    
    # Channels
    send_via_sms = models.BooleanField(default=False)
    send_via_email = models.BooleanField(default=False)
    send_via_in_app = models.BooleanField(default=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Scheduling
    scheduled_for = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    
    # Statistics
    total_recipients = models.IntegerField(default=0)
    sent_count = models.IntegerField(default=0)
    failed_count = models.IntegerField(default=0)
    
    # Creator
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='broadcasts_created'
    )
    
    class Meta:
        db_table = 'broadcast_messages'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['scheduled_for']),
        ]
    
    def __str__(self):
        return self.title
