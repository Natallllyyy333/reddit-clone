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
            
            if media.media_type == 'image':
                self.stdout.write(f"Image File: {media.image_file}")
                if media.image_file:
                    self.stdout.write(f"Image File name: {media.image_file.name}")
                    self.stdout.write(f"Has URL attr: {hasattr(media.image_file, 'url')}")
                    if hasattr(media.image_file, 'url'):
                        url = media.image_file.url
                        self.stdout.write(f"URL: {url}")
                        self.stdout.write(f"URL is None: {url is None}")
            elif media.media_type == 'video':
                self.stdout.write(f"Video File: {media.video_file}")
                if media.video_file:
                    self.stdout.write(f"Video File name: {media.video_file.name}")
                    self.stdout.write(f"Has URL attr: {hasattr(media.video_file, 'url')}")
                    if hasattr(media.video_file, 'url'):
                        url = media.video_file.url
                        self.stdout.write(f"URL: {url}")
                        self.stdout.write(f"URL is None: {url is None}")
            
            cloudinary_url = media.get_cloudinary_url()
            self.stdout.write(f"Cloudinary URL: {cloudinary_url}")
            self.stdout.write("-" * 50)