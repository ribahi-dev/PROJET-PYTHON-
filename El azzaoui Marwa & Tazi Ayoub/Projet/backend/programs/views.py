from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly

from .models import Program, Exercise, NutritionPlan, Progress
from .serializers import ProgramSerializer, ProgressSerializer
from users.models import CustomUser
from custom_permissions import IsCoachOwnerOrReadOnly


class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsCoachOwnerOrReadOnly]

    # ---------------- SEED DATA ----------------
    @action(detail=False, methods=['get'], url_path='seed')
    def seed(self, request):

        # Get a coach (required because Program has NOT NULL FK)
        coach = CustomUser.objects.first()

        if not coach:
            return Response(
                {"error": "No coach user found. Create a user first."},
                status=400
            )

        # Programs
        p1, _ = Program.objects.get_or_create(
            title="Prise de masse",
            coach=coach,
            defaults={
                "description": "Programme prise de masse",
                "duration": 30,
                "price": 199,
            }
        )

        p2, _ = Program.objects.get_or_create(
            title="Perte de poids",
            coach=coach,
            defaults={
                "description": "Programme perte de poids",
                "duration": 30,
                "price": 149,
            }
        )

        p3, _ = Program.objects.get_or_create(
            title="Débutant",
            coach=coach,
            defaults={
                "description": "Programme débutant",
                "duration": 20,
                "price": 99,
            }
        )

        # Exercises
        Exercise.objects.get_or_create(
            name="Squat",
            program=p1,
            defaults={
                "description": "Basic squat",
                "reps": 12,
                "sets": 3
            }
        )

        Exercise.objects.get_or_create(
            name="Push-up",
            program=p1,
            defaults={
                "description": "Push ups",
                "reps": 15,
                "sets": 3
            }
        )

        Exercise.objects.get_or_create(
            name="Deadlift",
            program=p2,
            defaults={
                "description": "Deadlift",
                "reps": 10,
                "sets": 4
            }
        )

        # Nutrition plans
        NutritionPlan.objects.get_or_create(
            title="Diet 2000 kcal",
            program=p1,
            defaults={
                "calories": 2000,
                "protein": 120,
                "carbs": 200,
                "fats": 60
            }
        )

        NutritionPlan.objects.get_or_create(
            title="Diet 2500 kcal",
            program=p2,
            defaults={
                "calories": 2500,
                "protein": 140,
                "carbs": 250,
                "fats": 80
            }
        )

        return Response({"message": "Database seeded successfully"})

    # ---------------- FULL PROGRAM ----------------
    @action(detail=True, methods=['get'])
    def full(self, request, pk=None):
        program = self.get_object()
        return Response(ProgramSerializer(program).data)

    @action(detail=False, methods=['get'], url_path='generate-program')
    def generate_program(self, request):
        data = {
            "program": "Muscle Gain",
            "exercises": ["Squat", "Bench Press"],
            "nutrition": "3000 kcal"
        }

        return Response(data)

    def perform_create(self, serializer):
        # Assure que le programme créé est assigné au coach connecté
        serializer.save(coach=self.request.user)


class ProgressViewSet(viewsets.ModelViewSet):
    serializer_class = ProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Progress.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='add')
    def add_progress(self, request):
        program_id = request.data.get('program_id')
        weight = request.data.get('weight')
        notes = request.data.get('notes', '')

        if weight in [None, '']:
            return Response({'error': 'Le poids est requis'}, status=400)

        program = None
        if program_id:
            try:
                program = Program.objects.get(id=program_id)
            except Program.DoesNotExist:
                return Response({'error': 'Programme introuvable'}, status=404)
        else:
            from payments.models import Payment
            payment = Payment.objects.filter(user=request.user, status='completed').order_by('-date').first()
            if payment and payment.program:
                program = payment.program
            else:
                program = Program.objects.first()

        if not program:
            return Response({'error': 'Aucun programme disponible pour enregistrer la progression'}, status=400)

        progress = Progress.objects.create(
            user=request.user,
            program=program,
            weight=weight,
            notes=notes
        )

        serializer = self.get_serializer(progress)
        return Response(serializer.data, status=201)

    @action(detail=False, methods=['get'], url_path='my')
    def my_progress(self, request):
        progress = self.get_queryset()
        serializer = self.get_serializer(progress, many=True)
        return Response(serializer.data)