from django.db import models
from django.contrib.auth.models import User
from posts.models import Post

class Comment(models.Model):
    post = models.ForeignKey(
        Post, 
        on_delete=models.CASCADE, 
        related_name='comments'
    )
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'Comment by {self.author} on {self.post}'

    @property
    def can_edit(self):
        """Проверяет, может ли текущий пользователь редактировать комментарий"""
        from django.contrib.auth.models import AnonymousUser
        user = getattr(self, '_current_user', None)
        
        if not user or isinstance(user, AnonymousUser):
            return False
            
        return user == self.author

    @property
    def can_delete(self):
        """Проверяет, может ли текущий пользователь удалить комментарий"""
        from django.contrib.auth.models import AnonymousUser
        from communities.models import Community
        
        user = getattr(self, '_current_user', None)
        
        if not user or isinstance(user, AnonymousUser):
            return False
            
        is_moderator = False
        if self.post.community:
            is_moderator = self.post.community.is_moderator(user)
        
        return (user == self.author or 
                user.is_staff or 
                user == self.post.author or
                is_moderator)