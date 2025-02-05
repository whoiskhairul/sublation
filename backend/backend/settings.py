
import os
from dotenv import load_dotenv
from pathlib import Path
import dj_database_url

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-#_9wf*p)_&$*-&fy5!vr%vqi!h04b*04mv*$14=_gjnavq9gem'

load_dotenv()


# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')  # Fetch from environment variable
# Application definition

INSTALLED_APPS = [
    #for websocket support 
    'channels',
    'daphne',

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
    'django.middleware.security.SecurityMiddleware',
    'allauth.account.middleware.AccountMiddleware', # allauth middleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # for enabling CORS headers 
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

# Database configuration for SQLite

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }

# Database configuration for PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'folia',
        'USER': 'sublation',
        'PASSWORD': 'Planspiel',

        # Uncomment the following line while using Docker, comment it out while using local machine
        # 'HOST': 'db',
        'PORT': 5432,
    }
}

# Database configuration for Railway hosting
DATABASE_URL = os.environ.get('DATABASE_URL')
print(DATABASE_URL)
DATABASES['default'] = dj_database_url.parse(DATABASE_URL)



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

# OpenAI API Key
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'  # Use App Password, NOT your email password
DEFAULT_FROM_EMAIL = 'your-email@gmail.com'


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
            'client_id': '91636302295-aq54b4197oeblo87d7bum3p700k1e1jb.apps.googleusercontent.com',
            'secret': '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',
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
    'ACCESS_TOKEN_LIFETIME': timedelta(days=730),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=730),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_COOKIE': 'refresh_token',  # Name of the cookie
    'AUTH_COOKIE_SECURE': True,  # Secure in HTTPS
    'AUTH_COOKIE_HTTP_ONLY': True,  # HTTP-only
    'AUTH_COOKIE_PATH': '/',  # Cookie available site-wide
}

# Allauth Configuration: Enable email as the primary login and other allauth settings
ACCOUNT_AUTHENTICATION_METHOD = 'username' 
ACCOUNT_EMAIL_REQUIRED = False
ACCOUNT_USERNAME_REQUIRED = True
ACCOUNT_EMAIL_VERIFICATION = 'none'  # we should set it to 'mandatory' if we want email verification
# EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'  # Logs emails in console

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    'http://localhost:5173',
    "http://localhost:3001",

]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = True


CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173"
    
]
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

# Redis Configuration 
REDISHOST = os.getenv('REDISHOST', '127.0.0.1')

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            # "hosts": [("127.0.0.1", 6379)],  # Redis server host
            "hosts": [(REDISHOST, 6379)],  # Redis server host
        },
    },
}
WSGI_APPLICATION = 'backend.wsgi.application'
ASGI_APPLICATION = "backend.asgi.application"

