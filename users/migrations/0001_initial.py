from django.db import migrations, models
import django.contrib.auth.models
import django.contrib.auth.validators
from django.utils import timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        # Если у вас ЕСТЬ кастомная модель User в users/models.py
        # migrations.CreateModel(...)
        # Иначе оставьте файл ПУСТЫМ с только dependencies
    ]