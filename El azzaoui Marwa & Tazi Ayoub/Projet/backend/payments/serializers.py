from rest_framework import serializers
from .models import Payment
from programs.models import Program


class PaymentSerializer(serializers.ModelSerializer):
    program_title = serializers.SerializerMethodField()
    program_image = serializers.SerializerMethodField()
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Payment
        fields = ['id', 'user', 'username', 'program', 'program_title', 'program_image', 'amount', 'status', 'date']
        read_only_fields = ['id', 'user', 'date']

    def get_program_title(self, obj):
        if obj.program:
            return obj.program.title
        return None

    def get_program_image(self, obj):
        if obj.program and obj.program.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.program.image.url)
            return obj.program.image.url
        return None


# NOUVEAU: Serializer pour paiements coaching avec infos coach
class PaymentWithCoachSerializer(serializers.ModelSerializer):
    coach_name = serializers.CharField(source='coach.coach_profile.name', read_only=True)
    coach_username = serializers.CharField(source='coach.username', read_only=True)
    coach_specialty = serializers.CharField(source='coach.coach_profile.specialty', read_only=True)
    coach_image = serializers.SerializerMethodField()
    coach_price = serializers.FloatField(source='coach.coach_profile.price', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id',
            'user',
            'username',
            'coach',
            'coach_name',
            'coach_username',
            'coach_specialty',
            'coach_image',
            'coach_price',
            'amount',
            'status',
            'description',
            'date'
        ]
        read_only_fields = ['date']

    def get_coach_image(self, obj):
        if obj.coach and hasattr(obj.coach, 'coach_profile') and obj.coach.coach_profile.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.coach.coach_profile.image.url)
        return None