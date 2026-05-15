from rest_framework import serializers

from .models import CustomUser
from .utils import build_unique_username, normalize_email


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'emsi_id',
            'phone',
            'department',
            'role',
        ]
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'role': {'required': True},
        }


class CustomUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    username = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = CustomUser
        fields = [
            'id',
            'username',
            'email',
            'password',
            'first_name',
            'last_name',
            'emsi_id',
            'phone',
            'department',
            'role',
        ]

    def validate_email(self, value):
        value = normalize_email(value)
        if CustomUser.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Cet email est deja utilise.')
        return value

    def validate_emsi_id(self, value):
        if value and CustomUser.objects.filter(emsi_id__iexact=value).exists():
            raise serializers.ValidationError('Cet identifiant EMSI est deja utilise.')
        return value.upper() if value else value

    def create(self, validated_data):
        password = validated_data.pop('password')
        requested_username = (validated_data.pop('username', '') or '').strip()
        email = validated_data.get('email', '')
        if requested_username:
            validated_data['username'] = requested_username
        else:
            validated_data['username'] = build_unique_username(
                email=email,
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', ''),
            )
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user
