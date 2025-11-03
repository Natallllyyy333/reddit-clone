from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse
from django.core.validators import FileExtensionValidator
from django.conf import settings
from cloudinary_storage.storage import MediaCloudinaryStorage, VideoCloudinaryStorage
import os

class SmartCloudinaryStorage(MediaCloudinaryStorage):
    """Smart storage that auto-detects file type"""
    def get_resource_type(self, name):
        # Get file extension and determine resource type
        ext = os.path.splitext(name)[1].lower()
        if ext in ['.mp4', '.mov', '.avi', '.webm']:
            return 'video'
        return 'image'

class Post(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Community connection
    community = models.ForeignKey(
        'communities.Community', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='posts'
    )
    
    upvotes = models.ManyToManyField(User, related_name='upvoted_posts', blank=True)
    downvotes = models.ManyToManyField(User, related_name='downvoted_posts', blank=True)
    
    # Media file field
    media_file = models.FileField(
        upload_to='post_media/%Y/%m/%d/',
        blank=True,
        null=True,
        validators=[FileExtensionValidator(
            allowed_extensions=['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi']
        )]
    )
    
    # Field for specifying the type of media
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

    @property
    def first_media(self):
        """Returns the first media file for backward compatibility"""
        if self.media_files.exists():
            return self.media_files.first()
        # For old posts with a single file
        if self.media_file:
            return self
        return None
    
    @property
    def has_multiple_media(self):
        """Checks if there are multiple media files"""
        return self.media_files.count() > 1
    
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
    
    def save(self, *args, **kwargs):
        # Automatically detect the type of media
        if self.media_file:
            file_extension = self.media_file.name.lower().split('.')[-1]
            if file_extension in ['jpg', 'jpeg', 'png', 'gif']:
                self.media_type = 'image'
            elif file_extension in ['mp4', 'mov', 'avi']:
                self.media_type = 'video'
        else:
            self.media_type = 'none'
        
        super().save(*args, **kwargs)


class Share(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='shares')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    shared_at = models.DateTimeField(auto_now_add=True)
    shared_to = models.CharField(max_length=255, blank=True)  # platform or description

    class Meta:
        unique_together = ['post', 'user']


class PostMedia(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='media_files')
    media_file = models.FileField(
        upload_to='post_media/%Y/%m/%d/',
        validators=[FileExtensionValidator(
            allowed_extensions=['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi']
        )],
        storage=SmartCloudinaryStorage()  # Use the improved storage
    )
    media_type = models.CharField(
        max_length=10,
        choices=Post.MEDIA_TYPE_CHOICES,
        default='none'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        # Automatically detect the media type
        if self.media_file:
            file_extension = self.media_file.name.lower().split('.')[-1]
            if file_extension in ['jpg', 'jpeg', 'png', 'gif']:
                self.media_type = 'image'
            elif file_extension in ['mp4', 'mov', 'avi']:
                self.media_type = 'video'
        
        # Save the model first to get an ID
        super().save(*args, **kwargs)
        
        # After save, if it's a video and we have Cloudinary issues, try to fix the URL
        if self.media_type == 'video' and hasattr(self.media_file, 'url'):
            try:
                # Force Cloudinary to recognize this as a video
                current_url = self.media_file.url
                if 'image/upload' in current_url and 'video' not in current_url:
                    print(f"🔄 Attempting to fix video URL for {self.media_file.name}")
            except Exception as e:
                print(f"❌ Error processing video URL: {e}")
    
    def __str__(self):
        return f"Media for {self.post.title}"
    
    @property
    def media_url(self):
        """Returns correct URL for media file"""
        if hasattr(self.media_file, 'url'):
            return self.media_file.url
        return None
    
    def get_cloudinary_url(self):
        """Returns correct HTTPS URL for Cloudinary with video support"""
        try:
            if not self.media_file or not hasattr(self.media_file, 'url'):
                return ""
                
            url = self.media_file.url
            print(f"🔗 Original URL for {self.media_type}: {url}")
            
            # Ensure HTTPS for Cloudinary URLs
            if 'res.cloudinary.com' in url and url.startswith('http://'):
                url = url.replace('http://', 'https://')
            
            # For video files, we need to ensure the URL is correct
            if self.media_type == 'video':
                # Fix Cloudinary URL for videos - replace image/upload with video/upload
                if 'image/upload' in url and 'video/upload' not in url:
                    url = url.replace('image/upload', 'video/upload')
                    print(f"🔗 Fixed video URL: {url}")
            
            return url
            
        except Exception as e:
            print(f"❌ Error in get_cloudinary_url: {e}")
            return ""