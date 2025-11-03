from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse
from django.core.validators import FileExtensionValidator
from django.conf import settings
from cloudinary_storage.storage import MediaCloudinaryStorage
import os

# ПРОСТОЙ storage - используем встроенный
class VideoCloudinaryStorage(MediaCloudinaryStorage):
    """Storage specifically for videos"""
    def get_resource_type(self, name):
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
    
    # Separate fields for images and videos
    image_file = models.ImageField(
        upload_to='post_media/images/%Y/%m/%d/',
        blank=True,
        null=True,
        storage=MediaCloudinaryStorage()
    )
    
    video_file = models.FileField(
        upload_to='post_media/videos/%Y/%m/%d/',
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['mp4', 'mov', 'avi'])],
        storage=VideoCloudinaryStorage()
    )
    
    media_type = models.CharField(
        max_length=10,
        choices=Post.MEDIA_TYPE_CHOICES,
        default='none'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        # Automatically set media_type based on which field is used
        if self.video_file:
            self.media_type = 'video'
        elif self.image_file:
            self.media_type = 'image'
        else:
            self.media_type = 'none'
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Media for {self.post.title}"
    
    @property
    def media_url(self):
        """Возвращает URL в зависимости от типа медиа"""
        if self.media_type == 'video' and self.video_file:
            return self.video_file.url
        elif self.media_type == 'image' and self.image_file:
            return self.image_file.url
        return None
    
    def get_cloudinary_url(self):
        """Returns correct URL for media file"""
        try:
            # Determine which file field to use based on media_type
            file_field = None
            if self.media_type == 'image' and self.image_file:
                file_field = self.image_file
            elif self.media_type == 'video' and self.video_file:
                file_field = self.video_file
            
            if not file_field:
                print(f"❌ No file found for {self.media_type} media {self.id}")
                return ""
                
            if not hasattr(file_field, 'url'):
                print(f"❌ File has no url attribute: {file_field}")
                return ""
                
            # Get the URL from file field
            url = file_field.url
            
            # If URL is None, return empty string
            if url is None:
                print(f"❌ File URL is None for {self}")
                return ""
                
            print(f"🔗 {self.media_type.capitalize()} URL: {url}")
            
            # Ensure HTTPS for Cloudinary URLs
            if 'res.cloudinary.com' in url and url.startswith('http://'):
                url = url.replace('http://', 'https://')
                print(f"🔗 Converted to HTTPS: {url}")
                
            return url
            
        except Exception as e:
            print(f"❌ Error in get_cloudinary_url: {e}")
            return ""