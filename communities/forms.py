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
                'placeholder': 'Community Name',
                'class': 'form-control'
            }),
            'description': forms.Textarea(attrs={
                'rows': 4,
                'placeholder': 'Describe your community...',
                'class': 'form-control'
            }),
        }
        labels = {
            'name': 'Community Name',
            'description': 'Description'
        }
        help_texts = {
            'name': 'Only letters, numbers, and underscores. No more than 50 characters.',
            'description': 'Describe the topic and rules of your community.'
        }
    
    
    def clean_name(self):
        name = self.cleaned_data['name'].strip()
        if not name:
            raise ValidationError('The community name cannot be empty')
        
        # Length check
        if len(name) < 3:
            raise ValidationError('The name must contain at least 3 characters')
        
        if len(name) > 50:
            raise ValidationError('The title cannot exceed 50 characters')
        
        # Check for allowed characters
        if not re.match(r'^[a-zA-Z0-9_]+$', name):
            raise ValidationError(
                'The name can only contain Latin letters, numbers, and underscores'
            )
        
        # Prohibited Names (Reserved Words)
        reserved_names = [
            'admin', 'api', 'auth', 'create', 'delete', 'edit', 'login', 
            'logout', 'register', 'settings', 'profile', 'search', 'help',
            'about', 'contact', 'moderator', 'user', 'users', 'post', 'posts',
            'comment', 'comments', 'community', 'communities', 'reddit', 'home'
        ]
        
        if name.lower() in reserved_names:
            raise ValidationError('This name is reserved and cannot be used')
        
        # Profanity check (basic example)
        profanity_list = ['badword1', 'badword2']  # Fill in with a real list
        if any(profanity in name.lower() for profanity in profanity_list):
            raise ValidationError('The title contains prohibited words')
        
        # Convert to lowercase
        name = name.lower()
        
        # Uniqueness check (ModelForm does this automatically, 
        # but you can add a custom check)
        if Community.objects.filter(name=name).exists():
            raise ValidationError('A community with this name already exists')
        
        return name


    def clean_description(self):
            description = self.cleaned_data['description'].strip()
            
            # Check for empty description
            if not description:
                raise ValidationError('The community description cannot be empty')
            
            # Checking the description length
            if len(description) < 10:
                raise ValidationError('The description must contain at least 10 characters')
            
            if len(description) > 1000:
                raise ValidationError('The description cannot exceed 1000 characters')
            
            # Check for obscene words in the description
            profanity_list = ['badword1', 'badword2']
            if any(profanity in description.lower() for profanity in profanity_list):
                raise ValidationError('The description contains prohibited words')
            
            return description

class CommunityEditForm(forms.ModelForm):
    """Form for editing an existing community"""
    class Meta:
        model = Community
        fields = ['description']
        widgets = {
            'description': forms.Textarea(attrs={
                'rows': 4,
                'placeholder': 'Describe your communityо...',
                'class': 'form-control'
            }),
        }
        labels = {
            'description': 'Community Description'
        }
    
    def clean_description(self):
        description = self.cleaned_data['description'].strip()
        
        if not description:
            raise ValidationError('The community description cannot be empty')
        
        if len(description) < 10:
            raise ValidationError('The description must contain at least 10 characters')
        
        if len(description) > 1000:
            raise ValidationError('The description cannot exceed 1000 characters')
        
        return description