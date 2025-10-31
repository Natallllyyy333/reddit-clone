from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from django.contrib.messages import get_messages
from users.forms import RegisterForm

class UserViewsTest(TestCase):
    def setUp(self):
        self.client = Client()

    def test_register_view_get(self):
        """Test GET request for registration"""
        response = self.client.get(reverse('register'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'registration/register.html')
        self.assertIsInstance(response.context['form'], RegisterForm)

    def test_register_view_post_valid(self):
        """Test POST request for registration with valid data"""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password1': 'complexpass123',
            'password2': 'complexpass123'
        }
        response = self.client.post(reverse('register'), data)
        
        self.assertEqual(response.status_code, 302)
        self.assertTrue(User.objects.filter(username='newuser').exists())
        self.assertTrue(User.objects.filter(email='newuser@example.com').exists())
        
        messages_list = list(get_messages(response.wsgi_request))
        self.assertEqual(str(messages_list[0]), 'Account created for newuser!')

    def test_register_view_post_invalid(self):
        """Test POST request for registration with invalid data"""
        data = {
            'username': 'newuser',
            'email': 'invalid-email',
            'password1': 'pass1',
            'password2': 'pass2'  # Passwords don't match
        }
        response = self.client.post(reverse('register'), data)
        
        self.assertEqual(response.status_code, 200)
        self.assertFalse(User.objects.filter(username='newuser').exists())

    def test_register_view_duplicate_email(self):
        """Test registration with existing email"""
        User.objects.create_user(
            username='existinguser',
            email='existing@example.com',
            password='testpass123'
        )
        
        data = {
            'username': 'newuser',
            'email': 'existing@example.com',  # Existing email
            'password1': 'complexpass123',
            'password2': 'complexpass123'
        }
        response = self.client.post(reverse('register'), data)
        
        self.assertEqual(response.status_code, 200)
        self.assertFalse(User.objects.filter(username='newuser').exists())
        self.assertIn('email', response.context['form'].errors)

   

    def test_instant_logout(self):
        """Test instant logout"""
        user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.client.login(username='testuser', password='testpass123')
        
        # Logout should return redirect (302)
        response = self.client.get(reverse('instant_logout'))
        self.assertEqual(response.status_code, 302)  # Expected redirect