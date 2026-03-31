from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from tenants.models import Tenant, TenantConfig
from .models import TenantUser

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer with additional user data"""
    
    organization_id = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, attrs):
        # Get organization_id from request (optional)
        organization_id = attrs.pop('organization_id', None)
        
        # Validate credentials first
        data = super().validate(attrs)
        
        # Check if user is approved (active)
        if not self.user.is_active:
            raise serializers.ValidationError({
                'detail': 'Your account is pending admin approval'
            })
        
        # Get user's active tenant memberships
        tenant_users = TenantUser.objects.filter(
            user=self.user,
            is_active=True
        ).select_related('tenant')
        
        if not tenant_users.exists():
            raise serializers.ValidationError({
                'detail': 'You do not have access to any organization'
            })
        
        # If organization_id provided, use it; otherwise auto-select
        if organization_id:
            # Validate tenant exists and user has access
            try:
                tenant_user = tenant_users.get(tenant__slug=organization_id)
                tenant = tenant_user.tenant
            except TenantUser.DoesNotExist:
                raise serializers.ValidationError({
                    'detail': 'You do not have access to this organization'
                })
        else:
            # Auto-select first active tenant
            tenant_user = tenant_users.first()
            tenant = tenant_user.tenant
        
        # Add custom claims to token
        data['user'] = {
            'id': str(self.user.id),
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'full_name': self.user.get_full_name(),
            'role': tenant_user.role,
            'tenant_id': str(tenant.id),
            'tenant_name': tenant.name,
            'tenant_slug': tenant.slug,
        }
        
        # If user has multiple tenants, include them in response
        if tenant_users.count() > 1:
            data['available_tenants'] = [
                {
                    'id': str(tu.tenant.id),
                    'name': tu.tenant.name,
                    'slug': tu.tenant.slug,
                    'role': tu.role
                }
                for tu in tenant_users
            ]
        
        return data


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    # School/Tenant information
    school_name = serializers.CharField(write_only=True)
    institution_type = serializers.CharField(write_only=True)
    country = serializers.CharField(write_only=True)
    student_enrollment = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone',
            'school_name', 'institution_type', 'country', 'student_enrollment'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password': 'Passwords do not match'})
        
        # Remove password_confirm as it's not needed for user creation
        attrs.pop('password_confirm')
        
        return attrs
    
    def create(self, validated_data):
        # Extract tenant data
        school_name = validated_data.pop('school_name')
        institution_type = validated_data.pop('institution_type')
        country = validated_data.pop('country')
        student_enrollment = validated_data.pop('student_enrollment')
        
        # Create user (inactive by default, pending admin approval)
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone=validated_data.get('phone', ''),
            is_active=False  # Requires admin approval
        )
        
        # Create tenant/school
        from django.utils.text import slugify
        import uuid
        
        slug = slugify(school_name)
        # Ensure unique slug
        if Tenant.objects.filter(slug=slug).exists():
            slug = f"{slug}-{str(uuid.uuid4())[:8]}"
        
        tenant = Tenant.objects.create(
            name=school_name,
            slug=slug,
            email=user.email,
            country=country,
            status='trial'
        )
        
        # Create tenant config with defaults
        TenantConfig.objects.create(tenant=tenant)
        
        # Create tenant-user relationship (admin role)
        TenantUser.objects.create(
            tenant=tenant,
            user=user,
            role='admin',
            is_active=False  # Requires approval
        )
        
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user details"""
    
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone', 'avatar', 'is_active', 'email_verified',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TenantSerializer(serializers.ModelSerializer):
    """Serializer for tenant/organization details"""
    
    class Meta:
        model = Tenant
        fields = [
            'id', 'name', 'slug', 'email', 'phone', 'website',
            'address_line1', 'city', 'state', 'country',
            'subscription_tier', 'status', 'logo', 'timezone',
            'language', 'currency'
        ]
        read_only_fields = ['id', 'slug']
