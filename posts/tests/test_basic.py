from django.test import TestCase
from django.contrib.auth.models import User

class PostBasicTest(TestCase):
    def test_basic_math(self):
        """Checking that basic mathematical operations work"""
        self.assertEqual(1 + 1, 2)
        self.assertEqual(2 * 2, 4)
    
    def test_user_creation(self):
        """Checking user creation"""
        user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.assertEqual(user.username, 'testuser')