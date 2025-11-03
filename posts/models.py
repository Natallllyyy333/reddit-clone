from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse
from django.core.validators import FileExtensionValidator
from django.conf import settings

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
        )]
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
        """Генерирует правильный HTTPS URL для Cloudinary с учетом типа медиа"""
        try:
            # Если файл существует и есть URL
            if self.media_file and hasattr(self.media_file, 'url'):
                url = self.media_file.url
                
                # Если это уже Cloudinary URL
                if 'res.cloudinary.com' in url:
                    # Принудительно используем HTTPS
                    if url.startswith('http://'):
                        url = url.replace('http://', 'https://')
                    return url
                
                # Если это локальный путь, но мы в production с Cloudinary
                if not settings.DEBUG and hasattr(settings, 'DEFAULT_FILE_STORAGE'):
                    if 'cloudinary' in settings.DEFAULT_FILE_STORAGE:
                        try:
                            from cloudinary import CloudinaryImage
                            # public_id - это путь к файлу в Cloudinary
                            public_id = self.media_file.name
                            
                            # Определяем тип ресурса: image или video
                            resource_type = 'image'
                            if self.media_type == 'video':
                                resource_type = 'video'
                            
                            # Генерируем URL с HTTPS и правильным resource_type
                            cloudinary_url = CloudinaryImage(public_id).build_url(
                                secure=True, 
                                resource_type=resource_type
                            )
                            print(f"🔒 Cloudinary URL ({resource_type}): {cloudinary_url}")
                            return cloudinary_url
                        except Exception as e:
                            print(f"❌ Cloudinary conversion error: {e}")
                
                # Возвращаем оригинальный URL
                return url
            
            return ""
        except Exception as e:
            print(f"❌ Error generating Cloudinary URL: {e}")
            return ""