from django import forms
from .models import Post
from communities.models import Community

class PostForm(forms.ModelForm):
    media_files = forms.FileField(
        required=False,
        widget=forms.FileInput(attrs={
            'class': 'form-control',
            'multiple': True,  # Ключевое изменение - разрешаем множественный выбор
            'accept': 'image/*,video/*'  # Уточняем типы файлов
        })
    )
    class Meta:
        model = Post
        fields = ['title', 'content', 'community']
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter your post title...'
            }),
            'content': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Tell something interesting...',
                'rows': 6
            }),
            'community': forms.Select(attrs={
                'class': 'form-select'
            }),
           
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['community'].queryset = Community.objects.all()
        self.fields['community'].required = False
        self.fields['community'].empty_label = "Pick a community (not required)"
        self.fields['community'].label_from_instance = lambda obj: obj.name
    

    def save(self, commit=True):
        # Сначала сохраняем пост
        post = super().save(commit=commit)
        
        # Обрабатываем множественные файлы
        media_files = self.files.getlist('media_files')
        for media_file in media_files:
            if media_file:  # Проверяем что файл не пустой
                # Создаем запись PostMedia для каждого файла
                from .models import PostMedia  # Импортируем здесь чтобы избежать циклического импорта
                PostMedia.objects.create(
                    post=post,
                    media_file=media_file
                )
        
        return post
