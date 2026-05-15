from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from django.db import models

from .models import Coach, Subscription, Message, Appointment
from .serializers import CoachSerializer, SubscriptionSerializer, MessageSerializer, AppointmentSerializer
from custom_permissions import IsAppointmentOwnerOrParticipant, IsMessageParticipant

User = get_user_model()


class CoachViewSet(viewsets.ModelViewSet):
    """
    Retourne tous les coachs avec image et availability
    """
    queryset = Coach.objects.filter(user__isnull=False)
    serializer_class = CoachSerializer


class SubscriptionViewSet(viewsets.ModelViewSet):
    """
    Gère les relations client → coach payé
    Créé automatiquement à la première séance payante
    """
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Retourner subscriptions pour le user ou ses clients (si coach)"""
        return Subscription.objects.filter(
            models.Q(user=self.request.user) | models.Q(coach=self.request.user)
        )

    @action(detail=False, methods=['get'], url_path='my-coaches')
    def my_coaches(self, request):
        """GET /api/subscriptions/my-coaches/ - Mes coachs actifs (client)"""
        subscriptions = Subscription.objects.filter(
            user=request.user,
            status='active'
        )
        serializer = self.get_serializer(subscriptions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='my-clients')
    def my_clients(self, request):
        """GET /api/subscriptions/my-clients/ - Mes clients actifs (coach)"""
        subscriptions = Subscription.objects.filter(
            coach=request.user,
            status='active'
        )
        serializer = self.get_serializer(subscriptions, many=True)
        return Response(serializer.data)


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated, IsMessageParticipant]

    def get_queryset(self):
        return Message.objects.filter(
            models.Q(sender=self.request.user) | models.Q(receiver=self.request.user)
        ).order_by('-created_at')

    def perform_create(self, serializer):
        """Ajouter sender automatiquement"""
        serializer.save(sender=self.request.user)

    @action(detail=False, methods=['get'], url_path='with-coach')
    def with_coach(self, request):
        """GET /api/messages/with-coach/?coach_id=<id> - Messages avec un coach"""
        coach_id = request.query_params.get('coach_id')
        if not coach_id:
            return Response({'error': 'coach_id required'}, status=400)

        messages = self.get_queryset().filter(
            models.Q(sender_id=coach_id) | models.Q(receiver_id=coach_id)
        )
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path=r'conversation/(?P<user_id>[^/.]+)')
    def conversation(self, request, user_id=None):
        """GET /api/messages/conversation/<user_id>/ - Messages avec un utilisateur"""
        if not user_id:
            return Response({'error': 'user_id required'}, status=400)

        messages = self.get_queryset().filter(
            (models.Q(sender_id=user_id) & models.Q(receiver=request.user)) |
            (models.Q(receiver_id=user_id) & models.Q(sender=request.user))
        ).order_by('created_at')

        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='send')
    def send_message(self, request):
        """POST /api/messages/send/ - Envoyer un message"""

        receiver_id = request.data.get('receiver_id')
        coach_id = request.data.get('coach_id')
        content = request.data.get('content')

        if not receiver_id or not content or not content.strip():
            return Response(
                {'error': 'receiver_id and content are required.'},
                status=400
            )

        try:
            receiver = User.objects.get(pk=receiver_id)
        except User.DoesNotExist:
            return Response({'error': 'Receiver not found.'}, status=404)

        coach = None

        if coach_id:
            try:
                coach = User.objects.get(pk=coach_id, role='coach')
            except User.DoesNotExist:
                return Response({'error': 'Coach not found.'}, status=404)

        message = Message.objects.create(
            sender=request.user,
            receiver=receiver,
            coach=coach,
            content=content.strip()
        )

        serializer = self.get_serializer(message)

        return Response(serializer.data, status=201)

    @action(detail=False, methods=['get'], url_path='contacts')
    def contacts(self, request):
        """Contacts avec qui on a discuté"""
        messages = self.get_queryset().order_by('-created_at')
        contacts_map = {}

        for message in messages:
            partner = message.sender if message.sender != request.user else message.receiver
            coach_user = message.coach
            if not coach_user:
                coach_user = message.sender if getattr(message.sender, 'role', None) == 'coach' else message.receiver if getattr(message.receiver, 'role', None) == 'coach' else None

            if partner.id not in contacts_map:
                contacts_map[partner.id] = {
                    'id': partner.id,
                    'name': partner.get_full_name().strip() or partner.username,
                    'username': partner.username,
                    'lastMessage': message.content,
                    'timestamp': message.created_at,
                    'coach_id': coach_user.id if coach_user else None,
                }

        contacts = sorted(contacts_map.values(), key=lambda x: x['timestamp'], reverse=True)
        return Response(contacts)


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, IsAppointmentOwnerOrParticipant]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'coach':
            return Appointment.objects.filter(coach=user)
        return Appointment.objects.filter(client=user)

    @action(detail=False, methods=['get'], url_path='my')
    def my_appointments(self, request):
        appointments = self.get_queryset()
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='available')
    def available_slots(self, request):
        coach_id = request.query_params.get('coach_id')
        queryset = Appointment.objects.filter(status='available')
        if coach_id:
            queryset = queryset.filter(coach_id=coach_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='create')
    def create_slot(self, request):
        if request.user.role != 'coach':
            return Response({'error': 'Seul un coach peut créer un créneau.'}, status=status.HTTP_403_FORBIDDEN)

        date = request.data.get('date')
        time = request.data.get('time')
        notes = request.data.get('notes', '')

        if not date or not time:
            return Response({'error': 'Date et heure sont requises.'}, status=status.HTTP_400_BAD_REQUEST)

        appointment = Appointment.objects.create(
            coach=request.user,
            date=date,
            time=time,
            notes=notes,
            status='available'
        )

        serializer = self.get_serializer(appointment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='book')
    def book_slot(self, request, pk=None):
        appointment = self.get_object()

        if request.user.role != 'client':
            return Response({'error': 'Seul un client peut réserver un créneau.'}, status=status.HTTP_403_FORBIDDEN)

        if appointment.status != 'available':
            return Response({'error': 'Ce créneau n’est pas disponible.'}, status=status.HTTP_400_BAD_REQUEST)

        appointment.client = request.user
        appointment.status = 'booked'
        appointment.save()

        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], url_path='confirm')
    def confirm_appointment(self, request, pk=None):
        appointment = self.get_object()

        if request.user != appointment.coach:
            return Response({'error': 'Seul le coach peut confirmer ce rendez-vous.'}, status=status.HTTP_403_FORBIDDEN)

        appointment.status = 'confirmed'
        appointment.save()

        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
