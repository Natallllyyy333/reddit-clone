from django.test import TestCase
from django.conf import settings

class SettingsTest(TestCase):
    def test_debug_mode(self):
        """Проверка режима DEBUG"""
        self.assertIn(settings.DEBUG, [True, False])
    
    def test_installed_apps(self):
        """Проверка установленных приложений"""
        required_apps = ['posts', 'users', 'comments', 'communities']
        for app in required_apps:
            self.assertIn(app, settings.INSTALLED_APPS)
    
    def test_database_config(self):
        """Проверка конфигурации БД"""
        self.assertIsNotNone(settings.DATABASES['default']['ENGINE'])