"""
Invoice service for generating and managing invoices.
"""
import logging
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from finance.models import (
    Invoice, InvoiceLineItem, FeeStructure, Ledger
)
from sis.models import Student, Enrollment
from academics.models import AcademicYear, Term
from tenants.utils import get_current_tenant

logger = logging.getLogger(__name__)


class InvoiceService:
    """
    Service for invoice generation and management.
    """
    
    @transaction.atomic
    def generate_invoice(self, student_id, academic_year_id, term_id=None, fee_structures=None):
        """
        Generate invoice for a student.
        
        Args:
            student_id: Student UUID
            academic_year_id: Academic year UUID
            term_id: Optional term UUID
            fee_structures: Optional list of fee structure IDs to include
        
        Returns:
            Invoice object
        """
        try:
            tenant = get_current_tenant()
            if not tenant:
                raise Exception("Tenant context required")
            
            # Get student and academic year
            student = Student.objects.get(id=student_id, tenant=tenant)
            academic_year = AcademicYear.objects.get(id=academic_year_id, tenant=tenant)
            
            term = None
            if term_id:
                term = Term.objects.get(id=term_id, tenant=tenant)
            
            # Get student's enrollment
            try:
                enrollment = Enrollment.objects.get(
                    student=student,
                    academic_year=academic_year,
                    tenant=tenant
                )
            except Enrollment.DoesNotExist:
                raise Exception(f"Student not enrolled in {academic_year.name}")
            
            # Generate invoice number
            invoice_number = self._generate_invoice_number(student, academic_year, term)
            
            # Calculate due date
            issue_date = timezone.now().date()
            due_date = issue_date + timedelta(days=30)  # Default 30 days
            
            # Create invoice
            invoice = Invoice.objects.create(
                tenant=tenant,
                invoice_number=invoice_number,
                student=student,
                academic_year=academic_year,
                term=term,
                issue_date=issue_date,
                due_date=due_date,
                currency=tenant.currency,
                status='draft'
            )
            
            # Get applicable fee structures
            if fee_structures:
                fees = FeeStructure.objects.filter(
                    id__in=fee_structures,
                    tenant=tenant,
                    is_active=True
                )
            else:
                # Get all applicable fees for the student's grade
                fees = FeeStructure.objects.filter(
                    tenant=tenant,
                    academic_year=academic_year,
                    is_active=True
                ).filter(
                    models.Q(grade=enrollment.class_assigned.grade) |
                    models.Q(grade__isnull=True)
                )
                
                # Filter by term if specified
                if term:
                    fees = fees.filter(frequency='per_term')
            
            # Create line items
            for fee in fees:
                InvoiceLineItem.objects.create(
                    tenant=tenant,
                    invoice=invoice,
                    fee_structure=fee,
                    description=fee.name,
                    quantity=1,
                    unit_price=fee.amount,
                    total_amount=fee.amount
                )
            
            # Calculate totals
            invoice.calculate_totals()
            
            # Create ledger entry for invoice
            self._create_invoice_ledger_entry(invoice)
            
            logger.info(f"Invoice generated: {invoice_number}")
            
            return invoice
            
        except Student.DoesNotExist:
            logger.error(f"Student not found: {student_id}")
            raise Exception("Student not found")
        
        except AcademicYear.DoesNotExist:
            logger.error(f"Academic year not found: {academic_year_id}")
            raise Exception("Academic year not found")
        
        except Exception as e:
            logger.error(f"Invoice generation failed: {str(e)}")
            raise
    
    def _generate_invoice_number(self, student, academic_year, term=None):
        """
        Generate unique invoice number.
        Format: INV-YEAR-STUDENT-TERM-SEQUENCE
        """
        from django.db.models import Max
        
        prefix = f"INV-{academic_year.name.replace('-', '')}-{student.admission_number}"
        
        if term:
            prefix += f"-T{term.term_number}"
        
        # Get last invoice number with this prefix
        last_invoice = Invoice.objects.filter(
            invoice_number__startswith=prefix,
            tenant=student.tenant
        ).aggregate(Max('invoice_number'))
        
        if last_invoice['invoice_number__max']:
            # Extract sequence number and increment
            last_number = last_invoice['invoice_number__max']
            try:
                sequence = int(last_number.split('-')[-1]) + 1
            except (ValueError, IndexError):
                sequence = 1
        else:
            sequence = 1
        
        return f"{prefix}-{sequence:04d}"
    
    def _create_invoice_ledger_entry(self, invoice):
        """
        Create ledger entry for invoice (Accounts Receivable).
        """
        # Debit: Accounts Receivable
        Ledger.objects.create(
            tenant=invoice.tenant,
            transaction_date=timezone.now(),
            description=f"Invoice issued - {invoice.invoice_number}",
            entry_type='debit',
            amount=invoice.total_amount,
            currency=invoice.currency,
            account_code='1200',
            account_name='Accounts Receivable',
            invoice=invoice,
            student=invoice.student
        )
        
        # Credit: Revenue
        Ledger.objects.create(
            tenant=invoice.tenant,
            transaction_date=timezone.now(),
            description=f"Invoice issued - {invoice.invoice_number}",
            entry_type='credit',
            amount=invoice.total_amount,
            currency=invoice.currency,
            account_code='4000',
            account_name='Fee Revenue',
            invoice=invoice,
            student=invoice.student
        )
    
    @transaction.atomic
    def publish_invoice(self, invoice_id):
        """
        Publish a draft invoice.
        
        Args:
            invoice_id: Invoice UUID
        
        Returns:
            Invoice object
        """
        try:
            tenant = get_current_tenant()
            
            invoice = Invoice.objects.select_for_update().get(
                id=invoice_id,
                tenant=tenant
            )
            
            if invoice.status != 'draft':
                raise Exception("Only draft invoices can be published")
            
            invoice.status = 'issued'
            invoice.save()
            
            logger.info(f"Invoice published: {invoice.invoice_number}")
            
            return invoice
            
        except Invoice.DoesNotExist:
            logger.error(f"Invoice not found: {invoice_id}")
            raise Exception("Invoice not found")
    
    @transaction.atomic
    def cancel_invoice(self, invoice_id, reason):
        """
        Cancel an invoice.
        
        Args:
            invoice_id: Invoice UUID
            reason: Cancellation reason
        
        Returns:
            Invoice object
        """
        try:
            tenant = get_current_tenant()
            
            invoice = Invoice.objects.select_for_update().get(
                id=invoice_id,
                tenant=tenant
            )
            
            if invoice.status == 'paid':
                raise Exception("Cannot cancel a paid invoice")
            
            if invoice.amount_paid > 0:
                raise Exception("Cannot cancel invoice with payments. Reverse payments first.")
            
            invoice.status = 'cancelled'
            invoice.notes += f"\n\nCancelled on {timezone.now()}: {reason}"
            invoice.save()
            
            logger.info(f"Invoice cancelled: {invoice.invoice_number}")
            
            return invoice
            
        except Invoice.DoesNotExist:
            logger.error(f"Invoice not found: {invoice_id}")
            raise Exception("Invoice not found")
    
    @transaction.atomic
    def apply_discount(self, invoice_id, discount_amount, reason):
        """
        Apply discount to an invoice.
        
        Args:
            invoice_id: Invoice UUID
            discount_amount: Discount amount
            reason: Discount reason
        
        Returns:
            Invoice object
        """
        try:
            tenant = get_current_tenant()
            
            invoice = Invoice.objects.select_for_update().get(
                id=invoice_id,
                tenant=tenant
            )
            
            if invoice.status == 'cancelled':
                raise Exception("Cannot apply discount to cancelled invoice")
            
            if discount_amount < 0:
                raise ValueError("Discount amount must be positive")
            
            if discount_amount > invoice.subtotal:
                raise ValueError("Discount cannot exceed invoice subtotal")
            
            invoice.discount_amount = discount_amount
            invoice.notes += f"\n\nDiscount applied on {timezone.now()}: {reason}"
            invoice.calculate_totals()
            
            logger.info(f"Discount applied to invoice: {invoice.invoice_number}")
            
            return invoice
            
        except Invoice.DoesNotExist:
            logger.error(f"Invoice not found: {invoice_id}")
            raise Exception("Invoice not found")
    
    def get_outstanding_invoices(self, student_id=None):
        """
        Get outstanding invoices (unpaid or partially paid).
        
        Args:
            student_id: Optional student filter
        
        Returns:
            QuerySet of invoices
        """
        from django.db.models import Q
        
        tenant = get_current_tenant()
        
        filters = Q(
            tenant=tenant,
            status__in=['issued', 'partially_paid', 'overdue']
        )
        
        if student_id:
            filters &= Q(student_id=student_id)
        
        return Invoice.objects.filter(filters).select_related(
            'student', 'academic_year', 'term'
        ).order_by('-issue_date')
    
    def get_arrears_summary(self):
        """
        Get summary of outstanding arrears.
        
        Returns:
            Dictionary with arrears statistics
        """
        from django.db.models import Sum, Count
        
        tenant = get_current_tenant()
        
        outstanding = Invoice.objects.filter(
            tenant=tenant,
            status__in=['issued', 'partially_paid', 'overdue']
        )
        
        summary = {
            'total_outstanding_invoices': outstanding.count(),
            'total_arrears': outstanding.aggregate(
                total=Sum('balance')
            )['total'] or Decimal('0.00'),
            'overdue_count': outstanding.filter(
                due_date__lt=timezone.now().date()
            ).count(),
            'overdue_amount': outstanding.filter(
                due_date__lt=timezone.now().date()
            ).aggregate(
                total=Sum('balance')
            )['total'] or Decimal('0.00'),
        }
        
        return summary
    
    @transaction.atomic
    def bulk_generate_invoices(self, academic_year_id, term_id=None, grade_id=None):
        """
        Generate invoices for multiple students in bulk.
        
        Args:
            academic_year_id: Academic year UUID
            term_id: Optional term UUID
            grade_id: Optional grade filter
        
        Returns:
            List of generated invoices
        """
        from django.db.models import Q
        
        tenant = get_current_tenant()
        
        # Get enrollments
        filters = Q(
            tenant=tenant,
            academic_year_id=academic_year_id,
            status='enrolled'
        )
        
        if grade_id:
            filters &= Q(class_assigned__grade_id=grade_id)
        
        enrollments = Enrollment.objects.filter(filters).select_related(
            'student', 'academic_year', 'class_assigned__grade'
        )
        
        invoices = []
        errors = []
        
        for enrollment in enrollments:
            try:
                invoice = self.generate_invoice(
                    student_id=enrollment.student.id,
                    academic_year_id=academic_year_id,
                    term_id=term_id
                )
                invoices.append(invoice)
            except Exception as e:
                errors.append({
                    'student': enrollment.student.get_full_name(),
                    'error': str(e)
                })
                logger.error(f"Failed to generate invoice for {enrollment.student.get_full_name()}: {str(e)}")
        
        logger.info(f"Bulk invoice generation: {len(invoices)} successful, {len(errors)} failed")
        
        return {
            'invoices': invoices,
            'errors': errors,
            'success_count': len(invoices),
            'error_count': len(errors)
        }
