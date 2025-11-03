# posts/models.py
from django.db import models
from cloudinary_storage.storage import MediaCloudinaryStorage
import cloudinary
import cloudinary.uploader

class VideoCloudinaryStorage(MediaCloudinaryStorage):
    def _upload(self, name, content):
        options = self.get_upload_options(name)
        
        # Явно указываем что это видео
        name_lower = name.lower()
        if any(name_lower.endswith(ext) for ext in ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv']):
            options['resource_type'] = 'video'
            print(f"🎥 Uploading as video: {name}")
        else:
            options['resource_type'] = 'auto'
            print(f"🖼️ Uploading as auto: {name}")
        
        return cloudinary.uploader.upload(content, **options)

class PostMedia(models.Model):
    post = models.ForeignKey('Post', on_delete=models.CASCADE, related_name='media_files')
    media_file = models.FileField(
        upload_to='post_media/%Y/%m/%d/',
        storage=VideoCloudinaryStorage(),
        blank=True,
        null=True
    )
    media_type = models.CharField(max_length=10, choices=[('image', 'Image'), ('video', 'Video')], default='image')
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.media_file:
            filename = self.media_file.name.lower()
            if any(filename.endswith(ext) for ext in ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm']):
                self.media_type = 'video'
            else:
                self.media_type = 'image'
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.media_type} - {self.media_file.name}"