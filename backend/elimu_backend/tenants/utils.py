"""
Utility functions for tenant management.
"""
import threading
from typing import Optional
from .models import Tenant

_thread_locals = threading.local()


def set_current_tenant(tenant: Optional[Tenant]) -> None:
    """
    Set the current tenant in thread-local storage.
    Called by TenantMiddleware for each request.
    """
    _thread_locals.tenant = tenant


def get_current_tenant() -> Optional[Tenant]:
    """
    Get the current tenant from thread-local storage.
    Returns None if no tenant is set.
    """
    return getattr(_thread_locals, 'tenant', None)


def clear_current_tenant() -> None:
    """
    Clear the current tenant from thread-local storage.
    """
    if hasattr(_thread_locals, 'tenant'):
        delattr(_thread_locals, 'tenant')


def get_tenant_from_request(request) -> Optional[Tenant]:
    """
    Extract tenant from request.
    Tries multiple methods:
    1. Custom header (X-Tenant-Slug)
    2. Subdomain
    3. Domain mapping
    """
    from .models import TenantDomain
    
    # Method 1: Check for tenant slug in header
    tenant_slug = request.headers.get('X-Tenant-Slug')
    if tenant_slug:
        try:
            return Tenant.objects.get(slug=tenant_slug, status='active')
        except Tenant.DoesNotExist:
            pass
    
    # Method 2: Check subdomain
    host = request.get_host().split(':')[0]
    parts = host.split('.')
    
    if len(parts) > 2:
        subdomain = parts[0]
        try:
            return Tenant.objects.get(slug=subdomain, status='active')
        except Tenant.DoesNotExist:
            pass
    
    # Method 3: Check custom domain mapping
    try:
        domain = TenantDomain.objects.select_related('tenant').get(
            domain=host,
            is_verified=True
        )
        if domain.tenant.is_active():
            return domain.tenant
    except TenantDomain.DoesNotExist:
        pass
    
    return None
