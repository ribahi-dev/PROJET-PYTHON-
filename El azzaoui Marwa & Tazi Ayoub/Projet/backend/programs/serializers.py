from rest_framework import serializers
from .models import Program, Exercise, NutritionPlan, Progress


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = '__all__'


class NutritionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = NutritionPlan
        fields = '__all__'


class ProgramSerializer(serializers.ModelSerializer):
    exercises = ExerciseSerializer(many=True, read_only=True)
    nutrition_plans = NutritionPlanSerializer(many=True, read_only=True)

    class Meta:
        model = Program
        fields = '__all__'
        read_only_fields = ['coach']


class ProgressSerializer(serializers.ModelSerializer):
    program_title = serializers.CharField(source='program.title', read_only=True)

    class Meta:
        model = Progress
        fields = ['id', 'user', 'program', 'program_title', 'weight', 'notes', 'date']
        read_only_fields = ['user', 'date']
