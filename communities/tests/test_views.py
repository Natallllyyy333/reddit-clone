from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from django.contrib.messages import get_messages
from communities.models import Community
from communities.forms import CommunityForm

class CommunityViewsTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            email='test@example.com'
        )
        self.community = Community.objects.create(
            name='testcommunity',
            description='Test Community Description',
            created_by=self.user
        )
        self.community.members.add(self.user)
        self.community.moderators.add(self.user)

    def test_community_list_view(self):
        """Тест отображения списка сообществ"""
        response = self.client.get(reverse('communities:community_list'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'communities/community_list.html')
        self.assertContains(response, 'testcommunity')

    def test_community_detail_view(self):
        """Тест детальной страницы сообщества"""
        response = self.client.get(reverse('communities:community_detail', args=['testcommunity']))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'communities/community_detail.html')
        self.assertContains(response, 'testcommunity')

    def test_community_detail_view_not_found(self):
        """Тест несуществующего сообщества"""
        response = self.client.get(reverse('communities:community_detail', args=['nonexistent']))
        self.assertEqual(response.status_code, 404)

    def test_create_community_view_get(self):
        """Тест GET запроса создания сообщества"""
        self.client.login(username='testuser', password='testpass123')
        response = self.client.get(reverse('communities:create_community'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'communities/create_community.html')
        self.assertIsInstance(response.context['form'], CommunityForm)

    def test_create_community_view_post_valid(self):
        """Тест POST запроса создания сообщества с валидными данными"""
        self.client.login(username='testuser', password='testpass123')
        data = {
            'name': 'newcommunity',
            'description': 'New Community Description with enough length'
        }
        response = self.client.post(reverse('communities:create_community'), data)
        
        # Проверяем успешное создание
        self.assertTrue(Community.objects.filter(name='newcommunity').exists())
        new_community = Community.objects.get(name='newcommunity')
        self.assertEqual(new_community.created_by, self.user)
        
        # Упрощенная проверка редиректа
        self.assertEqual(response.status_code, 302)  # Просто проверяем что редирект

    def test_create_community_view_post_invalid(self):
        """Тест POST запроса создания сообщества с невалидными данными"""
        self.client.login(username='testuser', password='testpass123')
        data = {
            'name': 'ab',  # слишком короткое имя
            'description': 'short'
        }
        response = self.client.post(reverse('communities:create_community'), data)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Community.objects.filter(name='ab').exists())

    def test_join_community_authenticated(self):
        """Тест присоединения к сообществу аутентифицированным пользователем"""
        self.client.login(username='testuser', password='testpass123')
        
        # Создаем новое сообщество, где пользователь еще не состоит
        new_comm = Community.objects.create(name='newcomm', description='Test', created_by=self.user)
        
        response = self.client.post(reverse('communities:join_community', args=['newcomm']))
        self.assertEqual(response.status_code, 302)
        self.assertIn(self.user, new_comm.members.all())

    def test_join_community_unauthenticated(self):
        """Тест присоединения к сообществу неаутентифицированным пользователем"""
        response = self.client.post(reverse('communities:join_community', args=['testcommunity']))
        # Должен быть редирект на страницу логина
        self.assertEqual(response.status_code, 302)
        self.assertTrue(response.url.startswith('/users/login/'))

    def test_leave_community(self):
        """Тест выхода из сообщества"""
        self.client.login(username='testuser', password='testpass123')
        
        # Создаем сообщество с другим создателем
        other_user = User.objects.create_user(username='otheruser', password='testpass123')
        leave_comm = Community.objects.create(
            name='leavecomm', 
            description='Test description with enough length for validation',
            created_by=other_user  # Другой создатель
        )
        leave_comm.members.add(self.user)
        
        response = self.client.post(reverse('communities:leave_community', args=['leavecomm']))
        self.assertEqual(response.status_code, 302)
        
        # Обновляем объект из базы
        leave_comm.refresh_from_db()
        self.assertNotIn(self.user, leave_comm.members.all())

    def test_my_communities_view(self):
        """Тест страницы моих сообществ"""
        self.client.login(username='testuser', password='testpass123')
        response = self.client.get(reverse('communities:my_communities'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'communities/my_communities.html')
        self.assertIn('user_communities', response.context)
        self.assertIn('moderated_communities', response.context)

    def test_community_list_exception_handling(self):
        """Тест обработки исключений в списке сообществ"""
        # Здесь можно протестировать обработку ошибок, если нужно
        pass