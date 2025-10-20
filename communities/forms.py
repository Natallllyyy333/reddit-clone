from django import forms
from .models import Community

class CommunityForm(forms.ModelForm):
    class Meta:
        model = Community
        fields = ['name', 'description']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 4}),
        }
    
    def clean_name(self):
        name = self.cleaned_data['name']
        # Запрещаем специальные символы в названии
        if not name.replace('_', '').isalnum():
            raise forms.ValidationError('Название может содержать только буквы, цифры и подчеркивания')
        return name.lower()  # Приводим к нижнему регистру