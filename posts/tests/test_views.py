from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from django.contrib.messages import get_messages
from posts.models import Post
from communities.models import Community
from posts.forms import PostForm, CommentForm
from comments.models import Comment

class PostViewsTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.community = Community.objects.create(
            name='testcommunity',
            description='Test Community',
            created_by=self.user
        )
        self.post = Post.objects.create(
            title='Test Post',
            content='Test Content',
            author=self.user,
            community=self.community
        )

    def test_post_list_view(self):
        """Тест списка постов"""
        response = self.client.get(reverse('post_list'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'posts/post_list.html')
        self.assertContains(response, 'Test Post')

    def test_post_detail_view_get(self):
        """Тест детальной страницы поста GET"""
        response = self.client.get(reverse('post_detail', args=[self.post.pk]))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'posts/post_detail.html')
        self.assertContains(response, 'Test Post')
        self.assertIsInstance(response.context['comment_form'], CommentForm)

    def test_post_detail_view_post_comment(self):
        """Тест добавления комментария через детальную страницу"""
        self.client.login(username='testuser', password='testpass123')
        data = {
            'content': 'Test comment content'
        }
        response = self.client.post(reverse('post_detail', args=[self.post.pk]), data)
        
        messages_list = list(get_messages(response.wsgi_request))
        self.assertEqual(str(messages_list[0]), 'Comment added successfully.')
        self.assertTrue(Comment.objects.filter(content='Test comment content').exists())

    def test_post_create_view_get(self):
        """Тест GET запроса создания поста"""
        self.client.login(username='testuser', password='testpass123')
        response = self.client.get(reverse('create_post'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'posts/create_post.html')
        self.assertIsInstance(response.context['form'], PostForm)

    def test_post_create_view_post_valid(self):
        """Тест POST запроса создания поста с валидными данными"""
        self.client.login(username='testuser', password='testpass123')
        data = {
            'title': 'New Post Title',
            'content': 'New post content here',
            'community': self.community.id
        }
        response = self.client.post(reverse('create_post'), data)
        
        messages_list = list(get_messages(response.wsgi_request))
        self.assertEqual(str(messages_list[0]), 'Post created successfully!')
        self.assertTrue(Post.objects.filter(title='New Post Title').exists())

    def test_post_update_view_get(self):
        """Тест GET запроса редактирования поста"""
        self.client.login(username='testuser', password='testpass123')
        response = self.client.get(reverse('post_edit', args=[self.post.pk]))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'posts/post_edit.html')

    def test_post_update_view_post_valid(self):
        """Тест POST запроса редактирования поста"""
        self.client.login(username='testuser', password='testpass123')
        data = {
            'title': 'Updated Post Title',
            'content': 'Updated post content',
            'community': self.community.id
        }
        response = self.client.post(reverse('post_edit', args=[self.post.pk]), data)
        
        self.post.refresh_from_db()
        self.assertEqual(self.post.title, 'Updated Post Title')
        
        messages_list = list(get_messages(response.wsgi_request))
        self.assertEqual(str(messages_list[0]), 'Post updated successfully!')

    def test_post_delete_view_get(self):
        """Тест GET запроса удаления поста"""
        self.client.login(username='testuser', password='testpass123')
        response = self.client.get(reverse('post_delete', args=[self.post.pk]))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'posts/post_delete.html')

    def test_post_delete_view_post(self):
        """Тест POST запроса удаления поста"""
        self.client.login(username='testuser', password='testpass123')
        response = self.client.post(reverse('post_delete', args=[self.post.pk]))
        
        self.assertEqual(response.status_code, 302)
        self.assertFalse(Post.objects.filter(pk=self.post.pk).exists())
        
        messages_list = list(get_messages(response.wsgi_request))
        self.assertEqual(str(messages_list[0]), 'Post deleted successfully!')

    def test_vote_post_authenticated(self):
        """Тест голосования аутентифицированным пользователем"""
        self.client.login(username='testuser', password='testpass123')
        response = self.client.post(reverse('vote_post', args=[self.post.pk, 'upvote']))
        
        # Проверяем, что пользователь добавился в upvotes
        self.assertIn(self.user, self.post.upvotes.all())
        self.assertNotIn(self.user, self.post.downvotes.all())

    def test_vote_post_unauthenticated(self):
        """Тест голосования неаутентифицированным пользователем"""
        response = self.client.post(reverse('vote_post', args=[self.post.pk, 'upvote']))
        self.assertEqual(response.status_code, 302)  # Редирект на логин

class VotePostTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.post = Post.objects.create(
            title='Test Post',
            content='Test Content',
            author=self.user
        )

    def test_upvote_toggle(self):
        """Тест переключения upvote"""
        self.client.login(username='testuser', password='testpass123')
        
        # Первое upvote
        response = self.client.post(reverse('vote_post', args=[self.post.pk, 'upvote']))
        self.assertIn(self.user, self.post.upvotes.all())
        
        # Второе upvote (должно убрать)
        response = self.client.post(reverse('vote_post', args=[self.post.pk, 'upvote']))
        self.assertNotIn(self.user, self.post.upvotes.all())

    def test_downvote_toggle(self):
        """Тест переключения downvote"""
        self.client.login(username='testuser', password='testpass123')
        
        # Первое downvote
        response = self.client.post(reverse('vote_post', args=[self.post.pk, 'downvote']))
        self.assertIn(self.user, self.post.downvotes.all())
        
        # Второе downvote (должно убрать)
        response = self.client.post(reverse('vote_post', args=[self.post.pk, 'downvote']))
        self.assertNotIn(self.user, self.post.downvotes.all())

    def test_switch_vote(self):
        """Тест смены голоса с upvote на downvote"""
        self.client.login(username='testuser', password='testpass123')
        
        # Сначала upvote
        self.client.post(reverse('vote_post', args=[self.post.pk, 'upvote']))
        self.assertIn(self.user, self.post.upvotes.all())
        self.assertNotIn(self.user, self.post.downvotes.all())
        
        # Затем downvote
        self.client.post(reverse('vote_post', args=[self.post.pk, 'downvote']))
        self.assertNotIn(self.user, self.post.upvotes.all())
        self.assertIn(self.user, self.post.downvotes.all())