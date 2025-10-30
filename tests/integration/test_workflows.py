from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from posts.models import Post
from comments.models import Comment
from communities.models import Community

class UserWorkflowTest(TestCase):
    """Тестирование полного рабочего процесса пользователя"""
    
    def setUp(self):
        self.client = Client()
        self.user_data = {
            'username': 'workflowuser',
            'email': 'workflow@test.com',
            'password1': 'complexpass123',
            'password2': 'complexpass123'
        }
        
    def test_complete_user_workflow(self):
        """Полный цикл: регистрация -> вход -> создание поста -> комментарий -> голосование"""
        
        # 1. Регистрация пользователя
        response = self.client.post(reverse('register'), self.user_data)
        self.assertIn(response.status_code, [200, 302])
        
        # Проверяем создание пользователя
        user = User.objects.get(username='workflowuser')
        self.assertEqual(user.email, 'workflow@test.com')
        
        # 2. Вход в систему
        login_success = self.client.login(
            username='workflowuser', 
            password='complexpass123'
        )
        self.assertTrue(login_success)
        
        # 3. Создание сообщества (если нужно)
        community = Community.objects.create(
            name='workflowcommunity',
            description='Community for workflow testing',
            created_by=user
        )
        
        # 4. Создание поста
        post_data = {
            'title': 'Workflow Test Post',
            'content': 'This is a test post created during workflow testing',
            'community': community.id
        }
        response = self.client.post(reverse('create_post'), post_data)
        self.assertEqual(response.status_code, 302)  # Редирект после успеха
        
        # Проверяем создание поста
        post = Post.objects.get(title='Workflow Test Post')
        self.assertEqual(post.author, user)
        self.assertEqual(post.community, community)
        
        # 5. Добавление комментария
        comment_data = {
            'content': 'This is a test comment in the workflow'
        }
        response = self.client.post(
            reverse('comments:add_comment', args=[post.id]), 
            comment_data
        )
        self.assertEqual(response.status_code, 302)
        
        # Проверяем создание комментария
        comment = Comment.objects.get(content='This is a test comment in the workflow')
        self.assertEqual(comment.author, user)
        self.assertEqual(comment.post, post)
        
        # 6. Голосование за пост
        response = self.client.post(
            reverse('vote_post', args=[post.id, 'upvote'])
        )
        self.assertIn(response.status_code, [200, 302])
        
        # Проверяем, что голос учтен
        post.refresh_from_db()
        self.assertEqual(post.total_votes(), 1)
        
        # Финальные проверки
        self.assertEqual(Post.objects.count(), 1)
        self.assertEqual(Comment.objects.count(), 1)
        self.assertEqual(User.objects.count(), 1)

class ModeratorWorkflowTest(TestCase):
    """Тестирование рабочего процесса модератора"""
    
    def test_moderator_actions(self):
        # Тесты для действий модератора: редактирование/удаление чужих постов и т.д.
        pass

class CommunityWorkflowTest(TestCase):
    """Тестирование рабочего процесса с сообществами"""
    
    def test_community_workflow(self):
        # Тесты: создание сообщества -> присоединение пользователей -> создание постов в сообществе
        pass