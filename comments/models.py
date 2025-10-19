from django.db import models
from posts.models import Post  # Импорт из другого приложения
from django.conf import settings
from django.contrib.auth.models import User

class Comment(models.Model):
    content = models.TextField(max_length=1000)
    author = models.ForeignKey(User, on_delete=models.CASCADE)  # ИСПРАВЛЕНО
    post = models.ForeignKey('posts.Post', on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    upvotes = models.ManyToManyField(User, related_name='upvoted_comments', blank=True)
    downvotes = models.ManyToManyField(User, related_name='downvoted_comments', blank=True)

    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.author} on {self.post}"
    
    def get_score(self):
        return self.upvotes.count() - self.downvotes.count()