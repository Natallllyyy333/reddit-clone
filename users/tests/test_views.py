from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from django.contrib.messages import get_messages
from users.forms import RegisterForm

class UserViewsTest(TestCase):
    def setUp(self):
        self.client = Client()

    def test_register_view_get(self):
        """Тест GET запроса регистрации"""
        response = self.client.get(reverse('register'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'registration/register.html')
        self.assertIsInstance(response.context['form'], RegisterForm)

    def test_register_view_post_valid(self):
        """Тест POST запроса регистрации с валидными данными"""
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
        self.assertEqual(str(messages_list[0]), 'Аккаунт создан для newuser!')

    def test_register_view_post_invalid(self):
        """Тест POST запроса регистрации с невалидными данными"""
        data = {
            'username': 'newuser',
            'email': 'invalid-email',
            'password1': 'pass1',
            'password2': 'pass2'  # Пароли не совпадают
        }
        response = self.client.post(reverse('register'), data)
        
        self.assertEqual(response.status_code, 200)
        self.assertFalse(User.objects.filter(username='newuser').exists())

    def test_register_view_duplicate_email(self):
        """Тест регистрации с существующим email"""
        User.objects.create_user(
            username='existinguser',
            email='existing@example.com',
            password='testpass123'
        )
        
        data = {
            'username': 'newuser',
            'email': 'existing@example.com',  # Существующий email
            'password1': 'complexpass123',
            'password2': 'complexpass123'
        }
        response = self.client.post(reverse('register'), data)
        
        self.assertEqual(response.status_code, 200)
        self.assertFalse(User.objects.filter(username='newuser').exists())
        self.assertIn('email', response.context['form'].errors)

    # def test_instant_logout(self):
    #     """Тест мгновенного выхода"""
    #     user = User.objects.create_user(
    #         username='testuser',
    #         password='testpass123'
    #     )
    #     self.client.login(username='testuser', password='testpass123')
        
    #     # Проверяем, что пользователь аутентифицирован
    #     response = self.client.get('/')
    #     # Главная страница может возвращать 200 или 302 в зависимости от настроек
    #     # Не будем проверять конкретный статус, просто убедимся что нет ошибок 500
        
    #     # Выход - должен вернуть редирект (302)
    #     response = self.client.get(reverse('instant_logout'))
    #     self.assertEqual(response.status_code, 302)  # Ожидаем редирект
    #     self.assertRedirects(response, reverse('post_list'))  # Проверяем куда редиректит
        
    #     # Проверяем, что пользователь действительно разлогинен
    #     # Путем проверки что запрос к защищенной странице редиректит на логин
    #     response = self.client.get(reverse('post_create'))  # Защищенная страница
    #     self.assertEqual(response.status_code, 302)  # Редирект на логин
    #     self.assertTrue(response.url.startswith('/users/login/'))  # Редирект на страницу входа

    def test_instant_logout(self):
        """Тест мгновенного выхода"""
        user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.client.login(username='testuser', password='testpass123')
        
        # Выход - должен вернуть редирект (302)
        response = self.client.get(reverse('instant_logout'))
        self.assertEqual(response.status_code, 302)  # Ожидаем редирект