from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Coach, Subscription, Message, Appointment

User = get_user_model()


class CoachSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    
    # NOUVEAU: Image URL
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Coach
        fields = [
            'id',
            'user',
            'username',
            'email',
            'name',
            'specialty',
            'experience',
            'description',
            'price',
            'image',
            'image_url',
            'availability',
            'video_link'
        ]

    def get_image_url(self, obj):
        """Retourner URL absolute de l'image"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
        return None


class SubscriptionSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    coach_username = serializers.CharField(source='coach.username', read_only=True)

    class Meta:
        model = Subscription
        fields = ['id', 'user', 'user_username', 'coach', 'coach_username', 'start_date', 'end_date', 'status']
        read_only_fields = ['start_date']


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    receiver_name = serializers.CharField(source='receiver.username', read_only=True)
    coach_name = serializers.CharField(source='coach.username', read_only=True, required=False)
    receiver_id = serializers.PrimaryKeyRelatedField(source='receiver', queryset=User.objects.all(), write_only=True)
    coach_id = serializers.PrimaryKeyRelatedField(
        source='coach',
        queryset=User.objects.filter(role='coach'),
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Message
        fields = [
            'id',
            'sender',
            'receiver',
            'receiver_id',
            'sender_name',
            'receiver_name',
            'coach',
            'coach_id',
            'coach_name',
            'content',
            'created_at',
            'is_read'
        ]
        read_only_fields = ['sender', 'created_at']


class AppointmentSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.username', read_only=True)
    coach_name = serializers.CharField(source='coach.username', read_only=True)

    class Meta:
        model = Appointment
        fields = ['id', 'client', 'coach', 'client_name', 'coach_name', 'date', 'time', 'status', 'video_link', 'notes', 'created_at']
        read_only_fields = ['client', 'created_at']


# NOUVEAU: Serializer pour paiements coaching avec infos coach
class PaymentWithCoachSerializer(serializers.Serializer):
    """Affiche infos complet de paiement + coach"""
    id = serializers.IntegerField()
    user = serializers.IntegerField()
    coach = serializers.IntegerField()
    coach_name = serializers.SerializerMethodField()
    coach_username = serializers.SerializerMethodField()
    coach_specialty = serializers.SerializerMethodField()
    coach_image = serializers.SerializerMethodField()
    coach_price = serializers.SerializerMethodField()
    amount = serializers.FloatField()
    status = serializers.CharField()
    description = serializers.CharField()
    date = serializers.DateTimeField()

    def get_coach_name(self, obj):
        if hasattr(obj, 'coach') and hasattr(obj.coach, 'coach_profile'):
            return obj.coach.coach_profile.name
        return None

    def get_coach_username(self, obj):
        if hasattr(obj, 'coach'):
            return obj.coach.username
        return None

    def get_coach_specialty(self, obj):
        if hasattr(obj, 'coach') and hasattr(obj.coach, 'coach_profile'):
            return obj.coach.coach_profile.specialty
        return None

    def get_coach_image(self, obj):
        if hasattr(obj, 'coach') and hasattr(obj.coach, 'coach_profile') and obj.coach.coach_profile.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.coach.coach_profile.image.url)
        return None

    def get_coach_price(self, obj):
        if hasattr(obj, 'coach') and hasattr(obj.coach, 'coach_profile'):
            return obj.coach.coach_profile.price
        return None
