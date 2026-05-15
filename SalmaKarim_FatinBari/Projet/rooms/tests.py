from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from .models import Room


User = get_user_model()


class RoomModelTest(TestCase):
    def setUp(self):
        self.room = Room.objects.create(
            building='EMSI',
            floor=2,
            code='SC201',
            name='Salle de cours SC201',
            room_type=Room.TYPE_CLASSROOM,
            capacity=30,
            location='EMSI - Etage 2',
            description='Grande salle de reunion',
        )

    def test_room_creation(self):
        self.assertEqual(self.room.code, 'SC201')
        self.assertEqual(self.room.capacity, 30)
        self.assertEqual(self.room.room_type, Room.TYPE_CLASSROOM)
        self.assertTrue(self.room.is_active)

    def test_room_str(self):
        self.assertEqual(str(self.room), 'SC201')


class RoomViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
        )
        self.room = Room.objects.create(
            building='EMSI',
            floor=2,
            code='SC202',
            name='Salle de cours SC202',
            room_type=Room.TYPE_CLASSROOM,
            capacity=15,
            location='EMSI - Etage 2',
        )

    def test_room_list(self):
        response = self.client.get('/api/rooms/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data['count'], 1)

    def test_room_detail(self):
        response = self.client.get(f'/api/rooms/{self.room.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['code'], 'SC202')

    def test_room_create_requires_staff(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            '/api/rooms/',
            {
                'building': 'EMSI',
                'floor': 3,
                'code': 'SC301',
                'name': 'Salle de cours SC301',
                'room_type': Room.TYPE_CLASSROOM,
                'capacity': 20,
                'location': 'EMSI - Etage 3',
            },
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
