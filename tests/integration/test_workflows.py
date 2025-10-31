from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from posts.models import Post
from communities.models import Community
from comments.models import Comment

class UserWorkflowTest(TestCase):
    """Testing complete user workflow"""
    
    def setUp(self):
        self.client = Client()
        self.user_data = {
            'username': 'workflowuser',
            'email': 'workflow@test.com',
            'password1': 'complexpass123',
            'password2': 'complexpass123'
        }
        
    def test_complete_user_workflow(self):
        """Complete cycle: registration -> login -> post creation -> comment -> voting"""
        
        # 1. User registration
        response = self.client.post(reverse('register'), self.user_data)
        self.assertEqual(response.status_code, 302)  # Redirect after successful registration
        
        # Check user creation
        user = User.objects.get(username='workflowuser')
        self.assertEqual(user.email, 'workflow@test.com')
        
        # 2. Login
        login_success = self.client.login(
            username='workflowuser', 
            password='complexpass123'
        )
        self.assertTrue(login_success)
        
        # 3. Community creation
        community = Community.objects.create(
            name='workflowcommunity',
            description='Community for workflow testing',
            created_by=user
        )
        
        # 4. Post creation
        post_data = {
            'title': 'Workflow Test Post',
            'content': 'This is a test post created during workflow testing',
            'community': community.id
        }
        response = self.client.post(reverse('create_post'), post_data)
        self.assertEqual(response.status_code, 302)  # Redirect after success
        
        # Check post creation
        post = Post.objects.get(title='Workflow Test Post')
        self.assertEqual(post.author, user)
        self.assertEqual(post.community, community)
        
        # 5. Adding a comment
        comment_data = {
            'content': 'This is a test comment in the workflow'
        }
        response = self.client.post(
            reverse('comments:add_comment', args=[post.id]), 
            comment_data
        )
        self.assertEqual(response.status_code, 302)
        
        # Check comment creation
        comment = Comment.objects.get(content='This is a test comment in the workflow')
        self.assertEqual(comment.author, user)
        self.assertEqual(comment.post, post)
        
        # 6. Voting on post
        response = self.client.post(
            reverse('vote_post', args=[post.id, 'upvote'])
        )
        self.assertEqual(response.status_code, 302)
        
        # Check that vote was counted
        post.refresh_from_db()
        self.assertEqual(post.total_votes(), 1)
        
        # Final checks
        self.assertEqual(Post.objects.count(), 1)
        self.assertEqual(Comment.objects.count(), 1)
        self.assertEqual(User.objects.count(), 1)

class ModeratorWorkflowTest(TestCase):
    """Testing moderator workflow"""
    
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='regularuser',
            password='testpass123'
        )
        self.moderator = User.objects.create_user(
            username='moderator',
            password='modpass123',
            is_staff=True
        )
        self.community = Community.objects.create(
            name='testcommunity',
            description='Test community',
            created_by=self.user
        )
        self.post = Post.objects.create(
            title='Test Post',
            content='Test content',
            author=self.user,
            community=self.community
        )
    
    def test_moderator_can_edit_any_post(self):
        """Test that moderator can edit any post"""
        self.client.login(username='moderator', password='modpass123')
        
        response = self.client.get(reverse('post_edit', args=[self.post.pk]))
        self.assertEqual(response.status_code, 200)
        
        updated_data = {
            'title': 'Updated by moderator',
            'content': 'Content updated by moderator',
            'community': self.community.id
        }
        response = self.client.post(reverse('post_edit', args=[self.post.pk]), updated_data)
        self.assertEqual(response.status_code, 302)
        
        self.post.refresh_from_db()
        self.assertEqual(self.post.title, 'Updated by moderator')

class CommunityWorkflowTest(TestCase):
    """Testing community workflows"""
    
    def test_community_creation_and_joining(self):
        """Test community creation and user joining"""
        client = Client()
        user = User.objects.create_user(
            username='communityuser',
            password='testpass123'
        )
        client.login(username='communityuser', password='testpass123')
        
        # Community creation
        community_data = {
            'name': 'newcommunity',
            'description': 'A new community for testing workflows with sufficient length'
        }
        response = client.post(reverse('communities:create_community'), community_data)
        self.assertEqual(response.status_code, 302)
        
        # Joining community
        response = client.post(reverse('communities:join_community', args=['newcommunity']))
        self.assertEqual(response.status_code, 302)
        
        # Check that user is in the community
        from communities.models import Community
        community = Community.objects.get(name='newcommunity')
        self.assertIn(user, community.members.all())