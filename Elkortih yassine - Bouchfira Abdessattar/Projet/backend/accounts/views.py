from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.contrib.auth import authenticate
from .models import User, UserProfile, ReputationLog
from .serializers import UserSerializer, UserRegistrationSerializer, UserProfileSerializer, ReputationLogSerializer, PublicUserSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """User registration"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """User login"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'error': 'Username and password required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(request, username=username, password=password)
    if user is None:
        # fallback: try fetching user directly (handles edge cases with custom backends)
        try:
            db_user = User.objects.get(username=username)
            if db_user.check_password(password) and db_user.is_active:
                user = db_user
        except User.DoesNotExist:
            pass

    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    return Response(
        {'detail': 'Invalid credentials'},
        status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """Get current user"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def token_refresh(request):
    from rest_framework_simplejwt.tokens import RefreshToken
    try:
        refresh = RefreshToken(request.data.get('refresh'))
        return Response({'access': str(refresh.access_token)})
    except Exception:
        return Response({'detail': 'Invalid or expired refresh token'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([AllowAny])
def logout(request):
    try:
        token = RefreshToken(request.data.get('refresh'))
        token.blacklist()
    except (TokenError, Exception):
        pass
    return Response({'message': 'Logged out'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_by_username(request, username):
    try:
        user = User.objects.get(username=username)
        return Response(PublicUserSerializer(user, context={'request': request}).data)
    except User.DoesNotExist:
        return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_my_profile(request):
    user = request.user
    for field in ('first_name', 'last_name', 'email'):
        if field in request.data:
            setattr(user, field, request.data[field])
    user.save()
    profile, _ = UserProfile.objects.get_or_create(user=user)
    for field in ('bio', 'speciality'):
        if field in request.data:
            setattr(profile, field, request.data[field])
    if 'avatar' in request.FILES:
        file = request.FILES['avatar']
        # Validate: image only, max 2MB
        allowed = ['image/jpeg', 'image/png', 'image/webp']
        if file.content_type not in allowed:
            return Response({'detail': 'Only JPEG, PNG or WebP images allowed.'}, status=status.HTTP_400_BAD_REQUEST)
        if file.size > 2 * 1024 * 1024:
            return Response({'detail': 'Image must be under 2MB.'}, status=status.HTTP_400_BAD_REQUEST)
        # Delete old avatar file
        if profile.avatar:
            try:
                import os
                if os.path.isfile(profile.avatar.path):
                    os.remove(profile.avatar.path)
            except Exception:
                pass
        profile.avatar = file
    profile.save()
    return Response(PublicUserSerializer(user, context={'request': request}).data)


class UserListView(generics.ListAPIView):
    serializer_class = PublicUserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = User.objects.all().order_by('-date_joined')
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(username__icontains=search) | qs.filter(email__icontains=search)
        return qs


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def admin_update_user(request, pk):
    if request.user.role != 'admin':
        return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    try:
        user = User.objects.get(id=pk)
    except User.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    if 'role' in request.data:
        user.role = request.data['role']
    if 'is_active' in request.data:
        user.is_active = request.data['is_active']
    user.save()
    return Response(PublicUserSerializer(user, context={'request': request}).data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_delete_user(request, pk):
    if request.user.role != 'admin':
        return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    try:
        User.objects.get(id=pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except User.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


class UserProfileDetailView(generics.RetrieveUpdateAPIView):
    """Get or update user profile"""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return UserProfile.objects.get(user=self.request.user)


class ReputationLogListView(generics.ListAPIView):
    """List reputation logs for current user"""
    serializer_class = ReputationLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ReputationLog.objects.filter(user=self.request.user).order_by('-created_at')
