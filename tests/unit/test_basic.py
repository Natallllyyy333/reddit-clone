# tests/unit/test_basic.py
from django.test import TestCase

class BasicUnitTest(TestCase):
    """Basic unit tests"""
    
    def test_basic_math(self):
        """Test basic mathematics"""
        self.assertEqual(1 + 1, 2)
        self.assertEqual(2 * 2, 4)
    
    def test_environment(self):
        """Test that environment is set up"""
        self.assertTrue(True)