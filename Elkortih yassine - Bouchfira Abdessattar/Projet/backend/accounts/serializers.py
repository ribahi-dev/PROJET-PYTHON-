from rest_framework import serializers
from .models import User, UserProfile, ReputationLog


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_active')
        read_only_fields = ('id',)


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'role')

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        UserProfile.objects.create(user=user)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    reputation_score = serializers.SerializerMethodField()
    level = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ('id', 'user', 'bio', 'avatar_url', 'speciality', 'reputation_score', 'level')
        read_only_fields = ('id', 'reputation_score', 'level')

    def get_reputation_score(self, obj):
        if obj.user.role == 'admin':
            return None
        return obj.reputation_score

    def get_level(self, obj):
        if obj.user.role == 'admin':
            return None
        return obj.level


class PublicUserSerializer(serializers.ModelSerializer):
    """Flat serializer merging User + UserProfile for the profile page"""
    bio        = serializers.SerializerMethodField()
    avatar     = serializers.SerializerMethodField()
    speciality = serializers.SerializerMethodField()
    reputation_points = serializers.SerializerMethodField()
    level      = serializers.SerializerMethodField()
    full_name  = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'role', 'is_active', 'date_joined',
                  'bio', 'avatar', 'speciality', 'reputation_points', 'level')

    def _profile(self, obj):
        try:
            return obj.userprofile
        except Exception:
            return None

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username

    def get_bio(self, obj):
        p = self._profile(obj); return p.bio if p else ''

    def get_avatar(self, obj):
        p = self._profile(obj)
        if not p or not p.avatar:
            return ''
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(p.avatar.url)
        return p.avatar.url

    def get_speciality(self, obj):
        p = self._profile(obj); return p.speciality if p else ''

    def get_reputation_points(self, obj):
        if obj.role == 'admin':
            return None
        p = self._profile(obj); return p.reputation_score if p else 0

    def get_level(self, obj):
        if obj.role == 'admin':
            return None
        p = self._profile(obj); return p.level if p else 'Bronze'


class ReputationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReputationLog
        fields = ('id', 'user', 'points', 'reason', 'created_at')
        read_only_fields = ('id', 'created_at')
