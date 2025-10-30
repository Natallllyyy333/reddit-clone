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
        """Test adding comment by authenticated user"""
        self.client.login(username='testuser', password='testpass123')
        data = {
            'content': 'Test comment content'
        }
        response = self.client.post(reverse('comments:add_comment', args=[self.post.id]), data)
        
        self.assertEqual(response.status_code, 302)
        self.assertTrue(Comment.objects.filter(content='Test comment content').exists())
        
        messages_list = list(get_messages(response.wsgi_request))
        self.assertEqual(str(messages_list[0]), 'Comment added.')

    def test_add_comment_empty_content(self):
        """Тест добавления пустого комментария"""
        self.client.login(username='testuser', password='testpass123')
        data = {
            'content': ''
        }
        response = self.client.post(reverse('comments:add_comment', args=[self.post.id]), data)
        
        messages_list = list(get_messages(response.wsgi_request))
        self.assertEqual(str(messages_list[0]), 'Comment cannot be empty')
        self.assertFalse(Comment.objects.filter(content='').exists())

    def test_add_comment_unauthenticated(self):
        """Test adding comment by unauthenticated user"""
        data = {
            'content': 'Test comment'
        }
        response = self.client.post(reverse('comments:add_comment', args=[self.post.id]), data)
        self.assertEqual(response.status_code, 302)  

    def test_delete_comment_owner(self):
        """Test comment deletion by owner"""
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
        self.assertEqual(str(messages_list[0]), 'Comment deleted successfully')

    def test_delete_comment_not_owner(self):
        """Test attempt to delete someone else's comment"""
        self.client.login(username='otheruser', password='otherpass123')
        comment = Comment.objects.create(
            post=self.post,
            author=self.user,  # Different author
            content='Test comment'
        )
        
        response = self.client.post(reverse('comments:delete_comment', args=[comment.id]))
        
        
        self.assertEqual(response.status_code, 302)  
        self.assertTrue(Comment.objects.filter(id=comment.id).exists())  
        
        
        messages_list = list(get_messages(response.wsgi_request))
        self.assertTrue(len(messages_list) > 0)
        self.assertEqual(str(messages_list[0]), 'You do not have permission to delete this comment')