from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import AppSetting
from django.contrib.auth import get_user_model

User = get_user_model()


class AppSettingModelTest(TestCase):
    """Tests pour le modèle AppSetting."""
    
    def setUp(self):
        self.setting = AppSetting.objects.create(
            key='MAX_BOOKING_DAYS',
            label='Nombre max de jours pour réserver',
            value='30',
            description='Nombre maximum de jours à l\'avance qu\'un utilisateur peut réserver'
        )
    
    def test_setting_creation(self):
        """Test la création d'un setting."""
        self.assertEqual(self.setting.key, 'MAX_BOOKING_DAYS')
        self.assertEqual(self.setting.value, '30')
        self.assertEqual(self.setting.is_active, True)
    
    def test_setting_str(self):
        """Test la représentation string d'un setting."""
        self.assertEqual(str(self.setting), 'MAX_BOOKING_DAYS')


class AppSettingViewSetTest(TestCase):
    """Tests pour le AppSettingViewSet."""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.setting = AppSetting.objects.create(
            key='MAX_BOOKING_DAYS',
            label='Max Days',
            value='30'
        )
    
    def test_setting_list_requires_authentication(self):
        """Test que la liste des settings require l'authentification."""
        response = self.client.get('/api/settings/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_setting_list_authenticated(self):
        """Test la liste des settings avec authentification."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/settings/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data['count'], 1)
