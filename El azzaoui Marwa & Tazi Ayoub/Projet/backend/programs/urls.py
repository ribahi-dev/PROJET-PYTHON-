from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Program, Exercise, Nutrition
from .serializers import ProgramSerializer


class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer

    @action(detail=False, methods=['get'], url_path='seed')
    def seed(self, request):
        # Programs
        Program.objects.get_or_create(name="Prise de masse")
        Program.objects.get_or_create(name="Perte de poids")
        Program.objects.get_or_create(name="Débutant")

        # Exercises
        Exercise.objects.get_or_create(name="Squat")
        Exercise.objects.get_or_create(name="Push-up")
        Exercise.objects.get_or_create(name="Deadlift")

        # Nutrition
        Nutrition.objects.get_or_create(name="Diet 2000 kcal")
        Nutrition.objects.get_or_create(name="Diet 2500 kcal")

        return Response({"message": "Database seeded successfully"})
