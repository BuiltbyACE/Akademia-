Akademia is a comprehensive school operating system that goes beyond traditional school management. It's built as the operational brain of schools, handling admissions, academics, finance, parent communication, compliance, and analytics in one unified platform.

##  Vision

Build the school operating system that becomes indispensable through:
- **Operational lock-in** via records, transcripts, audit trails
- **Workflow lock-in** via automation, alerts, and approvals
- **Payment lock-in** via M-Pesa integration and reconciliation
- **Data moat** via analytics and performance insights

##  Architecture

### Core Stack
- **Backend**: Django 6.0 + Django REST Framework
- **Database**: PostgreSQL 16 (with Row Level Security for tenant isolation)
- **Cache & Queue**: Redis + Celery
- **Frontend**: Angular 18+ PWA (to be implemented)
- **Payments**: M-Pesa Daraja API (first-class integration)

### Architecture Decisions
- **Modular Monolith** (not microservices) for velocity
- **Shared Database Multi-Tenancy** with tenant_id + RLS
- **REST API** with versioning (`/api/v1/`)
- **JWT Authentication** with OAuth2/OIDC-ready design
- **Payment-Native Design** - M-Pesa as core primitive, not plugin

##  Project Structure

```
Elimu/
├── backend/
│   ├── elimu_backend/
│   │   ├── tenants/          # Multi-tenant core
│   │   ├── accounts/         # User management & auth
│   │   ├── sis/              # Student Information System
│   │   ├── academics/        # Academic structure
│   │   ├── attendance/       # Attendance tracking
│   │   ├── finance/          # Fees, invoices, payments
│   │   ├── communications/   # Notifications
│   │   └── reports/          # Report cards, transcripts
│   ├── requirements.txt
│   ├── Dockerfile
│   └── docker-compose.yml
└── frontend/                 # Angular PWA (to be implemented)
```

## Quick Start

### Prerequisites
- Python 3.12+
- PostgreSQL 16+
- Redis 7+
- Docker & Docker Compose (optional)

### Local Development Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd Elimu
```

2. **Set up Python environment**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start services with Docker Compose**
```bash
docker-compose up -d db redis
```

5. **Run migrations**
```bash
cd elimu_backend
python manage.py makemigrations
python manage.py migrate
```

6. **Create superuser**
```bash
python manage.py createsuperuser
```

7. **Run development server**
```bash
python manage.py runserver
```

8. **Start Celery worker (in another terminal)**
```bash
celery -A elimu_backend worker -l info
```

### Using Docker Compose (Full Stack)

```bash
cd backend
docker-compose up --build
```

Access the application at `http://localhost:8000`

##  Key Features

### Phase 1: Foundation 
- [x] Multi-tenant architecture with RLS
- [x] Custom User model with email authentication
- [x] Tenant middleware and context management
- [x] Environment-based configuration
- [x] Docker setup for local development

### Phase 2: Core Domain Models 
- [x] **Tenants**: School profiles, configuration, domains
- [x] **Accounts**: Users, roles, permissions, audit logs
- [x] **SIS**: Students, guardians, enrollments, documents
- [x] **Academics**: Years, terms, grades, classes, subjects, grading
- [x] **Attendance**: Sessions, records, alerts, summaries
- [x] **Finance**: Fee structures, invoices, payments, M-Pesa integration, receipts, ledger
- [x] **Communications**: Notification templates, multi-channel delivery, broadcasts
- [x] **Reports**: Report cards, subject grades, transcripts

### Phase 3-10: In Progress 
- [ ] M-Pesa Daraja API integration
- [ ] REST API layer with DRF
- [ ] Authentication endpoints (JWT)
- [ ] Core CRUD APIs for all modules
- [ ] Angular PWA frontend
- [ ] Role-based dashboards
- [ ] PDF generation for reports
- [ ] SMS/Email notifications
- [ ] Production deployment

##  Database Models

### Multi-Tenant Core
- **Tenant**: School/institution with subscription and configuration
- **TenantConfig**: Customizable settings per school
- **TenantDomain**: Custom domain mapping for white-labeling

### User Management
- **User**: Email-based authentication with MFA support
- **TenantUser**: User-tenant-role mapping
- **Role** & **Permission**: RBAC system
- **AuditLog**: Immutable audit trail

### Student Information
- **Student**: Core student records
- **Guardian**: Parent/guardian information
- **StudentGuardian**: Relationship mapping
- **Enrollment**: Year/class assignments
- **Document**: File uploads and verification

### Academic Structure
- **AcademicYear**, **Term**: Time periods
- **Grade**, **Class**: Grade levels and streams
- **Subject**: Course catalog
- **ClassSubject**: Subject-class mapping
- **TeacherAssignment**: Teacher-subject assignments
- **GradingScale**: Configurable grading systems

### Attendance
- **AttendanceSession**: Daily or per-period sessions
- **AttendanceRecord**: Individual attendance marks
- **AttendanceAlert**: Automated intervention alerts
- **AttendanceSummary**: Cached statistics

### Finance (Payment-Native)
- **FeeStructure**: Fee definitions
- **Invoice** & **InvoiceLineItem**: Billing
- **Payment**: Payment records
- **PaymentRequest**: M-Pesa STK Push requests
- **PaymentCallback**: Provider webhook logs
- **Receipt**: Auto-generated receipts
- **Ledger**: Double-entry accounting

### Communications
- **NotificationTemplate**: Reusable templates
- **Notification**: Multi-channel delivery queue
- **BroadcastMessage**: Group messaging

### Reports
- **ReportCard** & **SubjectGrade**: Term reports
- **Transcript**: Official academic records

## 🔐 Security

- **Tenant Isolation**: Row Level Security + middleware enforcement
- **Authentication**: JWT with refresh token rotation
- **MFA**: Optional two-factor authentication
- **Audit Logging**: Immutable logs for all critical actions
- **Rate Limiting**: API throttling per tenant/user
- **Brute Force Protection**: Django Axes integration
- **Payment Security**: Idempotency keys, callback verification

## Multi-Tenant Strategy

**Shared Database with tenant_id:**
- Every tenant-owned row has `tenant_id`
- PostgreSQL Row Level Security enforces isolation
- Tenant context resolved per request via middleware
- Configuration over customization (no code forks)

**Tenant Resolution:**
1. `X-Tenant-Slug` header
2. Subdomain (e.g., `school.elimu.app`)
3. Custom domain mapping

## Monetization Model

**Hybrid Pricing:**
- Base platform fee + per-active-student pricing
- Tiered plans: Basic, Pro, Enterprise
- Add-ons: Advanced analytics, WhatsApp messaging, API access

**Revenue Drivers:**
- Payment processing (M-Pesa reconciliation)
- Multi-campus management
- White-label branding
- Premium support & SLAs

## API Documentation

API documentation will be available at:
- Swagger UI: `http://localhost:8000/api/docs/`
- ReDoc: `http://localhost:8000/api/redoc/`
- OpenAPI Schema: `http://localhost:8000/api/schema/`

##  Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=.

# Run specific module
pytest tenants/tests/
```

##  Environment Variables

Key environment variables (see `.env.example`):

```env
# Django
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/elimu_db

# Redis & Celery
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0

# M-Pesa
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=your-key
MPESA_CONSUMER_SECRET=your-secret
MPESA_SHORTCODE=your-shortcode
MPESA_PASSKEY=your-passkey

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email
EMAIL_HOST_PASSWORD=your-password

# SMS
SMS_API_KEY=your-api-key
SMS_USERNAME=your-username
```

## Deployment

### Production Checklist
- [ ] Set `DEBUG=False`
- [ ] Configure strong `SECRET_KEY`
- [ ] Set up PostgreSQL with backups
- [ ] Configure Redis persistence
- [ ] Set up Celery workers and beat
- [ ] Configure email/SMS providers
- [ ] Set up M-Pesa production credentials
- [ ] Configure S3 for file storage
- [ ] Set up monitoring (Sentry)
- [ ] Configure SSL/TLS
- [ ] Set up CDN for static files

### Recommended Infrastructure
- **AWS RDS** for PostgreSQL
- **AWS ElastiCache** for Redis
- **AWS ECS Fargate** for Django app
- **AWS S3** for file storage
- **AWS CloudFront** for CDN
- **AWS SES** for email

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- Django and DRF communities
- PostgreSQL for robust multi-tenancy support
- Safaricom Daraja API for M-Pesa integration
- Africa's education technology pioneers

##  Support

For support, email elijahogato.dev@gmail.com join our community Slack.

---

**Built  for African schools**
>>>>>>> 15a076a (Fix : removed nested git repo)
