from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse

class Post(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    upvotes = models.ManyToManyField(User, related_name='upvoted_posts', blank=True)
    downvotes = models.ManyToManyField(User, related_name='downvoted_posts', blank=True)
    @property
    def score(self):
        return self.total_votes()
    
    def __str__(self):
        return self.title
    
    def get_absolute_url(self):
        return reverse('post_detail', kwargs={'pk': self.pk})
    
    def total_votes(self):
        return self.upvotes.count() - self.downvotes.count()
    
    def user_vote(self, user):
        if self.upvotes.filter(id=user.id).exists():
            return 1
        elif self.downvotes.filter(id=user.id).exists():
            return -1
        return 0