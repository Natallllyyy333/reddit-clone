from django import forms
from django.core.exceptions import ValidationError
from django.utils.text import slugify
import re
from .models import Community

class CommunityForm(forms.ModelForm):
    class Meta:
        model = Community
        fields = ['name', 'description']
        widgets = {
            'name': forms.TextInput(attrs={
                'placeholder': 'Название сообщества',
                'class': 'form-control'
            }),
            'description': forms.Textarea(attrs={
                'rows': 4,
                'placeholder': 'Опишите ваше сообщество...',
                'class': 'form-control'
            }),
        }
        labels = {
            'name': 'Название сообщества',
            'description': 'Описание'
        }
        help_texts = {
            'name': 'Только буквы, цифры и подчеркивания. Не более 50 символов.',
            'description': 'Опишите тему и правила вашего сообщества.'
        }
    
    
    def clean_name(self):
        name = self.cleaned_data['name'].strip()
        if not name:
            raise ValidationError('Название сообщества не может быть пустым')
        
        # Проверка длины
        if len(name) < 3:
            raise ValidationError('Название должно содержать минимум 3 символа')
        
        if len(name) > 50:
            raise ValidationError('Название не может превышать 50 символов')
        
        # Проверка на разрешенные символы
        if not re.match(r'^[a-zA-Z0-9_]+$', name):
            raise ValidationError(
                'Название может содержать только латинские буквы, цифры и подчеркивания'
            )
        
        # Запрещенные имена (резервированные слова)
        reserved_names = [
            'admin', 'api', 'auth', 'create', 'delete', 'edit', 'login', 
            'logout', 'register', 'settings', 'profile', 'search', 'help',
            'about', 'contact', 'moderator', 'user', 'users', 'post', 'posts',
            'comment', 'comments', 'community', 'communities', 'reddit', 'home'
        ]
        
        if name.lower() in reserved_names:
            raise ValidationError('Это название зарезервировано и не может быть использовано')
        
        # Проверка на нецензурные слова (базовый пример)
        profanity_list = ['badword1', 'badword2']  # Заполните реальным списком
        if any(profanity in name.lower() for profanity in profanity_list):
            raise ValidationError('Название содержит запрещенные слова')
        
        # Приводим к нижнему регистру
        name = name.lower()
        
        # Проверка на уникальность (ModelForm делает это автоматически, 
        # но можно добавить кастомную проверку)
        if Community.objects.filter(name=name).exists():
            raise ValidationError('Сообщество с таким названием уже существует')
        
        return name


    def clean_description(self):
            description = self.cleaned_data['description'].strip()
            
            # Проверка на пустое описание
            if not description:
                raise ValidationError('Описание сообщества не может быть пустым')
            
            # Проверка длины описания
            if len(description) < 10:
                raise ValidationError('Описание должно содержать минимум 10 символов')
            
            if len(description) > 1000:
                raise ValidationError('Описание не может превышать 1000 символов')
            
            # Проверка на нецензурные слова в описании
            profanity_list = ['badword1', 'badword2']
            if any(profanity in description.lower() for profanity in profanity_list):
                raise ValidationError('Описание содержит запрещенные слова')
            
            return description

class CommunityEditForm(forms.ModelForm):
    """Форма для редактирования существующего сообщества"""
    class Meta:
        model = Community
        fields = ['description']
        widgets = {
            'description': forms.Textarea(attrs={
                'rows': 4,
                'placeholder': 'Опишите ваше сообщество...',
                'class': 'form-control'
            }),
        }
        labels = {
            'description': 'Описание сообщества'
        }
    
    def clean_description(self):
        description = self.cleaned_data['description'].strip()
        
        if not description:
            raise ValidationError('Описание сообщества не может быть пустым')
        
        if len(description) < 10:
            raise ValidationError('Описание должно содержать минимум 10 символов')
        
        if len(description) > 1000:
            raise ValidationError('Описание не может превышать 1000 символов')
        
        return description