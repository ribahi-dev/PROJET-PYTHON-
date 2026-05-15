from django.db import models
from django.contrib.auth import get_user_model
from programs.models import Program

User = get_user_model()

class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments_made')
    
    # NOUVEAU: Coach pour tracer paiement → coaching
    coach = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='coaching_payments',
        null=True,
        blank=True,
        limit_choices_to={'role': 'coach'}
    )
    
    # OPTIONNEL: Garder program pour compatibilité
    program = models.ForeignKey(Program, on_delete=models.CASCADE, null=True, blank=True)
    
    amount = models.FloatField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    date = models.DateTimeField(auto_now_add=True)
    
    # NOUVEAU: Description (ex: "Séance coaching Samedi 10h")
    description = models.CharField(max_length=255, blank=True, default="Séance coaching")

    class Meta:
        # Éviter repeating payment pour même coach
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'coach'],
                condition=models.Q(status='completed'),
                name='unique_user_coach_payment'
            )
        ]
        ordering = ['-date']

    def __str__(self):
        coach_name = self.coach.username if self.coach else "Program"
        return f"{self.user.username} → {coach_name} ({self.status})"