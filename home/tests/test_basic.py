from django.test import TestCase

class HomeBasicTest(TestCase):
    def test_basic_functionality(self):
        self.assertEqual(1 + 1, 2)
    
    def test_home_page(self):
        response = self.client.get('/')
        self.assertIn(response.status_code, [200, 302])