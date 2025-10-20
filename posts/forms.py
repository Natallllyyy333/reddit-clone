from django import forms
from .models import Post

class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['title', 'content', 'community']
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Заголовок поста'
            }),
            'content': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Содержание поста',
                'rows': 4
            }),
            'community': forms.Select(attrs={
                'class': 'form-control'
            })
        }
        labels = {
            'community': 'Сообщество (опционально)'
        }