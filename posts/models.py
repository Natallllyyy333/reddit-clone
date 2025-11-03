from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse
from django.core.validators import FileExtensionValidator
from django.conf import settings
from cloudinary_storage.storage import MediaCloudinaryStorage
import os
import cloudinary
import cloudinary.uploader
import cloudinary.api

class SmartCloudinaryStorage(MediaCloudinaryStorage):
    """Smart storage that auto-detects file type"""
    def get_resource_type(self, name):
        ext = os.path.splitext(name)[1].lower()
        if ext in ['.mp4', '.mov', '.avi', '.webm']:
            return 'video'
        return 'image'
    
# ПРОСТОЙ storage - используем встроенный
class VideoCloudinaryStorage(MediaCloudinaryStorage):
    """Storage specifically for videos"""
    def get_resource_type(self, name):
        ext = os.path.splitext(name)[1].lower()
        if ext in ['.mp4', '.mov', '.avi', '.webm']:
            return 'video'

class Post(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    community = models.ForeignKey(
        'communities.Community', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='posts'
    )
    
    upvotes = models.ManyToManyField(User, related_name='upvoted_posts', blank=True)
    downvotes = models.ManyToManyField(User, related_name='downvoted_posts', blank=True)
    
    media_file = models.FileField(
        upload_to='post_media/%Y/%m/%d/',
        blank=True,
        null=True,
        validators=[FileExtensionValidator(
            allowed_extensions=['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi']
        )]
    )
    
    MEDIA_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('none', 'None'),
    ]
    media_type = models.CharField(
        max_length=10,
        choices=MEDIA_TYPE_CHOICES,
        default='none'
    )

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

class Share(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='shares')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    shared_at = models.DateTimeField(auto_now_add=True)
    shared_to = models.CharField(max_length=255, blank=True)  # platform or description

    class Meta:
        unique_together = ['post', 'user']

    def __str__(self):
        return f"Share of {self.post.title} by {self.user.username}"


class PostMedia(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='media_files')
    
    # ЕДИНОЕ поле для всех медиа файлов
    media_file = models.FileField(
        upload_to='post_media/%Y/%m/%d/',
        validators=[FileExtensionValidator(
            allowed_extensions=['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi']
        )],
        storage=SmartCloudinaryStorage(),
        null=True,  
        blank=True
    )
    
    media_type = models.CharField(
        max_length=10,
        choices=Post.MEDIA_TYPE_CHOICES,
        default='none'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        # Автоматически определяем тип медиа при сохранении
        if self.media_file:
            file_extension = self.media_file.name.lower().split('.')[-1]
            if file_extension in ['jpg', 'jpeg', 'png', 'gif']:
                self.media_type = 'image'
            elif file_extension in ['mp4', 'mov', 'avi']:
                self.media_type = 'video'
            else:
                self.media_type = 'none'
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Media for {self.post.title}"
    
    def get_cloudinary_url(self):
        """Returns correct URL for media file"""
        try:
            if not self.media_file:
                return ""
                
            if not hasattr(self.media_file, 'url'):
                return ""
                
            url = self.media_file.url
            
            if url is None:
                return ""
            
            # Ensure HTTPS for Cloudinary URLs
            if 'res.cloudinary.com' in url and url.startswith('http://'):
                url = url.replace('http://', 'https://')
                
            return url
            
        except Exception as e:
            print(f"❌ Error in get_cloudinary_url: {e}")
            return ""