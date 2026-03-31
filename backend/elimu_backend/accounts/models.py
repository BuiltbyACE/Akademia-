from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _
from tenants.models import Tenant
import uuid


class UserManager(BaseUserManager):
    """Custom user manager for email-based authentication"""
    
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Custom user model with email as username and multi-tenant support.
    Users can belong to multiple tenants with different roles.
    """
    ROLE_CHOICES = [
        ('super_admin', 'Super Admin'),
        ('admin', 'School Admin'),
        ('teacher', 'Teacher'),
        ('parent', 'Parent/Guardian'),
        ('student', 'Student'),
        ('finance', 'Finance Officer'),
        ('registrar', 'Registrar'),
        ('librarian', 'Librarian'),
        ('nurse', 'Nurse'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = None
    email = models.EmailField(_('email address'), unique=True)
    
    # Personal Information
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    middle_name = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    
    # Multi-Factor Authentication
    mfa_enabled = models.BooleanField(default=False)
    mfa_secret = models.CharField(max_length=32, blank=True)
    
    # Account Status
    is_active = models.BooleanField(default=True)
    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login_at = models.DateTimeField(null=True, blank=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    class Meta:
        db_table = 'users'
        ordering = ['email']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return self.email
    
    def get_full_name(self):
        """Return the full name of the user"""
        if self.middle_name:
            return f"{self.first_name} {self.middle_name} {self.last_name}"
        return f"{self.first_name} {self.last_name}"
    
    def get_short_name(self):
        """Return the short name for the user"""
        return self.first_name
    
    def get_tenants(self):
        """Get all tenants this user belongs to"""
        return Tenant.objects.filter(
            id__in=self.tenant_memberships.values_list('tenant_id', flat=True)
        )
    
    def get_role_for_tenant(self, tenant):
        """Get user's role for a specific tenant"""
        try:
            membership = self.tenant_memberships.get(tenant=tenant)
            return membership.role
        except TenantUser.DoesNotExist:
            return None


class TenantUser(models.Model):
    """
    Maps users to tenants with specific roles.
    A user can have different roles in different tenants.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='user_memberships'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='tenant_memberships'
    )
    role = models.CharField(max_length=20, choices=User.ROLE_CHOICES)
    
    # Permissions can be customized per user
    custom_permissions = models.JSONField(default=dict, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tenant_users'
        unique_together = [['tenant', 'user']]
        indexes = [
            models.Index(fields=['tenant', 'user']),
            models.Index(fields=['role']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.tenant.name} ({self.role})"


class Permission(models.Model):
    """
    Defines granular permissions for the system.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    codename = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    module = models.CharField(max_length=50, help_text="Module this permission belongs to")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'permissions'
        ordering = ['module', 'name']
    
    def __str__(self):
        return f"{self.module}.{self.codename}"


class Role(models.Model):
    """
    Defines roles with associated permissions.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='roles'
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    permissions = models.ManyToManyField(Permission, related_name='roles')
    
    # System roles cannot be deleted
    is_system_role = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'roles'
        unique_together = [['tenant', 'name']]
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.tenant.name})"


class AuditLog(models.Model):
    """
    Immutable audit trail for all critical actions.
    """
    ACTION_TYPES = [
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('payment', 'Payment'),
        ('export', 'Export'),
        ('import', 'Import'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='audit_logs',
        null=True,
        blank=True
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    
    # Action details
    action = models.CharField(max_length=20, choices=ACTION_TYPES)
    model_name = models.CharField(max_length=100)
    object_id = models.CharField(max_length=100, blank=True)
    
    # Change tracking
    changes = models.JSONField(
        default=dict,
        help_text="Before/after snapshot of changes"
    )
    
    # Request metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    request_id = models.CharField(max_length=100, blank=True)
    
    # Timestamp
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'audit_logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['tenant', 'timestamp']),
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['action', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.action} - {self.model_name} by {self.user} at {self.timestamp}"
