
import os
from dotenv import load_dotenv
from pathlib import Path
import dj_database_url

load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', os.getenv('SECRET_KEY', 'django-insecure-#_9wf*p)_&$*-&fy5!vr%vqi!h04b*04mv*$14=_gjnavq9gem'))

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'True').lower() in ('true', '1', 't')

ALLOWED_HOSTS = os.getenv('DJANGO_ALLOWED_HOSTS', 'localhost 127.0.0.1 [::1] *').split()

# AI Configuration (Gemini via OpenAI SDK)
# Google Gemini provides an OpenAI-compatible endpoint at https://generativelanguage.googleapis.com/v1beta/openai/
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY') or os.getenv('OPENAI_API_KEY')
OPENAI_API_KEY = GEMINI_API_KEY
GEMINI_BASE_URL = os.getenv('GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta/openai/')
GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-3.5-flash')

INSTALLED_APPS = [
    'daphne',
    "whitenoise.runserver_nostatic",
    'channels',

    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # apps that is created by us.
    'appointment_chatbot',
    'authentication',
    'bpmn',
    'bpmn_error_detection',
    

    # third party apps
    'django_json_widget', #for easier input of JSONField in the admin panel
    "bootstrap_datepicker_plus", #for easier input of TimeField in the admin panel

    # For authentication and authorization 
    'rest_framework',
    'rest_framework.authtoken',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',

    'allauth.socialaccount.providers.google',
    'dj_rest_auth',
    'dj_rest_auth.registration',
    'corsheaders',
    'ckeditor',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # MUST be at the top to handle preflight CORS
    'django.middleware.security.SecurityMiddleware',
    "whitenoise.middleware.WhiteNoiseMiddleware",  # for serving static files
    'allauth.account.middleware.AccountMiddleware', # allauth middleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': ['templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DB_NAME = os.getenv('DB_NAME', 'folia')
DB_USER = os.getenv('DB_USER', 'sublation')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'Planspiel')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')

DEFAULT_DATABASE_URL = f"postgres://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

DATABASES = {
    'default': dj_database_url.config(
        default=os.getenv('DATABASE_URL', DEFAULT_DATABASE_URL),
        conn_max_age=600,
        conn_health_checks=True,
    )
}



# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Europe/Berlin'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = '/static/'

# Directory where static files will be collected 
STATIC_ROOT = BASE_DIR / 'staticfiles'


# Additional directories to look for static files
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]
# URL for media files (uploaded files)
MEDIA_URL = '/media/'

# Directory for storing uploaded media files
MEDIA_ROOT = BASE_DIR / 'media'


# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Email Configuration
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True').lower() in ('true', '1', 't')
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'webmaster@localhost')


# Required for Django-Allauth
SITE_ID = 1

#  Allauth authentication backends to handle email login and social accounts:
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',  # Django's default
    'allauth.account.auth_backends.AuthenticationBackend',  # allauth
]

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'APP': {
            'client_id': os.getenv('GOOGLE_CLIENT_ID', ''),
            'secret': os.getenv('GOOGLE_CLIENT_SECRET', ''),
            'key': ''
        },
        # Optionally define extra parameters (scopes, auth params, etc.)
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        }
    }
}

# Configuration of DRF to use JWT tokens
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

# Configuration of Simple JWT tokens
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

REST_AUTH = {
    'USE_JWT': True,
    'JWT_AUTH_HTTPONLY': False,
    'USER_DETAILS_SERIALIZER': 'authentication.serializers.CustomUserDetailsSerializer',
}

# Allauth Configuration: Enable email as the primary login and other allauth settings
ACCOUNT_AUTHENTICATION_METHOD = 'username' 
ACCOUNT_EMAIL_REQUIRED = False
ACCOUNT_USERNAME_REQUIRED = True
ACCOUNT_EMAIL_VERIFICATION = 'none'  # we should set it to 'mandatory' if we want email verification
# EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'  # Logs emails in console

# CORS & CSRF Configuration
extra_cors = os.getenv('CORS_ALLOWED_ORIGINS', '').split()
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3001",
    "https://folia.sublation.tech",
] + [origin.strip() for origin in extra_cors if origin.strip()]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = os.getenv('CORS_ALLOW_ALL_ORIGINS', 'False').lower() in ('true', '1')

# Cookie security settings (auto-secure in production)
SESSION_COOKIE_SAMESITE = os.getenv('SESSION_COOKIE_SAMESITE', 'Lax')
SESSION_COOKIE_SECURE = not DEBUG or os.getenv('SESSION_COOKIE_SECURE', 'False').lower() in ('true', '1')
CSRF_COOKIE_SECURE = not DEBUG or os.getenv('CSRF_COOKIE_SECURE', 'False').lower() in ('true', '1')

extra_csrf = os.getenv('CSRF_TRUSTED_ORIGINS', '').split()
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://folia.sublation.tech",
    "https://pure-celebration-production.up.railway.app",
] + [origin.strip() for origin in extra_csrf if origin.strip()]
CORS_ALLOW_HEADERS = [
'accept',
'accept-encoding',
'authorization',
'content-type',
'dnt',
'origin',
'user-agent',
'x-csrftoken',
'x-requested-with',
]


AUTH_USER_MODEL = 'authentication.User'

# REST_AUTH_SERIALIZERS = {
#     'USER_DETAILS_SERIALIZER': 'authentication.serializers.CustomUserDetailsSerializer'
# }

# Redis Configuration & Channel Layers
REDISHOST = os.getenv('REDISHOST', '127.0.0.1')
USE_REDIS = os.getenv('USE_REDIS', '').lower() in ('true', '1')

REDIS_URL = os.getenv('REDIS_URL')
if REDIS_URL:
    REDIS_URL = REDIS_URL.strip().strip('"\'')
    if REDIS_URL.startswith('REDIS_URL='):
        REDIS_URL = REDIS_URL[len('REDIS_URL='):].strip().strip('"\'')

import ssl

def get_channel_layers():
    # If explicitly enabled, in production, or REDIS_URL is provided, use RedisChannelLayer
    if REDIS_URL:
        # Upstash requires TLS/SSL (rediss://). Pass ssl_cert_reqs=None and ssl_check_hostname=False
        if REDIS_URL.startswith("rediss://"):
            return {
                "default": {
                    "BACKEND": "channels_redis.core.RedisChannelLayer",
                    "CONFIG": {
                        "hosts": [{
                            "address": REDIS_URL,
                            "ssl_cert_reqs": None,
                            "ssl_check_hostname": False,
                        }],
                    },
                },
            }
        return {
            "default": {
                "BACKEND": "channels_redis.core.RedisChannelLayer",
                "CONFIG": {
                    "hosts": [REDIS_URL],
                },
            },
        }
    if USE_REDIS or not DEBUG:
        return {
            "default": {
                "BACKEND": "channels_redis.core.RedisChannelLayer",
                "CONFIG": {
                    "hosts": [(REDISHOST, int(os.getenv('REDISPORT', 6379)))],
                },
            },
        }
    # For local development without a standalone Redis service, use InMemoryChannelLayer
    return {
        "default": {
            "BACKEND": "channels.layers.InMemoryChannelLayer"
        }
    }

CHANNEL_LAYERS = get_channel_layers()
WSGI_APPLICATION = 'backend.wsgi.application'
ASGI_APPLICATION = "backend.asgi.application"

