from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

class Post(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    community = models.ForeignKey(
        'communities.Community',
        on_delete=models.CASCADE,
        related_name='posts',
        null=True,
        blank=True
    )
    
    upvotes = models.ManyToManyField(User, related_name='upvoted_posts', blank=True)
    downvotes = models.ManyToManyField(User, related_name='downvoted_posts', blank=True)
    score = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    def upvote(self, user):
        
        if self.pk:
            if user in self.downvotes.all():
                self.downvotes.remove(user)
            self.upvotes.add(user)
            self.update_score()

    def downvote(self, user):
        """Добавить downvote"""
        if self.pk:
            if user in self.upvotes.all():
                self.upvotes.remove(user)
            self.downvotes.add(user)
            self.update_score()

    def remove_vote(self, user):
        """Удалить голос пользователя"""
        if self.pk:
            self.upvotes.remove(user)
            self.downvotes.remove(user)
            self.update_score()

    def update_score(self):
        """Обновить счет"""
        if self.pk:
            self.score = self.upvotes.count() - self.downvotes.count()
            self.save(update_fields=['score'])
        