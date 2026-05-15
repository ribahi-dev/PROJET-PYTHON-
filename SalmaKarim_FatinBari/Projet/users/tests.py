from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient


User = get_user_model()


class CustomUserModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            emsi_id='EMSI-ELV-001',
            phone='123456789',
            department='IT',
            role=User.ROLE_STUDENT,
        )

    def test_user_creation(self):
        self.assertEqual(self.user.username, 'testuser')
        self.assertEqual(self.user.email, 'test@example.com')
        self.assertEqual(self.user.phone, '123456789')
        self.assertEqual(self.user.department, 'IT')
        self.assertEqual(self.user.emsi_id, 'EMSI-ELV-001')

    def test_user_str(self):
        self.assertEqual(str(self.user), 'testuser')


class UserViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            emsi_id='EMSI-ELV-002',
        )
        self.staff_user = User.objects.create_user(
            username='staffuser',
            email='staff@example.com',
            password='staffpass123',
            emsi_id='EMSI-PROF-001',
            is_staff=True,
        )

    def test_user_register(self):
        response = self.client.post(
            '/api/auth/register/',
            {
                'email': 'new@example.com',
                'password': 'newpass123',
                'first_name': 'New',
                'last_name': 'User',
                'role': User.ROLE_TEACHER,
                'emsi_id': 'EMSI-ENS-900',
            },
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 3)
        created_user = User.objects.get(email='new@example.com')
        self.assertTrue(created_user.username.startswith('new'))

    def test_user_register_rejects_duplicate_email(self):
        response = self.client.post(
            '/api/auth/register/',
            {
                'email': 'test@example.com',
                'password': 'newpass123',
                'first_name': 'New',
                'last_name': 'User',
                'role': User.ROLE_TEACHER,
                'emsi_id': 'EMSI-ENS-901',
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_current_user_view(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['emsi_id'], 'EMSI-ELV-002')

    def test_user_list_authenticated(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
