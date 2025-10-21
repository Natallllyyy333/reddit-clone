from django import forms
from .models import Post
from communities.models import Community

class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['title', 'content', 'community', 'media_file']
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
            'community': forms.Select(attrs={
                'class': 'form-select'
            }),
            'media_file': forms.FileInput(attrs={
                'class': 'form-control'
            })
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['community'].queryset = Community.objects.all()
        self.fields['community'].required = False
        self.fields['community'].empty_label = "Выберите сообщество (необязательно)"