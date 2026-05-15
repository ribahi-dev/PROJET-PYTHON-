from rest_framework import serializers
from .models import CustomUser


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = '__all__'


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'weight', 'height', 'goal', 'role']
        read_only_fields = ['id', 'username', 'role']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, required=True)
    role = serializers.ChoiceField(choices=['client', 'coach'], required=True)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'password_confirm', 'role']

    def validate(self, data):
        """Vérifie que les deux mots de passe correspondent"""
        if data.get('password') != data.get('password_confirm'):
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})
        return data

    def validate_username(self, value):
        """Vérifie que le username n'existe pas"""
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur existe déjà.")
        return value

    def validate_email(self, value):
        """Vérifie que l'email n'existe pas"""
        if value and CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value

    def create(self, validated_data):
        """Crée l'utilisateur avec le mot de passe hashé et un profil lié."""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')

        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=password,
            role=validated_data['role']
        )

        if user.role == 'coach':
            from coaching.models import Coach
            Coach.objects.create(
                user=user,
                name=user.username,
                specialty='',
                experience=0,
                description='',
                price=0.0
            )
        else:
            from coaching.models import Client
            Client.objects.create(user=user)

        return user
