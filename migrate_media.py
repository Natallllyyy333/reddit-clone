import os
import django
from django.core.files.base import ContentFile

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'reddit_clone.simple')
django.setup()

from posts.models import PostMedia  # Adjust to your actual model
from django.core.files.storage import default_storage

def migrate_media_to_cloudinary():
    """Migrate existing media files to Cloudinary"""
    print("Starting media migration to Cloudinary...")
    
    all_media = PostMedia.objects.all()
    print(f"Found {all_media.count()} media files")
    
    migrated_count = 0
    for media in all_media:
        try:
            # Get the current file
            current_file = media.media_file
            
            # Check if it's already a Cloudinary URL
            if hasattr(current_file, 'url') and 'cloudinary.com' in current_file.url:
                print(f"✓ Already in Cloudinary: {current_file.name}")
                continue
            
            # If file exists locally, upload to Cloudinary
            if current_file and hasattr(current_file, 'path'):
                try:
                    with open(current_file.path, 'rb') as f:
                        file_content = f.read()
                    
                    # Save to Cloudinary
                    media.media_file.save(
                        current_file.name, 
                        ContentFile(file_content),
                        save=True
                    )
                    migrated_count += 1
                    print(f"✓ Migrated: {current_file.name} -> {media.media_file.url}")
                    
                except FileNotFoundError:
                    print(f"✗ File not found: {current_file.name}")
                    
        except Exception as e:
            print(f"✗ Error migrating {media.id}: {e}")
    
    print(f"Migration complete: {migrated_count} files migrated to Cloudinary")

if __name__ == "__main__":
    migrate_media_to_cloudinary()