from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse
from django.core.validators import FileExtensionValidator
from django.conf import settings
from cloudinary_storage.storage import MediaCloudinaryStorage
import os

class AutoResourceCloudinaryStorage(MediaCloudinaryStorage):
    """Auto-detects resource type for Cloudinary uploads"""
    def get_resource_type(self, name):
        ext = os.path.splitext(name)[1].lower()
        if ext in ['.mp4', '.mov', '.avi']:
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
        storage=AutoResourceCloudinaryStorage()  # Use the new auto-detection storage
    )
    media_type = models.CharField(
        max_length=10,
        choices=Post.MEDIA_TYPE_CHOICES,  # We use the same choices as in Post
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
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Media for {self.post.title}"
    
    @property
    def media_url(self):
        """Returns correct URL for media file"""
        if hasattr(self.media_file, 'url'):
            return self.media_file.url
        return None
    
    def get_cloudinary_url(self):
        """Returns correct HTTPS URL for Cloudinary"""
        try:
            if not self.media_file:
                print(f"❌ No media file for {self}")
                return ""
                
            if not hasattr(self.media_file, 'url'):
                print(f"❌ Media file has no url attribute: {self.media_file}")
                return ""
                
            url = self.media_file.url
            print(f"🔗 Original URL for {self.media_type}: {url}")
            
            # Ensure HTTPS for Cloudinary URLs
            if 'res.cloudinary.com' in url and url.startswith('http://'):
                url = url.replace('http://', 'https://')
                print(f"🔗 Converted to HTTPS: {url}")
            
            # For Cloudinary URLs, try to generate optimized URL
            if 'res.cloudinary.com' in url:
                try:
                    import cloudinary
                    
                    # Configure Cloudinary
                    cloudinary.config(
                        cloud_name=settings.CLOUDINARY_STORAGE['CLOUD_NAME'],
                        api_key=settings.CLOUDINARY_STORAGE['API_KEY'],
                        api_secret=settings.CLOUDINARY_STORAGE['API_SECRET']
                    )
                    
                    # Extract public_id from URL
                    if '/upload/' in url:
                        public_id_part = url.split('/upload/')[-1]
                        # Remove version if present
                        if '/v' in public_id_part:
                            public_id = public_id_part.split('/v')[-1].split('/')[-1]
                        else:
                            public_id = public_id_part
                        
                        # Remove file extension
                        if '.' in public_id:
                            public_id = public_id.rsplit('.', 1)[0]
                        
                        print(f"🔗 Extracted public_id: {public_id}")
                        
                        # Generate optimized URL
                        if self.media_type == 'video':
                            from cloudinary import CloudinaryVideo
                            cloudinary_url = CloudinaryVideo(public_id).build_url(
                                resource_type='video',
                                secure=True
                            )
                        else:
                            cloudinary_url = cloudinary.CloudinaryImage(public_id).build_url(
                                secure=True
                            )
                        
                        print(f"🔗 Generated Cloudinary URL: {cloudinary_url}")
                        return cloudinary_url
                        
                except Exception as e:
                    print(f"❌ Cloudinary URL generation error: {e}")
                    # Return original URL as fallback
                    return url
            
            return url
            
        except Exception as e:
            print(f"❌ Error in get_cloudinary_url: {e}")
            return ""