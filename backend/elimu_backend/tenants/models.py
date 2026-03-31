from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.core.validators import RegexValidator
import uuid


class Tenant(models.Model):
    """
    Represents a school/institution in the multi-tenant system.
    Each tenant is completely isolated from others.
    """
    SUBSCRIPTION_TIERS = [
        ('basic', 'Basic'),
        ('pro', 'Professional'),
        ('enterprise', 'Enterprise'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('trial', 'Trial'),
        ('inactive', 'Inactive'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, help_text="School/Institution name")
    slug = models.SlugField(max_length=100, unique=True, help_text="URL-friendly identifier")
    
    # Contact Information
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    website = models.URLField(blank=True)
    
    # Address
    address_line1 = models.CharField(max_length=255, blank=True)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default='Kenya')
    postal_code = models.CharField(max_length=20, blank=True)
    
    # Subscription & Status
    subscription_tier = models.CharField(
        max_length=20,
        choices=SUBSCRIPTION_TIERS,
        default='basic'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='trial'
    )
    
    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    trial_ends_at = models.DateTimeField(null=True, blank=True)
    subscription_ends_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    logo = models.ImageField(upload_to='tenant_logos/', null=True, blank=True)
    timezone = models.CharField(max_length=50, default='Africa/Nairobi')
    language = models.CharField(max_length=10, default='en')
    currency = models.CharField(max_length=3, default='KES')
    
    # Feature flags
    features_enabled = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'tenants'
        ordering = ['name']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return self.name
    
    def is_active(self):
        return self.status == 'active'


class TenantConfig(models.Model):
    """
    Stores configuration settings for each tenant.
    This allows customization without code changes.
    """
    tenant = models.OneToOneField(
        Tenant,
        on_delete=models.CASCADE,
        related_name='config'
    )
    
    # Academic Configuration
    academic_year_start_month = models.IntegerField(default=1, help_text="Month when academic year starts (1-12)")
    academic_year_end_month = models.IntegerField(default=12, help_text="Month when academic year ends (1-12)")
    terms_per_year = models.IntegerField(default=3, help_text="Number of terms/semesters per year")
    
    # Grading Configuration
    grading_system = models.JSONField(
        default=dict,
        help_text="Grading scale configuration (e.g., A=90-100, B=80-89)"
    )
    pass_mark = models.DecimalField(max_digits=5, decimal_places=2, default=50.00)
    
    # Attendance Configuration
    attendance_tracking_mode = models.CharField(
        max_length=20,
        choices=[
            ('daily', 'Daily'),
            ('per_period', 'Per Period'),
            ('both', 'Both'),
        ],
        default='daily'
    )
    late_threshold_minutes = models.IntegerField(default=15)
    absence_alert_threshold = models.IntegerField(
        default=3,
        help_text="Number of consecutive absences before alert"
    )
    
    # Fee Configuration
    fee_payment_deadline_day = models.IntegerField(
        default=5,
        help_text="Day of month for fee payment deadline"
    )
    late_payment_penalty_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00
    )
    allow_partial_payments = models.BooleanField(default=True)
    
    # Communication Configuration
    sms_notifications_enabled = models.BooleanField(default=True)
    email_notifications_enabled = models.BooleanField(default=True)
    whatsapp_notifications_enabled = models.BooleanField(default=False)
    
    # Notification Templates
    notification_templates = models.JSONField(
        default=dict,
        help_text="Custom notification message templates"
    )
    
    # Report Card Configuration
    report_card_template = models.CharField(
        max_length=50,
        default='standard',
        help_text="Report card template to use"
    )
    include_teacher_comments = models.BooleanField(default=True)
    include_principal_comments = models.BooleanField(default=True)
    
    # Additional Settings
    custom_settings = models.JSONField(
        default=dict,
        blank=True,
        help_text="Additional custom settings"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tenant_configs'
    
    def __str__(self):
        return f"Config for {self.tenant.name}"


class TenantDomain(models.Model):
    """
    Allows tenants to have custom domains (for white-labeling).
    """
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='domains'
    )
    domain = models.CharField(max_length=255, unique=True)
    is_primary = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'tenant_domains'
        unique_together = [['tenant', 'is_primary']]
    
    def __str__(self):
        return f"{self.domain} -> {self.tenant.name}"
