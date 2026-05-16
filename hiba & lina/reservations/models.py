from django.db import models
from django.conf import settings
from activities.models import Activite

class Reservation(models.Model):
    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('confirmee',  'Confirmée'),
        ('annulee',    'Annulée'),
    ]
    user             = models.ForeignKey(
                         settings.AUTH_USER_MODEL,
                         on_delete=models.CASCADE,
                         related_name='reservations')
    activite         = models.ForeignKey(
                         Activite,
                         on_delete=models.CASCADE,
                         related_name='reservations')
    date_reservation = models.DateField()
    nombre_personnes = models.PositiveIntegerField(default=1)
    statut           = models.CharField(
                         max_length=20,
                         choices=STATUT_CHOICES,
                         default='en_attente')
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering            = ['-created_at']
        verbose_name        = 'Réservation'
        verbose_name_plural = 'Réservations'

    def __str__(self):
        return f"{self.user.username} – {self.activite.nom}"
