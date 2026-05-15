from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('coach', 'Coach'),
        ('client', 'Client'),
    ]

    GOAL_CHOICES = [
        ('weight_loss', 'Perte de poids'),
        ('muscle_gain', 'Prise de masse'),
        ('maintenance', 'Maintien'),
        ('general_fitness', 'Fitness général'),
    ]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=20, blank=True)

    # Profile fields
    weight = models.FloatField(blank=True, null=True)  # in kg
    height = models.FloatField(blank=True, null=True)  # in cm
    goal = models.CharField(max_length=20, choices=GOAL_CHOICES, blank=True)

    def __str__(self):
        return self.username