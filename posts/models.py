from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse
from django.core.validators import FileExtensionValidator
from django.conf import settings
from cloudinary_storage.storage import MediaCloudinaryStorage

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
        storage=MediaCloudinaryStorage() 
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
        """Возвращает правильный URL для медиафайла"""
        if hasattr(self.media_file, 'url'):
            return self.media_file.url
        return None
    
    
    def get_cloudinary_url(self):
        """Generate correct HTTPS URL for Cloudinary"""
        try:
            if self.media_file and hasattr(self.media_file, 'url'):
                url = self.media_file.url
                
                # Ensure HTTPS for Cloudinary URLs
                if 'res.cloudinary.com' in url and url.startswith('http://'):
                    url = url.replace('http://', 'https://')
                
                # For production with Cloudinary - FIXED VIDEO HANDLING
                if not settings.DEBUG or 'res.cloudinary.com' in url:
                    try:
                        import cloudinary
                        from cloudinary import CloudinaryResource
                        
                        # If it's already a CloudinaryResource
                        if isinstance(self.media_file, CloudinaryResource):
                            actual_url = self.media_file.url
                            if actual_url:
                                return actual_url
                        
                        # Configure Cloudinary
                        cloudinary.config(
                            cloud_name=settings.CLOUDINARY_STORAGE['CLOUD_NAME'],
                            api_key=settings.CLOUDINARY_STORAGE['API_KEY'],
                            api_secret=settings.CLOUDINARY_STORAGE['API_SECRET']
                        )
                        
                        # Get public_id
                        if hasattr(self.media_file, 'public_id'):
                            public_id = self.media_file.public_id
                        else:
                            # Extract public_id from filename
                            public_id = self.media_file.name.split('.')[0]  # Remove extension
                        
                        # CRITICAL FIX: Use proper resource type for videos
                        if self.media_type == 'video':
                            # Use CloudinaryVideo for video files
                            from cloudinary import CloudinaryVideo
                            cloudinary_url = CloudinaryVideo(public_id).build_url(
                                resource_type='video',
                                secure=True
                            )
                        else:
                            # Use CloudinaryImage for images
                            cloudinary_url = cloudinary.CloudinaryImage(public_id).build_url(
                                secure=True
                            )
                        
                        print(f"🔗 Generated Cloudinary URL for {self.media_type}: {cloudinary_url}")
                        return cloudinary_url
                        
                    except Exception as e:
                        print(f"❌ Cloudinary URL generation error: {e}")
                        # Fallback to original URL
                        return url
                
                return url
            
            return ""
        except Exception as e:
            print(f"❌ Error in get_cloudinary_url: {e}")
            return ""