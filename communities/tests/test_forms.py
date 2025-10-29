from django.test import TestCase
from communities.forms import CommunityForm, CommunityEditForm
from communities.models import Community
from django.contrib.auth.models import User

class CommunityFormTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        self.existing_community = Community.objects.create(
            name='existing',
            description='Existing community',
            created_by=self.user
        )

    def test_community_form_valid_data(self):
        """Тест валидных данных формы сообщества"""
        form_data = {
            'name': 'validcommunity',
            'description': 'This is a valid community description with more than 10 characters.'
        }
        form = CommunityForm(data=form_data)
        self.assertTrue(form.is_valid())

    def test_community_form_invalid_short_name(self):
        """Тест слишком короткого названия"""
        form_data = {
            'name': 'ab',
            'description': 'Valid description length here'
        }
        form = CommunityForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('name', form.errors)

    def test_community_form_invalid_long_name(self):
        """Тест слишком длинного названия"""
        form_data = {
            'name': 'a' * 51,
            'description': 'Valid description length here'
        }
        form = CommunityForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('name', form.errors)

    def test_community_form_invalid_characters(self):
        """Тест недопустимых символов в названии"""
        form_data = {
            'name': 'invalid@name',
            'description': 'Valid description length here'
        }
        form = CommunityForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('name', form.errors)

    def test_community_form_reserved_names(self):
        """Тест зарезервированных имен"""
        reserved_names = ['admin', 'create', 'login', 'register']
        for name in reserved_names:
            form_data = {
                'name': name,
                'description': 'Valid description length here'
            }
            form = CommunityForm(data=form_data)
            self.assertFalse(form.is_valid())
            self.assertIn('name', form.errors)

    def test_community_form_duplicate_name(self):
        """Тест дублирования имени сообщества"""
        form_data = {
            'name': 'existing',
            'description': 'Valid description length here'
        }
        form = CommunityForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('name', form.errors)

    def test_community_form_short_description(self):
        """Тест слишком короткого описания"""
        form_data = {
            'name': 'validname',
            'description': 'short'
        }
        form = CommunityForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('description', form.errors)

    def test_community_edit_form_valid(self):
        """Тест формы редактирования сообщества"""
        form_data = {
            'description': 'This is a valid updated description with enough length'
        }
        form = CommunityEditForm(data=form_data)
        self.assertTrue(form.is_valid())

    def test_community_edit_form_invalid(self):
        """Тест невалидной формы редактирования"""
        form_data = {
            'description': 'short'
        }
        form = CommunityEditForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('description', form.errors)