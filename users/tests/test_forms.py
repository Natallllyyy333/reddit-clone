from django.test import TestCase
from users.forms import RegisterForm
from django.contrib.auth.models import User

class RegisterFormTest(TestCase):
    def setUp(self):
        self.existing_user = User.objects.create_user(
            username='existinguser',
            email='existing@example.com',
            password='testpass123'
        )

    def test_register_form_valid_data(self):
        """Тест валидных данных формы регистрации"""
        form_data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password1': 'complexpass123',
            'password2': 'complexpass123'
        }
        form = RegisterForm(data=form_data)
        self.assertTrue(form.is_valid())

    def test_register_form_duplicate_email(self):
        """Тест формы с существующим email"""
        form_data = {
            'username': 'differentuser',
            'email': 'existing@example.com',  # Существующий email
            'password1': 'complexpass123',
            'password2': 'complexpass123'
        }
        form = RegisterForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('email', form.errors)

    def test_register_form_password_mismatch(self):
        """Тест несовпадающих паролей"""
        form_data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password1': 'password1',
            'password2': 'password2'  # Разные пароли
        }
        form = RegisterForm(data=form_data)
        self.assertFalse(form.is_valid())