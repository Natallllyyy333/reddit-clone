from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse

class Community(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    members = models.ManyToManyField(User, related_name='communities', blank=True)
    moderators = models.ManyToManyField(User, related_name='moderated_communities', blank=True)
    
    def __str__(self):
        return f"r/{self.name}"
    
    def member_count(self):
        return self.members.count()
    
    def is_moderator(self, user):
        return user in self.moderators.all()
    
    def get_absolute_url(self):
        return reverse('community_detail', kwargs={'community_name': self.name})