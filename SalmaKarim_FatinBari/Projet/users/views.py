from rest_framework import generics, permissions, viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import CustomUser
from .serializers import CustomUserSerializer, CustomUserCreateSerializer


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_staff', 'is_active', 'role']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'department', 'emsi_id']
    ordering_fields = ['username', 'date_joined']
    ordering = ['username']

    def get_queryset(self):
        if self.request.user.is_staff:
            return CustomUser.objects.all()
        return CustomUser.objects.filter(pk=self.request.user.pk)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def bookings(self, request, pk=None):
        """Récupérer les réservations d'un utilisateur."""
        from bookings.models import Booking
        from bookings.serializers import BookingSerializer
        
        user = self.get_object()
        
        # Vérifier la permission
        if user != request.user and not request.user.is_staff:
            return Response(
                {'error': 'Vous n\'avez pas la permission.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        bookings = Booking.objects.filter(user=user).order_by('-created_at')
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)


class UserRegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserCreateSerializer
    permission_classes = [permissions.AllowAny]


class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
