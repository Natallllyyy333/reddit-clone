import os
import django
from django.core.files.storage import default_storage

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'reddit_clone.simple')
django.setup()

from posts.models import PostMedia, Post
from django.core.files.base import ContentFile

def check_media_status():
    print("🔍 Checking media files status...")
    
    # Check PostMedia instances
    for media in PostMedia.objects.all():
        try:
            if media.media_file:
                print(f"📁 Media {media.id}: {media.media_file.name}")
                print(f"   URL: {media.media_file.url}")
                print(f"   Storage: {media.media_file.storage}")
                print(f"   Exists: {media.media_file.storage.exists(media.media_file.name)}")
        except Exception as e:
            print(f"❌ Error with media {media.id}: {e}")
    
    # Check old Post media files
    for post in Post.objects.filter(media_file__isnull=False):
        try:
            if post.media_file:
                print(f"📁 Old Post Media {post.id}: {post.media_file.name}")
                print(f"   URL: {post.media_file.url}")
                print(f"   Storage: {post.media_file.storage}")
        except Exception as e:
            print(f"❌ Error with old post media {post.id}: {e}")

if __name__ == '__main__':
    check_media_status()