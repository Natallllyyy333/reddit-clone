from django import forms
from .models import Post

class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['title', 'content', 'media_file']
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Введите заголовок вашего поста...'
            }),
            'content': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Расскажите что-нибудь интересное...',
                'rows': 6
            }),
            'media_file': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': 'image/*,video/*'
            })
        }
    
    def clean_media_file(self):
        media_file = self.cleaned_data.get('media_file')
        if media_file:
            # Проверка размера файла (10MB)
            if media_file.size > 10 * 1024 * 1024:
                raise forms.ValidationError("Файл слишком большой. Максимальный размер: 10MB.")
        return media_file