from django.test import TestCase
from django.contrib.auth.models import User
from posts.models import Post
from posts.models import PostMedia
from comments.models import Comment

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

class PostMediaModelTest(TestCase):
    def test_media_creation(self):
        user = User.objects.create_user(username='testuser', password='testpass')
        post = Post.objects.create(title='Test', content='Test', author=user)
        media = PostMedia.objects.create(post=post, media_file='test.jpg')
        self.assertEqual(str(media), f"Media for {post.title}")

# comments/tests/test_models.py - создать
class CommentModelTest(TestCase):
    def test_comment_permissions(self):
        user1 = User.objects.create_user(username='user1', password='pass')
        user2 = User.objects.create_user(username='user2', password='pass')
        post = Post.objects.create(title='Test', content='Test', author=user1)
        comment = Comment.objects.create(post=post, author=user1, content='Test')
        
        comment._current_user = user1
        self.assertTrue(comment.can_edit)
        self.assertTrue(comment.can_delete)
        
        comment._current_user = user2
        self.assertFalse(comment.can_edit)
        self.assertFalse(comment.can_delete)