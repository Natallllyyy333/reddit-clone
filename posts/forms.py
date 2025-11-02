from django import forms
from .models import Post
from communities.models import Community
from comments.models import Comment

class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['title', 'content', 'community']
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter the title of your post...'
            }),
            'content': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Tell me something interesting...',
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
        self.fields['community'].empty_label = "Select a community (optional)"
        self.fields['community'].label_from_instance = lambda obj: obj.name

class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ['content']
        widgets = {
            'content': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Write a comment...',
                'rows': 3,
                'id': 'write_comment'
            })
        }