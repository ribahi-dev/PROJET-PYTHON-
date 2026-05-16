import os
from django.contrib.auth.models import AbstractUser
from django.db import models

def avatar_upload_path(instance, filename):
    ext = filename.rsplit('.', 1)[-1].lower()
    return f'avatars/{instance.user.id}.{ext}'

class User(AbstractUser):
    ROLE_CHOICES = (
        ('entrepreneur', 'Entrepreneur'),
        ('reviewer', 'Reviewer'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='entrepreneur')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.username


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to=avatar_upload_path, blank=True, null=True)
    speciality = models.CharField(max_length=100, blank=True)
    reputation_score = models.FloatField(default=0)
    level = models.CharField(max_length=20, default='Bronze')

    def __str__(self):
        return self.user.username


class ReputationLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    points = models.IntegerField()
    reason = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)