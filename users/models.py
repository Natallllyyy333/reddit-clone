# from django.contrib.auth.models import AbstractUser
# from django.db import models

# from django.contrib.auth.models import User

# class User(AbstractUser):
#     email = models.EmailField(unique=True)
#     bio = models.TextField(max_length=500, blank=True)
#     profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
#     karma = models.IntegerField(default=0)
#     created_at = models.DateTimeField(auto_now_add=True)
    
#     def __str__(self):
#         return self.username
