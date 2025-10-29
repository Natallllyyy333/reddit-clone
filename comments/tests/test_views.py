from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from django.contrib.messages import get_messages
from posts.models import Post
from comments.models import Comment

class CommentViewsTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.other_user = User.objects.create_user(
            username='otheruser',
            password='otherpass123'
        )
        self.post = Post.objects.create(
            title='Test Post',
            content='Test Content',
            author=self.user
        )

    def test_add_comment_authenticated(self):
        """Тест добавления комментария аутентифицированным пользователем"""
        self.client.login(username='testuser', password='testpass123')
        data = {
            'content': 'Test comment content'
        }
        response = self.client.post(reverse('comments:add_comment', args=[self.post.id]), data)
        
        self.assertEqual(response.status_code, 302)
        self.assertTrue(Comment.objects.filter(content='Test comment content').exists())
        
        messages_list = list(get_messages(response.wsgi_request))
        self.assertEqual(str(messages_list[0]), 'Комментарий добавлен')

    def test_add_comment_empty_content(self):
        """Тест добавления пустого комментария"""
        self.client.login(username='testuser', password='testpass123')
        data = {
            'content': ''
        }
        response = self.client.post(reverse('comments:add_comment', args=[self.post.id]), data)
        
        messages_list = list(get_messages(response.wsgi_request))
        self.assertEqual(str(messages_list[0]), 'Комментарий не может быть пустым')
        self.assertFalse(Comment.objects.filter(content='').exists())

    def test_add_comment_unauthenticated(self):
        """Тест добавления комментария неаутентифицированным пользователем"""
        data = {
            'content': 'Test comment'
        }
        response = self.client.post(reverse('comments:add_comment', args=[self.post.id]), data)
        self.assertEqual(response.status_code, 302)  # Редирект на логин

    def test_delete_comment_owner(self):
        """Тест удаления комментария владельцем"""
        self.client.login(username='testuser', password='testpass123')
        comment = Comment.objects.create(
            post=self.post,
            author=self.user,
            content='Test comment to delete'
        )
        
        response = self.client.post(reverse('comments:delete_comment', args=[comment.id]))
        
        self.assertEqual(response.status_code, 302)
        self.assertFalse(Comment.objects.filter(id=comment.id).exists())
        
        messages_list = list(get_messages(response.wsgi_request))
        self.assertEqual(str(messages_list[0]), 'Комментарий удален')

    def test_delete_comment_not_owner(self):
        """Тест попытки удаления чужого комментария"""
        self.client.login(username='otheruser', password='otherpass123')
        comment = Comment.objects.create(
            post=self.post,
            author=self.user,  # Другой автор
            content='Test comment'
        )
        
        response = self.client.post(reverse('comments:delete_comment', args=[comment.id]))
        
        # Ожидаем редирект с сообщением об ошибке, а не 404
        self.assertEqual(response.status_code, 302)  # ИСПРАВЛЕНО: 302 вместо 404
        self.assertTrue(Comment.objects.filter(id=comment.id).exists())  # Комментарий все еще существует
        
        # Проверяем, что было сообщение об ошибке
        messages_list = list(get_messages(response.wsgi_request))
        self.assertTrue(len(messages_list) > 0)