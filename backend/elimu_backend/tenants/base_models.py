"""
Base models for multi-tenant architecture.
All tenant-scoped models should inherit from TenantAwareModel.
"""
from django.db import models
from django.core.exceptions import ValidationError
from .utils import get_current_tenant


class TenantAwareModel(models.Model):
    """
    Abstract base model that adds tenant_id to all models.
    Ensures tenant isolation at the database level.
    """
    tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        related_name='%(class)s_set',
        db_index=True,
        editable=False
    )
    
    class Meta:
        abstract = True
        
    def save(self, *args, **kwargs):
        if not self.tenant_id:
            current_tenant = get_current_tenant()
            if not current_tenant:
                raise ValidationError(
                    "Cannot save tenant-aware model without tenant context. "
                    "Ensure tenant middleware is properly configured."
                )
            self.tenant = current_tenant
        super().save(*args, **kwargs)
    
    @classmethod
    def get_queryset_for_tenant(cls, tenant):
        """Get queryset filtered by tenant"""
        return cls.objects.filter(tenant=tenant)


class TimestampedModel(models.Model):
    """
    Abstract base model that adds created_at and updated_at timestamps.
    """
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True


class TenantAwareTimestampedModel(TenantAwareModel, TimestampedModel):
    """
    Combines tenant awareness with timestamps.
    Most models should inherit from this.
    """
    class Meta:
        abstract = True


class SoftDeleteModel(models.Model):
    """
    Abstract base model for soft deletes.
    Records are marked as deleted instead of being removed from database.
    """
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        abstract = True
    
    def delete(self, using=None, keep_parents=False, hard_delete=False):
        """Soft delete by default, unless hard_delete=True"""
        if hard_delete:
            return super().delete(using=using, keep_parents=keep_parents)
        
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(update_fields=['is_deleted', 'deleted_at'])
    
    def restore(self):
        """Restore a soft-deleted record"""
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=['is_deleted', 'deleted_at'])
