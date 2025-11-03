from django.core.management.base import BaseCommand
from posts.models import PostMedia
import cloudinary
import os

class Command(BaseCommand):
    help = 'Fix video URLs in PostMedia'

    def handle(self, *args, **options):
        # Configure Cloudinary
        cloudinary.config(
            cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
            api_key=os.environ.get('CLOUDINARY_API_KEY'),
            api_secret=os.environ.get('CLOUDINARY_API_SECRET')
        )

        video_media = PostMedia.objects.filter(media_type='video')
        self.stdout.write(f"Found {video_media.count()} video media files")

        for media in video_media:
            try:
                current_url = media.media_file.url
                self.stdout.write(f"Processing: {media.media_file.name}")
                self.stdout.write(f"Current URL: {current_url}")

                # Fix URL if it's using image/upload instead of video/upload
                if 'image/upload' in current_url:
                    fixed_url = current_url.replace('image/upload', 'video/upload')
                    self.stdout.write(f"Fixed URL: {fixed_url}")

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error processing {media.id}: {e}"))