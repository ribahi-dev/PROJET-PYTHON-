from django.db import models
from accounts.models import User

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name


class Idea(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Brouillon'),
        ('submitted', 'Soumise'),
        ('review', 'En validation'),
        ('validated', 'Validée'),
        ('rejected', 'Rejetée'),
    )

    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    sector = models.CharField(max_length=100)
    problem = models.TextField()
    solution = models.TextField()
    target = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')

    global_score = models.FloatField(default=0)
    rejection_reason = models.TextField(blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)


class IdeaVersion(models.Model):
    idea = models.ForeignKey(Idea, on_delete=models.CASCADE)
    data_snapshot = models.JSONField()
    version_number = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)