from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse
from django.core.validators import FileExtensionValidator

class Post(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Связь с сообществом
    community = models.ForeignKey(
        'communities.Community', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='posts'
    )
    
    upvotes = models.ManyToManyField(User, related_name='upvoted_posts', blank=True)
    downvotes = models.ManyToManyField(User, related_name='downvoted_posts', blank=True)
    
    # Поле для медиафайлов
    media_file = models.FileField(
        upload_to='post_media/%Y/%m/%d/',
        blank=True,
        null=True,
        validators=[FileExtensionValidator(
            allowed_extensions=['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi']
        )]
    )
    
    # Поле для определения типа медиа
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
    
    def save(self, *args, **kwargs):
        # Автоматически определяем тип медиа
        if self.media_file:
            file_extension = self.media_file.name.lower().split('.')[-1]
            if file_extension in ['jpg', 'jpeg', 'png', 'gif']:
                self.media_type = 'image'
            elif file_extension in ['mp4', 'mov', 'avi']:
                self.media_type = 'video'
        else:
            self.media_type = 'none'
        
        super().save(*args, **kwargs)

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='post_comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Comment by {self.author} on {self.post.title}"
    
    class Meta:
        ordering = ['created_at']

