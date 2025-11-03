import os
from pathlib import Path
from django.core.management.utils import get_random_secret_key
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

# Debug mode - through environment variables
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

# SECRET KEY 
SECRET_KEY = os.environ.get('SECRET_KEY')

if DEBUG:
    if not SECRET_KEY:
        SECRET_KEY = get_random_secret_key()
        print("⚠️  WARNING: Using random SECRET_KEY for development")
else:
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY must be set in production environment!")
    if len(SECRET_KEY) < 50 or SECRET_KEY.startswith('django-insecure-'):
        raise ValueError("Please set a long, random SECRET_KEY for production")

# ALLOWED_HOSTS
DEFAULT_HOSTS = ['localhost', '127.0.0.1', 'reddit-clone-d86456f48b72.herokuapp.com', '.herokuapp.com']
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', ','.join(DEFAULT_HOSTS)).split(',')

# Security settings
if not DEBUG:
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
else:
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
    'whitenoise.middleware.WhiteNoiseMiddleware',
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

DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    DATABASES['default'] = dj_database_url.parse(DATABASE_URL, conn_max_age=600)
    print("✅ Production: Using PostgreSQL database")

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files configuration
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'frontend' / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

WHITENOISE_AUTOREFRESH = True
WHITENOISE_USE_FINDERS = True

STATICFILES_FINDERS = [
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
]

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Authentication
LOGIN_URL = '/users/login/'
LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_URL = '/'

# Media files configuration - CLOUDINARY
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Cloudinary configuration
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.environ.get('CLOUDINARY_CLOUD_NAME', ''),
    'API_KEY': os.environ.get('CLOUDINARY_API_KEY', ''), 
    'API_SECRET': os.environ.get('CLOUDINARY_API_SECRET', ''),
    'SECURE': True,
    'STATICFILES_MANIFEST_ROOT': os.path.join(BASE_DIR, 'my-manifest-directory'),
    'INVALID_VIDEO_ERROR_MESSAGE': 'This file is not a valid video',
}

# ВСЕГДА используем Cloudinary в production, даже если DEBUG=True
cloud_name = os.environ.get('CLOUDINARY_CLOUD_NAME')
api_key = os.environ.get('CLOUDINARY_API_KEY')
api_secret = os.environ.get('CLOUDINARY_API_SECRET')

if cloud_name and api_key and api_secret:
    DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
    CLOUDINARY_FORCE_MEDIA_OVERWRITE = True
    print("✅ Cloudinary storage configured successfully")
else:
    print("❌ Cloudinary credentials missing")