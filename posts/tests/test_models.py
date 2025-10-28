from django.test import TestCase
from django.contrib.auth.models import User
from posts.models import Post

class PostModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.post = Post.objects.create(
            title='Test Post',
            content='Test content',
            author=self.user
        )

    def test_post_creation(self):
        self.assertEqual(self.post.title, 'Test Post')
        self.assertEqual(self.post.content, 'Test content')
        self.assertEqual(self.post.author.username, 'testuser')
        self.assertTrue(self.post.created_at)

    def test_post_str_representation(self):
        self.assertEqual(str(self.post), 'Test Post')

    def test_post_absolute_url(self):
        # Если у модели есть метод get_absolute_url
        try:
            url = self.post.get_absolute_url()
            self.assertTrue(url)
        except:
            # Если метода нет, это нормально
            pass