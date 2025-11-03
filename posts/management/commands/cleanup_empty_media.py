from django.core.management.base import BaseCommand
from posts.models import PostMedia

class Command(BaseCommand):
    help = 'Delete empty PostMedia records'

    def handle(self, *args, **options):
        # Удаляем записи без файлов
        empty_count = 0
        
        for media in PostMedia.objects.all():
            has_file = False
            
            # Проверяем все возможные поля файлов
            if hasattr(media, 'media_file') and media.media_file:
                has_file = True
            elif hasattr(media, 'image_file') and media.image_file:
                has_file = True
            elif hasattr(media, 'video_file') and media.video_file:
                has_file = True
                
            if not has_file:
                empty_count += 1
                print(f"Deleting empty media: {media.id}")
                media.delete()
                
        self.stdout.write(
            self.style.SUCCESS(f"Deleted {empty_count} empty PostMedia records")
        )
        
        # Показываем оставшиеся записи
        remaining = PostMedia.objects.count()
        self.stdout.write(f"Remaining PostMedia records: {remaining}")