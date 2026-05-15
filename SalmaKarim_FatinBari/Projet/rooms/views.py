from datetime import datetime

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from bookings.utils import get_room_availability
from core.permissions import IsStaffOrReadOnly

from .models import Room
from .serializers import RoomSerializer


class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.filter(is_active=True).order_by('name')
    serializer_class = RoomSerializer
    permission_classes = [IsStaffOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'capacity', 'room_type', 'floor', 'building']
    search_fields = ['name', 'location', 'description', 'equipment']
    ordering_fields = ['name', 'capacity', 'created_at']
    ordering = ['name']

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def availability(self, request, pk=None):
        room = self.get_object()
        date_str = request.query_params.get('date', datetime.now().date().isoformat())

        try:
            parsed_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Format de date invalide. Utilisez YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        availability = get_room_availability(room.id, parsed_date)
        return Response(availability)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def all_availability(self, request):
        date_str = request.query_params.get('date', datetime.now().date().isoformat())

        try:
            parsed_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Format de date invalide. Utilisez YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        availability_data = []
        for room in self.get_queryset():
            availability = get_room_availability(room.id, parsed_date)
            if availability:
                availability_data.append(availability)

        return Response({'date': parsed_date, 'rooms': availability_data})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def deactivate(self, request, pk=None):
        room = self.get_object()
        room.is_active = False
        room.save()
        return Response({'message': f'Salle {room.code} desactivee.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def activate(self, request, pk=None):
        room = self.get_object()
        room.is_active = True
        room.save()
        return Response({'message': f'Salle {room.code} activee.'}, status=status.HTTP_200_OK)
