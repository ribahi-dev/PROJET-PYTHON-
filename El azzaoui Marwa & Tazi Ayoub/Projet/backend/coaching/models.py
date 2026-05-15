
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Coach(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='coach_profile'
    )
    name = models.CharField(max_length=100)
    specialty = models.CharField(max_length=100)
    experience = models.IntegerField()
    description = models.TextField()
    price = models.FloatField()
    
    # NOUVEAU: Image du coach
    image = models.ImageField(
        upload_to='coaches/',
        blank=True,
        null=True,
        default='coaches/default.png'
    )
    
    # NOUVEAU: Disponibilité texte simple
    availability = models.TextField(
        blank=True,
        default="À convenir"
    )
    
    # NOUVEAU: Lien vidéo (Google Meet ou autre)
    video_link = models.URLField(
        blank=True,
        null=True,
        help_text="Google Meet ou Zoom URL"
    )

    def __str__(self):
        if self.user:
            return f"{self.user.username} - {self.specialty}"
        return self.name


class Client(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='client_profile'
    )
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user.username} - Client"


class Subscription(models.Model):
    """
    SIMPLIFIÉ: Créé automatiquement au premier paiement
    Lien Client → Coach payé
    """
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='client_subscriptions')
    coach = models.ForeignKey(User, on_delete=models.CASCADE, related_name='coach_subscriptions')
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')

    class Meta:
        # Un seul coaching actif par client+coach
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'coach', 'status'],
                condition=models.Q(status='active'),
                name='unique_active_coaching_relation'
            )
        ]

    def is_active(self):
        return self.status == 'active' and self.end_date > timezone.now()

    def __str__(self):
        return f"{self.user.username} → {self.coach.username} ({self.status})"


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    
    # NOUVEAU: Coach lié pour les conversations
    coach = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='coaching_messages',
        limit_choices_to={'role': 'coach'}
    )
    
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.sender.username} → {self.receiver.username}"


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('booked', 'Booked'),
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    client = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='client_appointments',
        null=True,
        blank=True
    )
    coach = models.ForeignKey(User, on_delete=models.CASCADE, related_name='coach_appointments')
    date = models.DateField()
    time = models.TimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='available')
    video_link = models.URLField(blank=True, null=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date', 'time']

    def __str__(self):
        client_name = self.client.username if self.client else 'Disponible'
        return f"{client_name} - {self.coach.username} ({self.date} {self.time})"
