from django.db import models
from django.core.validators import MinValueValidator
from django.db.models import Sum
from tenants.base_models import TenantAwareTimestampedModel
from accounts.models import User
from sis.models import Student
from academics.models import AcademicYear, Term, Grade
import uuid


class FeeStructure(TenantAwareTimestampedModel):
    """
    Defines fee structure for different grades/classes.
    """
    FEE_TYPES = [
        ('tuition', 'Tuition'),
        ('registration', 'Registration'),
        ('exam', 'Examination'),
        ('library', 'Library'),
        ('sports', 'Sports'),
        ('transport', 'Transport'),
        ('meals', 'Meals'),
        ('uniform', 'Uniform'),
        ('other', 'Other'),
    ]
    
    FREQUENCY_CHOICES = [
        ('one_time', 'One Time'),
        ('per_term', 'Per Term'),
        ('per_year', 'Per Year'),
        ('monthly', 'Monthly'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    fee_type = models.CharField(max_length=50, choices=FEE_TYPES)
    
    # Applicable to
    grade = models.ForeignKey(
        Grade,
        on_delete=models.CASCADE,
        related_name='fee_structures',
        null=True,
        blank=True,
        help_text="Leave blank if applies to all grades"
    )
    academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE,
        related_name='fee_structures'
    )
    
    # Amount
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    currency = models.CharField(max_length=3, default='KES')
    
    # Frequency
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    
    # Payment terms
    is_mandatory = models.BooleanField(default=True)
    due_date_offset_days = models.IntegerField(
        default=30,
        help_text="Days from term start for payment due date"
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    
    description = models.TextField(blank=True)
    
    class Meta:
        db_table = 'fee_structures'
        ordering = ['academic_year', 'grade', 'fee_type']
        indexes = [
            models.Index(fields=['tenant', 'academic_year']),
            models.Index(fields=['tenant', 'grade']),
        ]
    
    def __str__(self):
        grade_str = f" - {self.grade.name}" if self.grade else ""
        return f"{self.name}{grade_str} - {self.amount} {self.currency}"


class Invoice(TenantAwareTimestampedModel):
    """
    Invoice generated for a student.
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('issued', 'Issued'),
        ('partially_paid', 'Partially Paid'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice_number = models.CharField(max_length=50, unique=True, db_index=True)
    
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='invoices'
    )
    academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE,
        related_name='invoices'
    )
    term = models.ForeignKey(
        Term,
        on_delete=models.CASCADE,
        related_name='invoices',
        null=True,
        blank=True
    )
    
    # Dates
    issue_date = models.DateField()
    due_date = models.DateField()
    
    # Amounts
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    currency = models.CharField(max_length=3, default='KES')
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Notes
    notes = models.TextField(blank=True)
    
    # Metadata
    generated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='invoices_generated'
    )
    
    class Meta:
        db_table = 'invoices'
        ordering = ['-issue_date']
        indexes = [
            models.Index(fields=['tenant', 'student']),
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['invoice_number']),
            models.Index(fields=['due_date']),
        ]
    
    def __str__(self):
        return f"{self.invoice_number} - {self.student.get_full_name()}"
    
    def calculate_totals(self):
        """Recalculate invoice totals from line items"""
        line_items = self.line_items.all()
        self.subtotal = sum(item.total_amount for item in line_items)
        self.total_amount = self.subtotal - self.discount_amount + self.tax_amount
        self.balance = self.total_amount - self.amount_paid
        
        # Update status based on payment
        if self.balance <= 0:
            self.status = 'paid'
        elif self.amount_paid > 0:
            self.status = 'partially_paid'
        elif self.due_date < models.functions.Now():
            self.status = 'overdue'
        
        self.save()


class InvoiceLineItem(TenantAwareTimestampedModel):
    """
    Individual line items in an invoice.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name='line_items'
    )
    fee_structure = models.ForeignKey(
        FeeStructure,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invoice_line_items'
    )
    
    description = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        db_table = 'invoice_line_items'
        ordering = ['invoice', 'id']
        indexes = [
            models.Index(fields=['tenant', 'invoice']),
        ]
    
    def __str__(self):
        return f"{self.invoice.invoice_number} - {self.description}"
    
    def save(self, *args, **kwargs):
        self.total_amount = self.quantity * self.unit_price
        super().save(*args, **kwargs)


class Payment(TenantAwareTimestampedModel):
    """
    Payment record for invoices.
    """
    PAYMENT_METHODS = [
        ('mpesa', 'M-Pesa'),
        ('bank_transfer', 'Bank Transfer'),
        ('cash', 'Cash'),
        ('cheque', 'Cheque'),
        ('card', 'Card'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('reversed', 'Reversed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment_reference = models.CharField(max_length=100, unique=True, db_index=True)
    
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    
    # Payment details
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='KES')
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHODS)
    payment_date = models.DateTimeField()
    
    # Transaction details
    transaction_id = models.CharField(max_length=200, blank=True)
    transaction_reference = models.CharField(max_length=200, blank=True)
    
    # Payer information
    payer_name = models.CharField(max_length=200, blank=True)
    payer_phone = models.CharField(max_length=20, blank=True)
    payer_email = models.EmailField(blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Notes
    notes = models.TextField(blank=True)
    
    # Reconciliation
    is_reconciled = models.BooleanField(default=False)
    reconciled_at = models.DateTimeField(null=True, blank=True)
    reconciled_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments_reconciled'
    )
    
    # Receipt
    receipt_number = models.CharField(max_length=50, blank=True)
    receipt_generated = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'payments'
        ordering = ['-payment_date']
        indexes = [
            models.Index(fields=['tenant', 'student']),
            models.Index(fields=['tenant', 'invoice']),
            models.Index(fields=['payment_reference']),
            models.Index(fields=['transaction_id']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.payment_reference} - {self.amount} {self.currency}"


class PaymentRequest(TenantAwareTimestampedModel):
    """
    Outgoing payment requests (e.g., M-Pesa STK Push).
    """
    STATUS_CHOICES = [
        ('initiated', 'Initiated'),
        ('sent', 'Sent'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request_id = models.CharField(max_length=100, unique=True, db_index=True)
    
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name='payment_requests'
    )
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='payment_requests'
    )
    
    # Request details
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='KES')
    phone_number = models.CharField(max_length=20)
    
    # Provider details (M-Pesa, etc.)
    provider = models.CharField(max_length=50, default='mpesa')
    provider_request_id = models.CharField(max_length=200, blank=True)
    provider_response = models.JSONField(default=dict, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='initiated')
    
    # Linked payment (when completed)
    payment = models.OneToOneField(
        Payment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payment_request'
    )
    
    # Timestamps
    initiated_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'payment_requests'
        ordering = ['-initiated_at']
        indexes = [
            models.Index(fields=['tenant', 'student']),
            models.Index(fields=['request_id']),
            models.Index(fields=['provider_request_id']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.request_id} - {self.amount} {self.currency}"


class PaymentCallback(TenantAwareTimestampedModel):
    """
    Logs payment provider callbacks for debugging and reconciliation.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    provider = models.CharField(max_length=50)
    callback_data = models.JSONField()
    
    # Linked payment request
    payment_request = models.ForeignKey(
        PaymentRequest,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='callbacks'
    )
    
    # Processing status
    is_processed = models.BooleanField(default=False)
    processed_at = models.DateTimeField(null=True, blank=True)
    processing_error = models.TextField(blank=True)
    
    # Request metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        db_table = 'payment_callbacks'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tenant', 'provider']),
            models.Index(fields=['is_processed']),
        ]
    
    def __str__(self):
        return f"{self.provider} callback - {self.created_at}"


class Receipt(TenantAwareTimestampedModel):
    """
    Auto-generated receipts for payments.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    receipt_number = models.CharField(max_length=50, unique=True, db_index=True)
    
    payment = models.OneToOneField(
        Payment,
        on_delete=models.CASCADE,
        related_name='receipt'
    )
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='receipts'
    )
    
    # Receipt details
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='KES')
    issue_date = models.DateTimeField(auto_now_add=True)
    
    # PDF generation
    pdf_file = models.FileField(upload_to='receipts/', null=True, blank=True)
    
    # Email status
    emailed_to = models.EmailField(blank=True)
    email_sent = models.BooleanField(default=False)
    email_sent_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'receipts'
        ordering = ['-issue_date']
        indexes = [
            models.Index(fields=['tenant', 'student']),
            models.Index(fields=['receipt_number']),
        ]
    
    def __str__(self):
        return f"{self.receipt_number} - {self.amount} {self.currency}"


class Ledger(TenantAwareTimestampedModel):
    """
    Double-entry accounting ledger for financial transactions.
    """
    ENTRY_TYPES = [
        ('debit', 'Debit'),
        ('credit', 'Credit'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Transaction details
    transaction_date = models.DateTimeField(db_index=True)
    description = models.CharField(max_length=255)
    entry_type = models.CharField(max_length=10, choices=ENTRY_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='KES')
    
    # Account classification
    account_code = models.CharField(max_length=50)
    account_name = models.CharField(max_length=200)
    
    # References
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ledger_entries'
    )
    payment = models.ForeignKey(
        Payment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ledger_entries'
    )
    student = models.ForeignKey(
        Student,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ledger_entries'
    )
    
    # Metadata
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='ledger_entries_created'
    )
    
    class Meta:
        db_table = 'ledger'
        ordering = ['-transaction_date']
        indexes = [
            models.Index(fields=['tenant', 'transaction_date']),
            models.Index(fields=['tenant', 'account_code']),
            models.Index(fields=['entry_type']),
        ]
    
    def __str__(self):
        return f"{self.transaction_date} - {self.entry_type} - {self.amount}"
