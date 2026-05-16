from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('client', 'Client'),
        ('moniteur', 'Moniteur'),
        ('admin', 'Admin'),
    ]
    email    = models.EmailField(unique=True)
    role     = models.CharField(
                 max_length=10,
                 choices=ROLE_CHOICES,
                 default='client')

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
