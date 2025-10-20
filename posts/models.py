from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from django.db.models import Count

class PostManager(models.Manager):
    def with_vote_counts(self):
        """Оптимизированный запрос с подсчетом голосов"""
        return self.get_queryset().annotate(
            upvotes_count=Count('upvotes'),
            downvotes_count=Count('downvotes')
        )

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
    objects = PostManager()

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['score']),
            models.Index(fields=['community', 'created_at']),
        ]

    def calculate_score(self):
        if hasattr(self, 'upvotes_count') and hasattr(self, 'downvotes_count'):
            return self.upvotes_count - self.downvotes_count
        return self.upvotes.count() - self.downvotes.count()

    def save(self, *args, **kwargs):
        update_fields = kwargs.get('update_fields', None)
        if update_fields is None or 'score' in update_fields:
            self.score = self.calculate_score()
        
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        from django.urls import reverse
        return reverse('post_detail', kwargs={'pk': self.pk})

    def __str__(self):
        return self.title

     # Методы для работы с голосами
    def upvote(self, user):
        """Добавить upvote"""
        if user in self.downvotes.all():
            self.downvotes.remove(user)
        self.upvotes.add(user)
        self.save(update_fields=['score'])
    
    def downvote(self, user):
        """Добавить downvote"""
        if user in self.upvotes.all():
            self.upvotes.remove(user)
        self.downvotes.add(user)
        self.save(update_fields=['score'])
    
    def remove_vote(self, user):
        """Удалить голос пользователя"""
        self.upvotes.remove(user)
        self.downvotes.remove(user)
        self.save(update_fields=['score'])
    
    @property
    def total_votes(self):
        """Общее количество голосов"""
        return self.upvotes.count() + self.downvotes.count()