from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

# Create your models here.
class Post(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    votes = models.IntegerField(default=0)

    upvotes = models.ManyToManyField(User, related_name='upvoted_posts', blank=True)
    downvotes = models.ManyToManyField(User, related_name='downvoted_posts', blank=True)
    score = models.IntegerField(default=0)

    def calculate_score(self):
        return self.upvotes.count() - self.downvotes.count()

    def save(self, *args, **kwargs):
        self.score = self.calculate_score()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title