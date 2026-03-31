"""
Payment service for handling payment workflows and reconciliation.
"""
import logging
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from finance.models import (
    Payment, PaymentRequest, Receipt, Ledger, Invoice
)
from tenants.utils import get_current_tenant

logger = logging.getLogger(__name__)


class PaymentService:
    """
    Service for payment processing, reconciliation, and receipt generation.
    """
    
    @transaction.atomic
    def record_payment(self, invoice_id, amount, payment_method, **kwargs):
        """
        Record a payment for an invoice.
        
        Args:
            invoice_id: Invoice UUID
            amount: Payment amount
            payment_method: Payment method (cash, bank_transfer, etc.)
            **kwargs: Additional payment details
        
        Returns:
            Payment object
        """
        try:
            tenant = get_current_tenant()
            if not tenant:
                raise Exception("Tenant context required")
            
            # Get invoice
            invoice = Invoice.objects.select_for_update().get(
                id=invoice_id,
                tenant=tenant
            )
            
            # Validate amount
            if amount <= 0:
                raise ValueError("Payment amount must be positive")
            
            if amount > invoice.balance:
                raise ValueError(f"Payment amount ({amount}) exceeds invoice balance ({invoice.balance})")
            
            # Create payment reference
            payment_reference = f"PAY-{timezone.now().strftime('%Y%m%d%H%M%S')}-{invoice.id}"
            
            # Create payment record
            payment = Payment.objects.create(
                tenant=tenant,
                payment_reference=payment_reference,
                invoice=invoice,
                student=invoice.student,
                amount=amount,
                currency=kwargs.get('currency', invoice.currency),
                payment_method=payment_method,
                payment_date=kwargs.get('payment_date', timezone.now()),
                transaction_id=kwargs.get('transaction_id', ''),
                transaction_reference=kwargs.get('transaction_reference', ''),
                payer_name=kwargs.get('payer_name', ''),
                payer_phone=kwargs.get('payer_phone', ''),
                payer_email=kwargs.get('payer_email', ''),
                status='completed',
                notes=kwargs.get('notes', '')
            )
            
            # Update invoice
            invoice.amount_paid += amount
            invoice.balance = invoice.total_amount - invoice.amount_paid
            
            if invoice.balance <= 0:
                invoice.status = 'paid'
            else:
                invoice.status = 'partially_paid'
            
            invoice.save()
            
            # Create ledger entries (double-entry)
            self._create_ledger_entries(payment)
            
            # Generate receipt
            receipt = self.generate_receipt(payment)
            
            logger.info(f"Payment recorded: {payment.payment_reference}")
            
            return payment
            
        except Invoice.DoesNotExist:
            logger.error(f"Invoice not found: {invoice_id}")
            raise Exception("Invoice not found")
        
        except Exception as e:
            logger.error(f"Payment recording failed: {str(e)}")
            raise
    
    def _create_ledger_entries(self, payment):
        """
        Create double-entry ledger entries for a payment.
        """
        tenant = payment.tenant
        
        # Debit: Cash/Bank account
        Ledger.objects.create(
            tenant=tenant,
            transaction_date=payment.payment_date,
            description=f"Payment received - {payment.payment_reference}",
            entry_type='debit',
            amount=payment.amount,
            currency=payment.currency,
            account_code='1010',
            account_name='Cash/Bank',
            payment=payment,
            invoice=payment.invoice,
            student=payment.student
        )
        
        # Credit: Accounts Receivable
        Ledger.objects.create(
            tenant=tenant,
            transaction_date=payment.payment_date,
            description=f"Payment received - {payment.payment_reference}",
            entry_type='credit',
            amount=payment.amount,
            currency=payment.currency,
            account_code='1200',
            account_name='Accounts Receivable',
            payment=payment,
            invoice=payment.invoice,
            student=payment.student
        )
    
    @transaction.atomic
    def generate_receipt(self, payment):
        """
        Generate receipt for a payment.
        
        Args:
            payment: Payment object
        
        Returns:
            Receipt object
        """
        try:
            # Check if receipt already exists
            if hasattr(payment, 'receipt'):
                logger.info(f"Receipt already exists for payment: {payment.payment_reference}")
                return payment.receipt
            
            # Generate receipt number
            receipt_number = f"RCP-{timezone.now().strftime('%Y%m%d%H%M%S')}-{payment.id}"
            
            # Create receipt
            receipt = Receipt.objects.create(
                tenant=payment.tenant,
                receipt_number=receipt_number,
                payment=payment,
                student=payment.student,
                amount=payment.amount,
                currency=payment.currency
            )
            
            # Update payment
            payment.receipt_number = receipt_number
            payment.receipt_generated = True
            payment.save(update_fields=['receipt_number', 'receipt_generated'])
            
            logger.info(f"Receipt generated: {receipt_number}")
            
            return receipt
            
        except Exception as e:
            logger.error(f"Receipt generation failed: {str(e)}")
            raise
    
    @transaction.atomic
    def reconcile_payment(self, payment_id, reconciled_by_user):
        """
        Mark a payment as reconciled.
        
        Args:
            payment_id: Payment UUID
            reconciled_by_user: User performing reconciliation
        
        Returns:
            Payment object
        """
        try:
            tenant = get_current_tenant()
            
            payment = Payment.objects.select_for_update().get(
                id=payment_id,
                tenant=tenant
            )
            
            if payment.is_reconciled:
                logger.info(f"Payment already reconciled: {payment.payment_reference}")
                return payment
            
            payment.is_reconciled = True
            payment.reconciled_at = timezone.now()
            payment.reconciled_by = reconciled_by_user
            payment.save()
            
            logger.info(f"Payment reconciled: {payment.payment_reference}")
            
            return payment
            
        except Payment.DoesNotExist:
            logger.error(f"Payment not found: {payment_id}")
            raise Exception("Payment not found")
    
    @transaction.atomic
    def reverse_payment(self, payment_id, reason, reversed_by_user):
        """
        Reverse a payment.
        
        Args:
            payment_id: Payment UUID
            reason: Reason for reversal
            reversed_by_user: User performing reversal
        
        Returns:
            Payment object
        """
        try:
            tenant = get_current_tenant()
            
            payment = Payment.objects.select_for_update().get(
                id=payment_id,
                tenant=tenant
            )
            
            if payment.status == 'reversed':
                raise Exception("Payment already reversed")
            
            # Update payment status
            payment.status = 'reversed'
            payment.notes += f"\n\nReversed on {timezone.now()}: {reason}"
            payment.save()
            
            # Update invoice
            invoice = payment.invoice
            invoice.amount_paid -= payment.amount
            invoice.balance = invoice.total_amount - invoice.amount_paid
            
            if invoice.balance > 0:
                invoice.status = 'partially_paid' if invoice.amount_paid > 0 else 'issued'
            
            invoice.save()
            
            # Create reversal ledger entries
            self._create_reversal_ledger_entries(payment, reason)
            
            logger.info(f"Payment reversed: {payment.payment_reference}")
            
            return payment
            
        except Payment.DoesNotExist:
            logger.error(f"Payment not found: {payment_id}")
            raise Exception("Payment not found")
    
    def _create_reversal_ledger_entries(self, payment, reason):
        """
        Create ledger entries for payment reversal.
        """
        tenant = payment.tenant
        
        # Credit: Cash/Bank account (opposite of original debit)
        Ledger.objects.create(
            tenant=tenant,
            transaction_date=timezone.now(),
            description=f"Payment reversal - {payment.payment_reference} - {reason}",
            entry_type='credit',
            amount=payment.amount,
            currency=payment.currency,
            account_code='1010',
            account_name='Cash/Bank',
            payment=payment,
            invoice=payment.invoice,
            student=payment.student
        )
        
        # Debit: Accounts Receivable (opposite of original credit)
        Ledger.objects.create(
            tenant=tenant,
            transaction_date=timezone.now(),
            description=f"Payment reversal - {payment.payment_reference} - {reason}",
            entry_type='debit',
            amount=payment.amount,
            currency=payment.currency,
            account_code='1200',
            account_name='Accounts Receivable',
            payment=payment,
            invoice=payment.invoice,
            student=payment.student
        )
    
    def get_payment_summary(self, student_id=None, date_from=None, date_to=None):
        """
        Get payment summary statistics.
        
        Args:
            student_id: Optional student filter
            date_from: Optional start date
            date_to: Optional end date
        
        Returns:
            Dictionary with payment statistics
        """
        from django.db.models import Sum, Count, Q
        
        tenant = get_current_tenant()
        
        filters = Q(tenant=tenant)
        
        if student_id:
            filters &= Q(student_id=student_id)
        
        if date_from:
            filters &= Q(payment_date__gte=date_from)
        
        if date_to:
            filters &= Q(payment_date__lte=date_to)
        
        payments = Payment.objects.filter(filters)
        
        summary = {
            'total_payments': payments.count(),
            'total_amount': payments.filter(status='completed').aggregate(
                total=Sum('amount')
            )['total'] or Decimal('0.00'),
            'completed_count': payments.filter(status='completed').count(),
            'pending_count': payments.filter(status='pending').count(),
            'failed_count': payments.filter(status='failed').count(),
            'reversed_count': payments.filter(status='reversed').count(),
            'reconciled_count': payments.filter(is_reconciled=True).count(),
            'unreconciled_count': payments.filter(is_reconciled=False).count(),
        }
        
        # Payment method breakdown
        method_breakdown = payments.filter(status='completed').values('payment_method').annotate(
            count=Count('id'),
            total=Sum('amount')
        )
        
        summary['by_method'] = {
            item['payment_method']: {
                'count': item['count'],
                'total': item['total']
            }
            for item in method_breakdown
        }
        
        return summary
