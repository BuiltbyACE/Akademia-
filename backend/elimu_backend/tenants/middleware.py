"""
Tenant middleware for multi-tenant request handling.
"""
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from .utils import set_current_tenant, clear_current_tenant, get_tenant_from_request


class TenantMiddleware(MiddlewareMixin):
    """
    Middleware that sets the current tenant for each request.
    This ensures all database queries are automatically scoped to the tenant.
    """
    
    # Paths that don't require tenant context
    TENANT_EXEMPT_PATHS = [
        '/admin/',
        '/api/auth/login/',
        '/api/auth/register/',
        '/api/auth/token/',
        '/api/v1/auth/login/',
        '/api/v1/auth/register/',
        '/api/v1/tenants/register/',
        '/api/schema/',
        '/api/docs/',
        '/health/',
        '/static/',
        '/media/',
    ]
    
    def process_request(self, request):
        """
        Extract tenant from request and set it in thread-local storage.
        """
        # Clear any existing tenant context
        clear_current_tenant()
        
        # Check if path is exempt from tenant requirement
        path = request.path
        if any(path.startswith(exempt) for exempt in self.TENANT_EXEMPT_PATHS):
            return None
        
        # Get tenant from request
        tenant = get_tenant_from_request(request)
        
        if not tenant:
            return JsonResponse(
                {
                    'error': 'Tenant not found',
                    'detail': 'Please provide a valid tenant identifier via X-Tenant-Slug header or subdomain.'
                },
                status=400
            )
        
        # Set tenant in thread-local storage
        set_current_tenant(tenant)
        
        # Attach tenant to request for easy access
        request.tenant = tenant
        
        return None
    
    def process_response(self, request, response):
        """
        Clear tenant context after request is processed.
        """
        clear_current_tenant()
        return response
    
    def process_exception(self, request, exception):
        """
        Clear tenant context if an exception occurs.
        """
        clear_current_tenant()
        return None
