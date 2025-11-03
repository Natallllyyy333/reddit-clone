from django.core.management.base import BaseCommand
from posts.models import PostMedia

class Command(BaseCommand):
    help = 'Check media files and their URLs'

    def handle(self, *args, **options):
        media_files = PostMedia.objects.all()
        self.stdout.write(f"Found {media_files.count()} media files")
        
        for media in media_files:
            self.stdout.write(f"\nMedia ID: {media.id}")
            self.stdout.write(f"Type: {media.media_type}")
            self.stdout.write(f"File: {media.media_file}")
            self.stdout.write(f"File exists: {bool(media.media_file)}")
            
            if media.media_file:
                self.stdout.write(f"File name: {media.media_file.name}")
                self.stdout.write(f"Has URL attr: {hasattr(media.media_file, 'url')}")
                
                if hasattr(media.media_file, 'url'):
                    url = media.media_file.url
                    self.stdout.write(f"URL: {url}")
                    self.stdout.write(f"URL is None: {url is None}")
            
            cloudinary_url = media.get_cloudinary_url()
            self.stdout.write(f"Cloudinary URL: {cloudinary_url}")
            self.stdout.write("-" * 50)