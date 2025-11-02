from django.test import TestCase

class PostModelImportTest(TestCase):
    def test_post_model_import(self):
        """Checking that the Post model is available for import"""
        try:
            from posts.models import Post
            # If the import was successful, the test is considered passed
            self.assertTrue(True)
        except ImportError as e:
            self.fail(f"Failed to import Post model: {e}")