import os
from pathlib import Path
from django.core.management.utils import get_random_secret_key

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Debug mode - through environment variables
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

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
    'cloudinary',
    'cloudinary_storage'
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # ADDED - Must be after SecurityMiddleware
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

# Database configuration - START WITH SQLITE
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

# Static files configuration - FIXED FOR HEROKU
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'frontend' / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'

# WhiteNoise configuration for static files
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

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

# Media files configuration - CLOUDINARY
MEDIA_URL = '/media/'  # This will be overridden by Cloudinary in production
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Cloudinary configuration - MOVED OUTSIDE DEBUG CHECK
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.environ.get('CLOUDINARY_CLOUD_NAME', ''),
    'API_KEY': os.environ.get('CLOUDINARY_API_KEY', ''), 
    'API_SECRET': os.environ.get('CLOUDINARY_API_SECRET', ''),
    'SECURE': True,
}

# Use Cloudinary only if credentials are provided
if (os.environ.get('CLOUDINARY_CLOUD_NAME') and 
    os.environ.get('CLOUDINARY_API_KEY') and 
    os.environ.get('CLOUDINARY_API_SECRET')):
    DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
    print("✅ Cloudinary storage configured successfully")
else:
    print("⚠️  Cloudinary credentials not found. Using local media storage.")

# Heroku production settings - FIXED VERSION
if not DEBUG:
    print("🚀 Production mode: All security settings are enabled")
    
    # Database configuration for Heroku
    database_url = os.environ.get('DATABASE_URL')
    if database_url:
        try:
            import dj_database_url
            # Use parse() instead of config() for explicit parsing
            DATABASES = {
                'default': dj_database_url.parse(database_url, conn_max_age=600)
            }
            print(f"✅ Production: Using PostgreSQL database from DATABASE_URL")
        except ImportError:
            print("❌ ERROR: dj-database-url not installed but DATABASE_URL is set!")
        except Exception as e:
            print(f"❌ ERROR parsing DATABASE_URL: {e}")
            # Keep SQLite as fallback
    else:
        print("❌ WARNING: DATABASE_URL not found! Using SQLite in production (NOT RECOMMENDED)")

    # Additional production checks
    if not ALLOWED_HOSTS or ALLOWED_HOSTS == ['']:
        raise ValueError("ALLOWED_HOSTS must be set in production environment!")

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