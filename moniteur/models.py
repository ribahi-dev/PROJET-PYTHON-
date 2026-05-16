from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class AssignationMoniteur(models.Model):
    moniteur = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'moniteur'})
    activite = models.ForeignKey('activities.Activite', on_delete=models.CASCADE)
    date_assignation = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Assignation Moniteur'
        verbose_name_plural = 'Assignations Moniteurs'
        unique_together = ['moniteur', 'activite']
        ordering = ['-date_assignation']
    
    def __str__(self):
        return f"{self.moniteur.username} - {self.activite.nom}"
