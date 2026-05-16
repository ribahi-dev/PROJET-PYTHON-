from django.db import models
from django.conf import settings
from reservations.models import Reservation

class Ticket(models.Model):
    STATUT_CHOICES = [
        ('valide',  'Valide'),
        ('utilise', 'Utilisé'),
        ('expire',  'Expiré'),
    ]
    reservation = models.OneToOneField(
                    Reservation,
                    on_delete=models.CASCADE,
                    related_name='ticket')
    code        = models.CharField(max_length=20, unique=True)
    statut      = models.CharField(
                    max_length=10,
                    choices=STATUT_CHOICES,
                    default='valide')
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Ticket {self.code} – {self.reservation.activite.nom}"

    def save(self, *args, **kwargs):
        if not self.code:
            import uuid
            self.code = str(uuid.uuid4())[:8].upper()
        super().save(*args, **kwargs)
