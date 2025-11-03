import os
import sys
import django

# Добавляем корневую директорию проекта в Python path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'reddit_clone.settings')

try:
    django.setup()
except Exception as e:
    print(f"Error setting up Django: {e}")
    print("Current directory:", os.getcwd())
    print("Python path:", sys.path)
    sys.exit(1)

from posts.models import PostMedia, Post

def cleanup_old_media():
    print("=== CLEANING UP OLD MEDIA FILES ===")
    
    # Удаляем PostMedia объекты
    print("Deleting PostMedia objects...")
    postmedia_count = PostMedia.objects.count()
    deleted_count = PostMedia.objects.all().delete()
    print(f"Deleted {postmedia_count} PostMedia objects")
    
    # Очищаем старые одиночные медиафайлы в постах
    print("Cleaning single media files in posts...")
    posts_with_media = Post.objects.filter(media_file__isnull=False)
    print(f"Found {posts_with_media.count()} posts with single media")
    
    for post in posts_with_media:
        post.media_file = None
        post.media_type = 'none'
        post.save()
        print(f"Cleared media from post: {post.title}")
    
    print("✅ Cleanup completed! New media files will use Cloudinary.")

if __name__ == '__main__':
    cleanup_old_media()