"""
Celery tasks for finance module.
Handles async payment processing, reconciliation, and notifications.
"""
from celery import shared_task
from django.utils import timezone
from django.db.models import Q
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def process_payment_callback(self, callback_data, ip_address=None):
    """
    Process M-Pesa payment callback asynchronously.
    """
    from finance.services import MpesaService
    from tenants.utils import set_current_tenant, clear_current_tenant
    from tenants.models import Tenant
    
    try:
        # Extract tenant from callback data if available
        # For now, we'll need to identify tenant from the callback
        # This might require additional logic based on your setup
        
        mpesa_service = MpesaService()
        payment = mpesa_service.process_callback(callback_data, ip_address)
        
        if payment:
            # Send payment confirmation notification
            send_payment_confirmation.delay(str(payment.id))
            
            # Generate receipt
            generate_receipt_pdf.delay(str(payment.id))
        
        return {'status': 'success', 'payment_id': str(payment.id) if payment else None}
        
    except Exception as e:
        logger.error(f"Payment callback processing failed: {str(e)}")
        raise self.retry(exc=e, countdown=60)
    finally:
        clear_current_tenant()


@shared_task
def send_payment_confirmation(payment_id):
    """
    Send payment confirmation notification to parent/guardian.
    """
    from finance.models import Payment
    from communications.models import Notification
    from sis.models import StudentGuardian
    
    try:
        payment = Payment.objects.select_related(
            'student', 'invoice', 'tenant'
        ).get(id=payment_id)
        
        # Get primary guardian
        primary_guardian = StudentGuardian.objects.filter(
            student=payment.student,
            is_primary=True
        ).select_related('guardian').first()
        
        if not primary_guardian:
            logger.warning(f"No primary guardian found for student {payment.student.id}")
            return
        
        guardian = primary_guardian.guardian
        
        # Create notification
        message = (
            f"Payment of {payment.currency} {payment.amount} received for "
            f"{payment.student.get_full_name()}. "
            f"Receipt No: {payment.receipt_number}. "
            f"Balance: {payment.currency} {payment.invoice.balance}"
        )
        
        # SMS notification
        if guardian.phone:
            Notification.objects.create(
                tenant=payment.tenant,
                recipient_guardian=guardian,
                recipient_phone=guardian.phone,
                channel='sms',
                subject='Payment Confirmation',
                message=message,
                student=payment.student,
                status='pending'
            )
        
        # Email notification
        if guardian.email:
            Notification.objects.create(
                tenant=payment.tenant,
                recipient_guardian=guardian,
                recipient_email=guardian.email,
                channel='email',
                subject='Payment Confirmation',
                message=message,
                student=payment.student,
                status='pending'
            )
        
        logger.info(f"Payment confirmation notifications created for payment {payment.payment_reference}")
        
    except Payment.DoesNotExist:
        logger.error(f"Payment not found: {payment_id}")
    except Exception as e:
        logger.error(f"Failed to send payment confirmation: {str(e)}")


@shared_task
def generate_receipt_pdf(payment_id):
    """
    Generate PDF receipt for a payment.
    """
    from finance.models import Payment
    
    try:
        payment = Payment.objects.select_related(
            'receipt', 'student', 'invoice', 'tenant'
        ).get(id=payment_id)
        
        if not hasattr(payment, 'receipt'):
            logger.warning(f"No receipt found for payment {payment.payment_reference}")
            return
        
        receipt = payment.receipt
        
        # TODO: Implement PDF generation using ReportLab or WeasyPrint
        # For now, just log
        logger.info(f"PDF generation queued for receipt {receipt.receipt_number}")
        
        # Placeholder for PDF generation
        # receipt.pdf_file = generate_pdf_file(receipt)
        # receipt.save()
        
    except Payment.DoesNotExist:
        logger.error(f"Payment not found: {payment_id}")
    except Exception as e:
        logger.error(f"Failed to generate receipt PDF: {str(e)}")


@shared_task
def send_fee_reminders():
    """
    Send fee payment reminders for overdue invoices.
    Runs daily via Celery Beat.
    """
    from finance.models import Invoice
    from communications.models import Notification
    from sis.models import StudentGuardian
    from tenants.models import Tenant
    
    try:
        # Get all active tenants
        tenants = Tenant.objects.filter(status='active')
        
        for tenant in tenants:
            # Get overdue invoices
            overdue_invoices = Invoice.objects.filter(
                tenant=tenant,
                status__in=['issued', 'partially_paid'],
                due_date__lt=timezone.now().date()
            ).select_related('student')
            
            for invoice in overdue_invoices:
                # Get primary guardian
                primary_guardian = StudentGuardian.objects.filter(
                    student=invoice.student,
                    is_primary=True,
                    tenant=tenant
                ).select_related('guardian').first()
                
                if not primary_guardian:
                    continue
                
                guardian = primary_guardian.guardian
                
                # Calculate days overdue
                days_overdue = (timezone.now().date() - invoice.due_date).days
                
                message = (
                    f"Fee reminder for {invoice.student.get_full_name()}. "
                    f"Invoice {invoice.invoice_number} is {days_overdue} days overdue. "
                    f"Amount due: {invoice.currency} {invoice.balance}. "
                    f"Please make payment to avoid penalties."
                )
                
                # Create SMS notification
                if guardian.phone:
                    Notification.objects.create(
                        tenant=tenant,
                        recipient_guardian=guardian,
                        recipient_phone=guardian.phone,
                        channel='sms',
                        subject='Fee Payment Reminder',
                        message=message,
                        student=invoice.student,
                        status='pending',
                        priority=3
                    )
        
        logger.info("Fee reminders sent successfully")
        
    except Exception as e:
        logger.error(f"Failed to send fee reminders: {str(e)}")


@shared_task
def reconcile_pending_payments():
    """
    Reconcile pending payment requests by querying M-Pesa status.
    Runs every 15 minutes via Celery Beat.
    """
    from finance.models import PaymentRequest
    from finance.services import MpesaService
    from datetime import timedelta
    
    try:
        # Get pending payment requests older than 2 minutes
        cutoff_time = timezone.now() - timedelta(minutes=2)
        
        pending_requests = PaymentRequest.objects.filter(
            status='sent',
            initiated_at__lt=cutoff_time,
            expires_at__gt=timezone.now()
        ).select_related('tenant')
        
        mpesa_service = MpesaService()
        
        for request in pending_requests:
            try:
                # Query transaction status
                status = mpesa_service.query_transaction_status(str(request.id))
                
                # Process based on status
                result_code = status.get('ResultCode')
                
                if result_code == '0':
                    # Success - should have received callback, but process anyway
                    logger.info(f"Payment request {request.request_id} completed")
                elif result_code in ['1032', '1037']:
                    # Cancelled or timeout
                    request.status = 'expired'
                    request.save()
                    logger.info(f"Payment request {request.request_id} expired")
                
            except Exception as e:
                logger.error(f"Failed to query status for {request.request_id}: {str(e)}")
                continue
        
        logger.info(f"Reconciled {pending_requests.count()} pending payment requests")
        
    except Exception as e:
        logger.error(f"Payment reconciliation failed: {str(e)}")


@shared_task
def update_overdue_invoices():
    """
    Update invoice status to 'overdue' for invoices past due date.
    Runs daily via Celery Beat.
    """
    from finance.models import Invoice
    
    try:
        updated = Invoice.objects.filter(
            status='issued',
            due_date__lt=timezone.now().date()
        ).update(status='overdue')
        
        logger.info(f"Updated {updated} invoices to overdue status")
        
    except Exception as e:
        logger.error(f"Failed to update overdue invoices: {str(e)}")


@shared_task
def generate_monthly_financial_report(tenant_id):
    """
    Generate monthly financial report for a tenant.
    """
    from finance.models import Payment, Invoice, Ledger
    from tenants.models import Tenant
    from django.db.models import Sum
    from datetime import datetime, timedelta
    
    try:
        tenant = Tenant.objects.get(id=tenant_id)
        
        # Get current month date range
        today = timezone.now().date()
        first_day = today.replace(day=1)
        last_day = (first_day + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        # Calculate metrics
        payments = Payment.objects.filter(
            tenant=tenant,
            payment_date__gte=first_day,
            payment_date__lte=last_day,
            status='completed'
        )
        
        invoices = Invoice.objects.filter(
            tenant=tenant,
            issue_date__gte=first_day,
            issue_date__lte=last_day
        )
        
        report = {
            'tenant': tenant.name,
            'period': f"{first_day} to {last_day}",
            'total_revenue': payments.aggregate(Sum('amount'))['amount__sum'] or 0,
            'invoices_issued': invoices.count(),
            'total_invoiced': invoices.aggregate(Sum('total_amount'))['total_amount__sum'] or 0,
            'payments_received': payments.count(),
            'outstanding_balance': invoices.aggregate(Sum('balance'))['balance__sum'] or 0,
        }
        
        logger.info(f"Monthly financial report generated for {tenant.name}")
        
        # TODO: Send report via email or save to file
        
        return report
        
    except Tenant.DoesNotExist:
        logger.error(f"Tenant not found: {tenant_id}")
    except Exception as e:
        logger.error(f"Failed to generate financial report: {str(e)}")


@shared_task
def bulk_invoice_generation(academic_year_id, term_id=None, grade_id=None):
    """
    Generate invoices in bulk for multiple students.
    """
    from finance.services import InvoiceService
    from tenants.utils import set_current_tenant, clear_current_tenant
    from academics.models import AcademicYear
    
    try:
        academic_year = AcademicYear.objects.select_related('tenant').get(id=academic_year_id)
        set_current_tenant(academic_year.tenant)
        
        invoice_service = InvoiceService()
        result = invoice_service.bulk_generate_invoices(
            academic_year_id=academic_year_id,
            term_id=term_id,
            grade_id=grade_id
        )
        
        logger.info(
            f"Bulk invoice generation completed: "
            f"{result['success_count']} successful, {result['error_count']} failed"
        )
        
        return result
        
    except AcademicYear.DoesNotExist:
        logger.error(f"Academic year not found: {academic_year_id}")
    except Exception as e:
        logger.error(f"Bulk invoice generation failed: {str(e)}")
    finally:
        clear_current_tenant()
