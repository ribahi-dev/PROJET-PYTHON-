from django.contrib import admin
from .models import Program, Enrollment, Exercise, NutritionPlan, Progress


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ("title", "coach", "duration", "image")
    search_fields = ("title", "coach__username", "description")
    list_filter = ("coach", "duration")
    ordering = ("title",)


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ("user", "program", "date_joined")
    search_fields = ("user__username", "program__title")
    list_filter = ("date_joined", "program")
    ordering = ("-date_joined",)


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ("name", "program", "sets", "reps")
    search_fields = ("name", "program__title")
    list_filter = ("program",)
    ordering = ("program", "name")


@admin.register(NutritionPlan)
class NutritionPlanAdmin(admin.ModelAdmin):
    list_display = ("title", "program", "calories", "protein", "carbs", "fats")
    search_fields = ("title", "program__title")
    list_filter = ("program",)
    ordering = ("program", "title")


@admin.register(Progress)
class ProgressAdmin(admin.ModelAdmin):
    list_display = ("user", "program", "weight", "date")
    search_fields = ("user__username", "program__title", "notes")
    list_filter = ("date", "user")
    ordering = ("-date",)
