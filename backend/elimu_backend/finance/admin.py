from django.contrib import admin
from django.utils.html import format_html
from .models import (
    FeeStructure, Invoice, InvoiceLineItem, Payment,
    PaymentRequest, PaymentCallback, Receipt, Ledger
)


@admin.register(FeeStructure)
class FeeStructureAdmin(admin.ModelAdmin):
    list_display = ['name', 'fee_type', 'grade', 'amount', 'currency', 'frequency', 'is_active']
    list_filter = ['fee_type', 'frequency', 'is_active', 'academic_year']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']


class InvoiceLineItemInline(admin.TabularInline):
    model = InvoiceLineItem
    extra = 0
    readonly_fields = ['total_amount']


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'student', 'total_amount', 'amount_paid', 'balance', 'status', 'due_date']
    list_filter = ['status', 'academic_year', 'term', 'issue_date']
    search_fields = ['invoice_number', 'student__first_name', 'student__last_name', 'student__admission_number']
    readonly_fields = ['created_at', 'updated_at', 'invoice_number', 'subtotal', 'total_amount', 'amount_paid', 'balance']
    inlines = [InvoiceLineItemInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('invoice_number', 'student', 'academic_year', 'term')
        }),
        ('Dates', {
            'fields': ('issue_date', 'due_date')
        }),
        ('Amounts', {
            'fields': ('subtotal', 'discount_amount', 'tax_amount', 'total_amount', 'amount_paid', 'balance', 'currency')
        }),
        ('Status', {
            'fields': ('status', 'notes')
        }),
        ('Metadata', {
            'fields': ('generated_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['payment_reference', 'student', 'amount', 'payment_method', 'status', 'payment_date', 'is_reconciled']
    list_filter = ['status', 'payment_method', 'is_reconciled', 'payment_date']
    search_fields = ['payment_reference', 'transaction_id', 'student__first_name', 'student__last_name']
    readonly_fields = ['created_at', 'updated_at', 'payment_reference']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('payment_reference', 'invoice', 'student')
        }),
        ('Payment Details', {
            'fields': ('amount', 'currency', 'payment_method', 'payment_date')
        }),
        ('Transaction', {
            'fields': ('transaction_id', 'transaction_reference')
        }),
        ('Payer Information', {
            'fields': ('payer_name', 'payer_phone', 'payer_email')
        }),
        ('Status', {
            'fields': ('status', 'notes')
        }),
        ('Reconciliation', {
            'fields': ('is_reconciled', 'reconciled_at', 'reconciled_by')
        }),
        ('Receipt', {
            'fields': ('receipt_number', 'receipt_generated')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PaymentRequest)
class PaymentRequestAdmin(admin.ModelAdmin):
    list_display = ['request_id', 'student', 'amount', 'phone_number', 'provider', 'status', 'initiated_at']
    list_filter = ['status', 'provider', 'initiated_at']
    search_fields = ['request_id', 'provider_request_id', 'student__first_name', 'student__last_name']
    readonly_fields = ['created_at', 'updated_at', 'request_id', 'initiated_at', 'completed_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('request_id', 'invoice', 'student')
        }),
        ('Request Details', {
            'fields': ('amount', 'currency', 'phone_number')
        }),
        ('Provider', {
            'fields': ('provider', 'provider_request_id', 'provider_response')
        }),
        ('Status', {
            'fields': ('status', 'payment')
        }),
        ('Timestamps', {
            'fields': ('initiated_at', 'completed_at', 'expires_at', 'created_at', 'updated_at')
        }),
    )


@admin.register(PaymentCallback)
class PaymentCallbackAdmin(admin.ModelAdmin):
    list_display = ['id', 'provider', 'payment_request', 'is_processed', 'created_at']
    list_filter = ['provider', 'is_processed', 'created_at']
    search_fields = ['payment_request__request_id']
    readonly_fields = ['created_at', 'updated_at', 'processed_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('provider', 'payment_request')
        }),
        ('Callback Data', {
            'fields': ('callback_data', 'ip_address')
        }),
        ('Processing', {
            'fields': ('is_processed', 'processed_at', 'processing_error')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    list_display = ['receipt_number', 'student', 'amount', 'issue_date', 'email_sent']
    list_filter = ['email_sent', 'issue_date']
    search_fields = ['receipt_number', 'student__first_name', 'student__last_name']
    readonly_fields = ['created_at', 'updated_at', 'receipt_number', 'issue_date']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('receipt_number', 'payment', 'student')
        }),
        ('Receipt Details', {
            'fields': ('amount', 'currency', 'issue_date')
        }),
        ('PDF', {
            'fields': ('pdf_file',)
        }),
        ('Email', {
            'fields': ('emailed_to', 'email_sent', 'email_sent_at')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Ledger)
class LedgerAdmin(admin.ModelAdmin):
    list_display = ['transaction_date', 'account_code', 'account_name', 'entry_type', 'amount', 'description']
    list_filter = ['entry_type', 'account_code', 'transaction_date']
    search_fields = ['description', 'account_code', 'account_name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'transaction_date'
    
    fieldsets = (
        ('Transaction', {
            'fields': ('transaction_date', 'description')
        }),
        ('Entry', {
            'fields': ('entry_type', 'amount', 'currency')
        }),
        ('Account', {
            'fields': ('account_code', 'account_name')
        }),
        ('References', {
            'fields': ('invoice', 'payment', 'student')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
