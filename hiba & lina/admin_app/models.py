from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Planning(models.Model):
    JOUR_CHOICES = [
        ('lundi', 'Lundi'),
        ('mardi', 'Mardi'),
        ('mercredi', 'Mercredi'),
        ('jeudi', 'Jeudi'),
        ('vendredi', 'Vendredi'),
        ('samedi', 'Samedi'),
        ('dimanche', 'Dimanche'),
    ]
    
    moniteur = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'moniteur'})
    activite = models.ForeignKey('activities.Activite', on_delete=models.CASCADE)
    jour = models.CharField(max_length=10, choices=JOUR_CHOICES)
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()
    places_disponibles = models.PositiveIntegerField(default=10)
    
    class Meta:
        verbose_name = 'Planning'
        verbose_name_plural = 'Plannings'
        unique_together = ['moniteur', 'activite', 'jour', 'heure_debut']
        ordering = ['jour', 'heure_debut']
    
    def __str__(self):
        return f"{self.moniteur.username} - {self.activite.nom} ({self.jour} {self.heure_debit})"

class Presence(models.Model):
    STATUT_CHOICES = [
        ('present', 'Présent'),
        ('absent', 'Absent'),
        ('retard', 'Retard'),
    ]
    
    planning = models.ForeignKey(Planning, on_delete=models.CASCADE)
    client = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'client'})
    statut = models.CharField(max_length=10, choices=STATUT_CHOICES, default='absent')
    date_presence = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Présence'
        verbose_name_plural = 'Présences'
        unique_together = ['planning', 'client']
        ordering = ['-date_presence']
    
    def __str__(self):
        return f"{self.client.username} - {self.planning} ({self.statut})"
