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
        """Добавить upvote"""
        if self.pk:
            print(f"Upvoting post {self.id} by user {user.id}")  # Для отладки
            if user in self.downvotes.all():
                self.downvotes.remove(user)
            if user not in self.upvotes.all():
                self.upvotes.add(user)
            self.update_score()

    def downvote(self, user):
        """Добавить downvote"""
        if self.pk:
            print(f"Downvoting post {self.id} by user {user.id}")  # Для отладки
            if user in self.upvotes.all():
                self.upvotes.remove(user)
            if user not in self.downvotes.all():
                self.downvotes.add(user)
            self.update_score()

    def remove_vote(self, user):
        """Удалить голос пользователя"""
        if self.pk:
            print(f"Removing vote from post {self.id} by user {user.id}")  # Для отладки
            self.upvotes.remove(user)
            self.downvotes.remove(user)
            self.update_score()

    def update_score(self):
        """Обновить счет"""
        if self.pk:
            new_score = self.upvotes.count() - self.downvotes.count()
            print(f"Updating score for post {self.id}: {self.score} -> {new_score}")  # Для отладки
            self.score = new_score
            self.save(update_fields=['score'])