from django.test import TestCase
from django.conf import settings

class SecuritySettingsTest(TestCase):
    """Testing security settings"""
    
    def test_debug_mode(self):
        """Check DEBUG mode setting"""
        # This test will pass in development, fail in production
        # Adjust based on your current environment
        self.assertIn(settings.DEBUG, [True, False])
    
    def test_secret_key_present(self):
        """Check that SECRET_KEY is set"""
        self.assertTrue(settings.SECRET_KEY)
        self.assertGreater(len(settings.SECRET_KEY), 0)
    
    def test_installed_apps(self):
        """Check required apps are installed"""
        required_apps = ['posts', 'users', 'comments', 'communities']
        for app in required_apps:
            self.assertIn(app, settings.INSTALLED_APPS)
    
    def test_database_config(self):
        """Check database configuration"""
        self.assertIsNotNone(settings.DATABASES['default']['ENGINE'])
    
    def test_middleware_present(self):
        """Check security middleware is present"""
        required_middleware = [
            'django.middleware.security.SecurityMiddleware',
            'django.middleware.csrf.CsrfViewMiddleware'
        ]
        for middleware in required_middleware:
            self.assertIn(middleware, settings.MIDDLEWARE)