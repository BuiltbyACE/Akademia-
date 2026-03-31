"""
Django settings for elimu_backend project.
"""

from pathlib import Path
import environ
import os
import importlib.util

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Initialize environment variables
env = environ.Env(
    DEBUG=(bool, True),
    USE_S3=(bool, False),
    USE_REDIS_CACHE=(bool, False),
)

# Read .env file if it exists
env_file = BASE_DIR.parent / '.env'
if env_file.exists():
    environ.Env.read_env(str(env_file))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('SECRET_KEY', default='django-insecure-w2wlzuen&z9#x68b93oo+^)3ycr$d2@!$y6&#7@evm3ac(a=iv')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env.bool('DEBUG', default=True)

ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['localhost', '127.0.0.1'])

# Silence system checks for development
SILENCED_SYSTEM_CHECKS = [
    'django_ratelimit.E003',  # LocMemCache is not a shared cache (fine for dev)
    'django_ratelimit.W001',  # LocMemCache not officially supported (fine for dev)
    'axes.W004',  # Deprecated AXES setting (we'll fix later)
]

# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    
    # Third-party apps
    "rest_framework",
    "rest_framework_simplejwt",
    "drf_spectacular",
    "django_filters",
    "corsheaders",
    "django_ratelimit",
    "axes",
    
    # Local apps
    "tenants",
    "accounts",
    "sis",
    "academics",
    "attendance",
    "finance",
    "communications",
    "reports",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "axes.middleware.AxesMiddleware",
    "tenants.middleware.TenantMiddleware",
]

ROOT_URLCONF = "elimu_backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "elimu_backend.wsgi.application"


# Database
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "elimu_db",
        "USER": "postgres",
        "PASSWORD": "12345677",
        "HOST": "localhost",
        "PORT": "5432",
    }
}


# Cache Configuration
USE_REDIS_CACHE = env.bool('USE_REDIS_CACHE', default=False)
REDIS_URL = env('REDIS_URL', default='').strip()

if DEBUG and not USE_REDIS_CACHE:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'elimu-local',
        }
    }
else:
    if not REDIS_URL:
        REDIS_URL = 'redis://127.0.0.1:6379/0'

    has_django_redis = importlib.util.find_spec('django_redis') is not None

    if has_django_redis:
        CACHES = {
            'default': {
                'BACKEND': 'django_redis.cache.RedisCache',
                'LOCATION': REDIS_URL,
                'OPTIONS': {
                    'CLIENT_CLASS': 'django_redis.client.DefaultClient',
                },
                'KEY_PREFIX': 'elimu',
            }
        }
    else:
        CACHES = {
            'default': {
                'BACKEND': 'django.core.cache.backends.redis.RedisCache',
                'LOCATION': REDIS_URL,
                'KEY_PREFIX': 'elimu',
            }
        }


# Celery Configuration
CELERY_BROKER_URL = env('CELERY_BROKER_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = env('CELERY_RESULT_BACKEND', default='redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'

# Celery Beat Schedule
from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    'send-fee-reminders-daily': {
        'task': 'finance.tasks.send_fee_reminders',
        'schedule': crontab(hour=8, minute=0),  # Daily at 8 AM
    },
    'reconcile-pending-payments': {
        'task': 'finance.tasks.reconcile_pending_payments',
        'schedule': crontab(minute='*/15'),  # Every 15 minutes
    },
    'update-overdue-invoices': {
        'task': 'finance.tasks.update_overdue_invoices',
        'schedule': crontab(hour=0, minute=0),  # Daily at midnight
    },
    'send-pending-notifications': {
        'task': 'communications.tasks.send_pending_notifications',
        'schedule': crontab(minute='*/5'),  # Every 5 minutes
    },
    'process-scheduled-broadcasts': {
        'task': 'communications.tasks.process_scheduled_broadcasts',
        'schedule': crontab(minute='*/10'),  # Every 10 minutes
    },
    'retry-failed-notifications': {
        'task': 'communications.tasks.retry_failed_notifications',
        'schedule': crontab(hour='*/6', minute=0),  # Every 6 hours
    },
    'cleanup-old-notifications': {
        'task': 'communications.tasks.cleanup_old_notifications',
        'schedule': crontab(hour=2, minute=0, day_of_week=0),  # Weekly on Sunday at 2 AM
    },
}


# Custom User Model
AUTH_USER_MODEL = 'accounts.User'


# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {
            "min_length": 8,
        }
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = env('TIME_ZONE', default='Africa/Nairobi')

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"


# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
    },
}


# JWT Configuration
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}


# DRF Spectacular (API Documentation)
SPECTACULAR_SETTINGS = {
    'TITLE': 'Elimu School OS API',
    'DESCRIPTION': 'School Operating System API Documentation',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'SCHEMA_PATH_PREFIX': '/api/v1/',
}


# CORS Configuration
CORS_ALLOWED_ORIGINS = env.list(
    'CORS_ALLOWED_ORIGINS',
    default=['http://localhost:4200', 'http://localhost:3000']
)
CORS_ALLOW_CREDENTIALS = True


# Security Settings
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True


# Django Axes Configuration (Brute Force Protection)
AUTHENTICATION_BACKENDS = [
    'axes.backends.AxesStandaloneBackend',
    'django.contrib.auth.backends.ModelBackend',
]

AXES_FAILURE_LIMIT = 5
AXES_COOLOFF_TIME = 1
AXES_LOCK_OUT_BY_COMBINATION_USER_AND_IP = True


# Email Configuration
EMAIL_BACKEND = env('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = env('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = env.int('EMAIL_PORT', default=587)
EMAIL_USE_TLS = env.bool('EMAIL_USE_TLS', default=True)
EMAIL_HOST_USER = env('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default='noreply@elimu.school')


# Application Settings
SITE_NAME = env('SITE_NAME', default='Elimu School OS')
FRONTEND_URL = env('FRONTEND_URL', default='http://localhost:4200')


# M-Pesa Configuration
MPESA_ENVIRONMENT = env('MPESA_ENVIRONMENT', default='sandbox')
MPESA_CONSUMER_KEY = env('MPESA_CONSUMER_KEY', default='')
MPESA_CONSUMER_SECRET = env('MPESA_CONSUMER_SECRET', default='')
MPESA_SHORTCODE = env('MPESA_SHORTCODE', default='')
MPESA_PASSKEY = env('MPESA_PASSKEY', default='')
MPESA_CALLBACK_URL = env('MPESA_CALLBACK_URL', default='')


# SMS Configuration
SMS_API_KEY = env('SMS_API_KEY', default='')
SMS_USERNAME = env('SMS_USERNAME', default='')


# Sentry Configuration (Error Tracking)
SENTRY_DSN = env('SENTRY_DSN', default='')
if SENTRY_DSN and not DEBUG:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration
    
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[DjangoIntegration()],
        traces_sample_rate=0.1,
        send_default_pii=False,
    )


# Logging Configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'elimu.log',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Create logs directory
os.makedirs(BASE_DIR / 'logs', exist_ok=True)


# Default Auto Field
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
