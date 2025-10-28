from django.test import TestCase

class PostModelImportTest(TestCase):
    def test_post_model_import(self):
        """Проверяем что модель Post доступна для импорта"""
        try:
            from posts.models import Post
            # Если импорт прошел успешно, тест считается пройденным
            self.assertTrue(True)
        except ImportError as e:
            self.fail(f"Не удалось импортировать модель Post: {e}")