# Phase 3: M-Pesa Payment Integration - Implementation Guide

## Overview

Phase 3 implements a complete M-Pesa Daraja API integration with payment reconciliation, callback handling, and automated workflows. This is a **payment-native** design where M-Pesa is a first-class primitive, not a plugin.

## Components Implemented

### 1. M-Pesa Service (`finance/services/mpesa_service.py`)

**Purpose**: Core M-Pesa Daraja API integration

**Key Features**:
- OAuth token management
- STK Push (Lipa Na M-Pesa Online) initiation
- Transaction status queries
- Callback processing with idempotency
- Phone number formatting
- Password generation for API requests

**Main Methods**:
```python
# Initiate payment request
payment_request = mpesa_service.initiate_stk_push(
    invoice_id=invoice.id,
    phone_number='0712345678',
    amount=5000
)

# Query transaction status
status = mpesa_service.query_transaction_status(payment_request.id)

# Process callback (called by M-Pesa webhook)
payment = mpesa_service.process_callback(callback_data, ip_address)
```

**Security Features**:
- Idempotent callback processing
- Duplicate payment prevention
- Transaction verification
- Secure password generation

### 2. Payment Service (`finance/services/payment_service.py`)

**Purpose**: Payment workflow management and reconciliation

**Key Features**:
- Manual payment recording (cash, bank transfer, etc.)
- Double-entry ledger creation
- Receipt generation
- Payment reconciliation
- Payment reversal
- Payment summary statistics

**Main Methods**:
```python
# Record manual payment
payment = payment_service.record_payment(
    invoice_id=invoice.id,
    amount=5000,
    payment_method='cash',
    payer_name='John Doe'
)

# Reconcile payment
payment_service.reconcile_payment(payment.id, user)

# Reverse payment
payment_service.reverse_payment(payment.id, 'Duplicate entry', user)

# Get payment summary
summary = payment_service.get_payment_summary(
    student_id=student.id,
    date_from='2024-01-01',
    date_to='2024-12-31'
)
```

### 3. Invoice Service (`finance/services/invoice_service.py`)

**Purpose**: Invoice generation and management

**Key Features**:
- Single and bulk invoice generation
- Fee structure application
- Invoice calculation and totaling
- Discount application
- Invoice cancellation
- Arrears tracking

**Main Methods**:
```python
# Generate invoice for student
invoice = invoice_service.generate_invoice(
    student_id=student.id,
    academic_year_id=year.id,
    term_id=term.id
)

# Bulk generate invoices
result = invoice_service.bulk_generate_invoices(
    academic_year_id=year.id,
    term_id=term.id,
    grade_id=grade.id
)

# Apply discount
invoice_service.apply_discount(
    invoice_id=invoice.id,
    discount_amount=1000,
    reason='Sibling discount'
)

# Get arrears summary
arrears = invoice_service.get_arrears_summary()
```

### 4. Celery Tasks (`finance/tasks.py`)

**Purpose**: Asynchronous payment processing and automation

**Implemented Tasks**:

1. **process_payment_callback**: Process M-Pesa callbacks asynchronously
2. **send_payment_confirmation**: Send SMS/email confirmation to parents
3. **generate_receipt_pdf**: Generate PDF receipts
4. **send_fee_reminders**: Daily fee payment reminders (Celery Beat)
5. **reconcile_pending_payments**: Query pending payment status (every 15 min)
6. **update_overdue_invoices**: Mark overdue invoices (daily)
7. **generate_monthly_financial_report**: Monthly financial reports
8. **bulk_invoice_generation**: Async bulk invoice generation

**Celery Beat Schedule**:
```python
CELERY_BEAT_SCHEDULE = {
    'send-fee-reminders-daily': {
        'task': 'finance.tasks.send_fee_reminders',
        'schedule': crontab(hour=8, minute=0),  # 8 AM daily
    },
    'reconcile-pending-payments': {
        'task': 'finance.tasks.reconcile_pending_payments',
        'schedule': crontab(minute='*/15'),  # Every 15 minutes
    },
    'update-overdue-invoices': {
        'task': 'finance.tasks.update_overdue_invoices',
        'schedule': crontab(hour=0, minute=0),  # Midnight daily
    },
}
```

### 5. Django Admin Interface (`finance/admin.py`)

**Purpose**: Admin interface for finance management

**Registered Models**:
- FeeStructure
- Invoice (with inline line items)
- Payment
- PaymentRequest
- PaymentCallback
- Receipt
- Ledger

**Features**:
- List views with filtering and search
- Detailed fieldsets
- Readonly fields for audit trail
- Inline editing for invoice line items

## M-Pesa Integration Flow

### 1. Payment Request Flow

```
1. User initiates payment
   ↓
2. System creates Invoice
   ↓
3. System calls mpesa_service.initiate_stk_push()
   ↓
4. M-Pesa sends STK Push to customer phone
   ↓
5. Customer enters PIN
   ↓
6. M-Pesa processes payment
   ↓
7. M-Pesa sends callback to system
   ↓
8. System processes callback (idempotent)
   ↓
9. System creates Payment record
   ↓
10. System updates Invoice balance
    ↓
11. System generates Receipt
    ↓
12. System sends confirmation to parent
```

### 2. Callback Processing (Idempotent)

```python
# M-Pesa callback structure
{
    "Body": {
        "stkCallback": {
            "MerchantRequestID": "...",
            "CheckoutRequestID": "...",
            "ResultCode": 0,
            "ResultDesc": "Success",
            "CallbackMetadata": {
                "Item": [
                    {"Name": "Amount", "Value": 5000},
                    {"Name": "MpesaReceiptNumber", "Value": "ABC123"},
                    {"Name": "PhoneNumber", "Value": "254712345678"}
                ]
            }
        }
    }
}
```

**Processing Steps**:
1. Log callback to PaymentCallback table
2. Find PaymentRequest by CheckoutRequestID
3. Check if already processed (idempotency)
4. Extract payment metadata
5. Create Payment record
6. Update Invoice balance
7. Create ledger entries
8. Generate receipt
9. Mark callback as processed
10. Trigger notifications

### 3. Reconciliation Flow

```
Celery Beat (every 15 minutes)
   ↓
Get pending PaymentRequests
   ↓
For each request:
   ↓
Query M-Pesa status
   ↓
If completed: Process payment
If failed: Mark as failed
If expired: Mark as expired
```

## Database Schema

### Payment Request
```sql
CREATE TABLE payment_requests (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    request_id VARCHAR(100) UNIQUE,
    invoice_id UUID NOT NULL,
    student_id UUID NOT NULL,
    amount DECIMAL(10,2),
    currency VARCHAR(3),
    phone_number VARCHAR(20),
    provider VARCHAR(50),
    provider_request_id VARCHAR(200),
    provider_response JSONB,
    status VARCHAR(20),
    payment_id UUID,
    initiated_at TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Payment Callback
```sql
CREATE TABLE payment_callbacks (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    provider VARCHAR(50),
    callback_data JSONB,
    payment_request_id UUID,
    is_processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP,
    processing_error TEXT,
    ip_address INET,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Payment
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    payment_reference VARCHAR(100) UNIQUE,
    invoice_id UUID NOT NULL,
    student_id UUID NOT NULL,
    amount DECIMAL(10,2),
    currency VARCHAR(3),
    payment_method VARCHAR(50),
    payment_date TIMESTAMP,
    transaction_id VARCHAR(200),
    transaction_reference VARCHAR(200),
    payer_name VARCHAR(200),
    payer_phone VARCHAR(20),
    payer_email VARCHAR(255),
    status VARCHAR(20),
    notes TEXT,
    is_reconciled BOOLEAN DEFAULT FALSE,
    reconciled_at TIMESTAMP,
    reconciled_by_id UUID,
    receipt_number VARCHAR(50),
    receipt_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Configuration

### Environment Variables

```env
# M-Pesa Configuration
MPESA_ENVIRONMENT=sandbox  # or production
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=174379  # Your business shortcode
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/v1/payments/mpesa/callback/
```

### M-Pesa API Endpoints

**Sandbox**:
- Base URL: `https://sandbox.safaricom.co.ke`
- Auth: `/oauth/v1/generate?grant_type=client_credentials`
- STK Push: `/mpesa/stkpush/v1/processrequest`
- Query: `/mpesa/stkpushquery/v1/query`

**Production**:
- Base URL: `https://api.safaricom.co.ke`
- Same endpoints as sandbox

## Usage Examples

### 1. Initiate M-Pesa Payment

```python
from finance.services import MpesaService
from finance.models import Invoice

# Get invoice
invoice = Invoice.objects.get(invoice_number='INV-2024-001')

# Initiate payment
mpesa_service = MpesaService()
payment_request = mpesa_service.initiate_stk_push(
    invoice_id=invoice.id,
    phone_number='0712345678',
    amount=invoice.balance
)

# Returns PaymentRequest object
print(f"Payment request created: {payment_request.request_id}")
print(f"Status: {payment_request.status}")
```

### 2. Record Manual Payment

```python
from finance.services import PaymentService

payment_service = PaymentService()
payment = payment_service.record_payment(
    invoice_id=invoice.id,
    amount=5000,
    payment_method='cash',
    payer_name='John Doe',
    notes='Payment received at front desk'
)

print(f"Payment recorded: {payment.payment_reference}")
print(f"Receipt: {payment.receipt_number}")
```

### 3. Generate Invoices in Bulk

```python
from finance.services import InvoiceService

invoice_service = InvoiceService()
result = invoice_service.bulk_generate_invoices(
    academic_year_id=academic_year.id,
    term_id=term.id,
    grade_id=grade.id  # Optional: specific grade
)

print(f"Generated {result['success_count']} invoices")
print(f"Failed: {result['error_count']}")
```

### 4. Process M-Pesa Callback (Webhook Endpoint)

```python
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from finance.tasks import process_payment_callback
import json

@csrf_exempt
def mpesa_callback(request):
    if request.method == 'POST':
        callback_data = json.loads(request.body)
        ip_address = request.META.get('REMOTE_ADDR')
        
        # Process asynchronously
        process_payment_callback.delay(callback_data, ip_address)
        
        return JsonResponse({'ResultCode': 0, 'ResultDesc': 'Accepted'})
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)
```

## Testing

### 1. M-Pesa Sandbox Testing

```python
# Test credentials (Safaricom sandbox)
MPESA_CONSUMER_KEY = 'your_sandbox_key'
MPESA_CONSUMER_SECRET = 'your_sandbox_secret'
MPESA_SHORTCODE = '174379'
MPESA_PASSKEY = 'sandbox_passkey'

# Test phone numbers
# Use: 254708374149 (always succeeds)
# Use: 254708374150 (always fails)
```

### 2. Unit Tests

```python
from django.test import TestCase
from finance.services import MpesaService, PaymentService
from finance.models import Invoice, Payment

class PaymentServiceTest(TestCase):
    def test_record_payment(self):
        # Create test invoice
        invoice = Invoice.objects.create(...)
        
        # Record payment
        service = PaymentService()
        payment = service.record_payment(
            invoice_id=invoice.id,
            amount=1000,
            payment_method='cash'
        )
        
        # Assertions
        self.assertEqual(payment.status, 'completed')
        self.assertTrue(payment.receipt_generated)
        
        # Check invoice updated
        invoice.refresh_from_db()
        self.assertEqual(invoice.amount_paid, 1000)
```

## Monitoring & Logging

### Key Metrics to Monitor

1. **Payment Success Rate**: Completed payments / Total payment requests
2. **Callback Processing Time**: Time to process M-Pesa callbacks
3. **Reconciliation Rate**: Reconciled payments / Total payments
4. **Failed Payments**: Count and reasons
5. **Pending Payments**: Payments stuck in pending state

### Logging

```python
import logging

logger = logging.getLogger(__name__)

# Payment initiated
logger.info(f"STK Push initiated: {payment_request.request_id}")

# Payment completed
logger.info(f"Payment processed: {payment.payment_reference}")

# Payment failed
logger.warning(f"Payment failed: {result_desc}")

# Callback processing error
logger.error(f"Callback processing failed: {str(e)}")
```

## Security Considerations

1. **Idempotency**: Callbacks processed only once using `is_processed` flag
2. **IP Whitelisting**: Verify M-Pesa callback IPs (TODO)
3. **HTTPS Only**: All M-Pesa communication over HTTPS
4. **Secrets Management**: Store credentials in environment variables
5. **Audit Trail**: All payment actions logged in AuditLog
6. **Transaction Verification**: Query M-Pesa for status confirmation
7. **Double-Entry Ledger**: Financial integrity through accounting

## Troubleshooting

### Common Issues

**1. STK Push Not Received**
- Check phone number format (254XXXXXXXXX)
- Verify M-Pesa credentials
- Check if phone is M-Pesa registered
- Verify shortcode is active

**2. Callback Not Processed**
- Check callback URL is publicly accessible
- Verify HTTPS is enabled
- Check Celery worker is running
- Review PaymentCallback logs

**3. Payment Stuck in Pending**
- Run reconciliation task manually
- Query transaction status via M-Pesa API
- Check payment request expiry time

**4. Duplicate Payments**
- Idempotency should prevent this
- Check `is_processed` flag on callbacks
- Review payment request status

## Next Steps

After Phase 3 completion:

1. **Phase 4**: Communication System - Implement SMS/Email/WhatsApp notifications
2. **Phase 5**: REST API Layer - Build DRF endpoints for all services
3. **Phase 6**: Reporting & Analytics - PDF generation, dashboards
4. **Phase 7**: Frontend - Angular PWA with payment UI

## References

- [Safaricom Daraja API Documentation](https://developer.safaricom.co.ke/)
- [M-Pesa API Guide](https://developer.safaricom.co.ke/docs)
- [Lipa Na M-Pesa Online](https://developer.safaricom.co.ke/lipa-na-m-pesa-online)
