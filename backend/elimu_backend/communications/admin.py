from django.contrib import admin
from django.utils.html import format_html
from .models import NotificationTemplate, Notification, BroadcastMessage


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'template_type', 'is_active', 'created_at']
    list_filter = ['template_type', 'is_active', 'created_at']
    search_fields = ['name', 'template_type']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'template_type', 'is_active')
        }),
        ('Email Template', {
            'fields': ('subject', 'email_template')
        }),
        ('SMS Template', {
            'fields': ('sms_template',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'channel', 'get_recipient', 'subject_preview', 'status', 'priority', 'created_at']
    list_filter = ['channel', 'status', 'priority', 'created_at']
    search_fields = ['subject', 'message', 'recipient_email', 'recipient_phone']
    readonly_fields = ['created_at', 'updated_at', 'sent_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Channel & Status', {
            'fields': ('channel', 'status', 'priority')
        }),
        ('Recipient', {
            'fields': ('recipient_user', 'recipient_guardian', 'recipient_email', 'recipient_phone')
        }),
        ('Content', {
            'fields': ('subject', 'message', 'template', 'student')
        }),
        ('Delivery', {
            'fields': ('sent_at', 'delivery_status', 'error_message')
        }),
        ('Scheduling', {
            'fields': ('scheduled_for',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_recipient(self, obj):
        if obj.recipient_user:
            return f"User: {obj.recipient_user.email}"
        elif obj.recipient_guardian:
            return f"Guardian: {obj.recipient_guardian.get_full_name()}"
        elif obj.recipient_email:
            return f"Email: {obj.recipient_email}"
        elif obj.recipient_phone:
            return f"Phone: {obj.recipient_phone}"
        return "Unknown"
    get_recipient.short_description = 'Recipient'
    
    def subject_preview(self, obj):
        return obj.subject[:50] if obj.subject else obj.message[:50]
    subject_preview.short_description = 'Preview'
    
    actions = ['mark_as_sent', 'mark_as_failed', 'resend_notifications']
    
    def mark_as_sent(self, request, queryset):
        updated = queryset.update(status='sent')
        self.message_user(request, f'{updated} notifications marked as sent.')
    mark_as_sent.short_description = 'Mark selected as sent'
    
    def mark_as_failed(self, request, queryset):
        updated = queryset.update(status='failed')
        self.message_user(request, f'{updated} notifications marked as failed.')
    mark_as_failed.short_description = 'Mark selected as failed'
    
    def resend_notifications(self, request, queryset):
        from communications.tasks import send_notification_async
        count = 0
        for notification in queryset:
            notification.status = 'pending'
            notification.save()
            send_notification_async.delay(str(notification.id))
            count += 1
        self.message_user(request, f'{count} notifications queued for resending.')
    resend_notifications.short_description = 'Resend selected notifications'


@admin.register(BroadcastMessage)
class BroadcastMessageAdmin(admin.ModelAdmin):
    list_display = ['title', 'target_audience', 'status', 'total_recipients', 'sent_count', 'failed_count', 'created_at']
    list_filter = ['status', 'target_audience', 'send_via_sms', 'send_via_email', 'created_at']
    search_fields = ['title', 'message']
    readonly_fields = ['created_at', 'updated_at', 'sent_at', 'total_recipients', 'sent_count', 'failed_count']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'message', 'status')
        }),
        ('Targeting', {
            'fields': ('target_audience', 'target_filters')
        }),
        ('Channels', {
            'fields': ('send_via_sms', 'send_via_email', 'send_via_in_app')
        }),
        ('Scheduling', {
            'fields': ('scheduled_for',)
        }),
        ('Statistics', {
            'fields': ('total_recipients', 'sent_count', 'failed_count', 'sent_at')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['send_broadcast_now']
    
    def send_broadcast_now(self, request, queryset):
        from communications.tasks import send_broadcast_async
        count = 0
        for broadcast in queryset:
            if broadcast.status in ['draft', 'scheduled']:
                send_broadcast_async.delay(str(broadcast.id))
                count += 1
        self.message_user(request, f'{count} broadcasts queued for sending.')
    send_broadcast_now.short_description = 'Send selected broadcasts now'
