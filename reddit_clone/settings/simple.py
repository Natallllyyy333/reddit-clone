import os
from pathlib import Path
from django.core.management.utils import get_random_secret_key

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Debug mode - through environment variables
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# SECRET KEY 
SECRET_KEY = os.environ.get('SECRET_KEY')

if DEBUG:
    # In development, we use a random key if one is not set
    if not SECRET_KEY:
        SECRET_KEY = get_random_secret_key()
        print("⚠️  WARNING: Using random SECRET_KEY for development")
else:
    # In production, the key is REQUIRED
    if not SECRET_KEY:
        raise ValueError(
            "SECRET_KEY must be set in production environment! "
            "Set SECRET_KEY environment variable."
        )
    if len(SECRET_KEY) < 50 or SECRET_KEY.startswith('django-insecure-'):
        raise ValueError(
            "Please set a long, random SECRET_KEY environment variable for production. "
            "Current key is too short or uses the default insecure pattern."
        )

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Security settings
if not DEBUG:
    # Production security
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
else:
    # Development security (relaxed)
    SECURE_HSTS_SECONDS = 0
    SECURE_HSTS_INCLUDE_SUBDOMAINS = False
    SECURE_HSTS_PRELOAD = False
    SECURE_SSL_REDIRECT = False
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'users',
    'posts',
    'comments', 
    'home',
    'communities',
    'tests', 
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'reddit_clone.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'frontend' / 'templates'],
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

# Database configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'frontend' / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Authentication
LOGIN_URL = '/users/login/'
LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_URL = '/'


LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'django_errors.log',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'ERROR',
            'propagate': True,
        },
    },
}

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Heroku production settings 
if not DEBUG:
    try:
        import dj_database_url
        # Database configuration for Heroku
        DATABASES = {
            'default': dj_database_url.config(
                default=os.environ.get('DATABASE_URL'),
                conn_max_age=600,
                ssl_require=True
            )
        }
        print("✅ Production: Using PostgreSQL database")
    except ImportError:
        print("❌ WARNING: dj-database-url not installed. Using SQLite for production is not recommended!")
    
    # Static files for Heroku
    STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
    
    try:
        # Adding whitenoise middleware
        MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
        STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
        print("✅ Production: WhiteNoise configured for static files")
    except ImportError:
        print("❌ WARNING: whitenoise not installed. Static files may not work properly in production!")

# Internationalization for easy text changes
LANGUAGES = [
    ('en', 'English'),
    ('ru', 'Russian'),
]

LOCALE_PATHS = [
    os.path.join(BASE_DIR, 'locale'),
]

# Adding LocaleMiddleware to support translation
MIDDLEWARE.insert(2, 'django.middleware.locale.LocaleMiddleware')

# Production checks
if not DEBUG:
    # Additional production checks
    if not ALLOWED_HOSTS or ALLOWED_HOSTS == ['']:
        raise ValueError("ALLOWED_HOSTS must be set in production environment!")
    
    print("🚀 Production mode: All security settings are enabled")