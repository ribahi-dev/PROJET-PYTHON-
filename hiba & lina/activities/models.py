from django.db import models

class Activite(models.Model):
    CATEGORIE_CHOICES = [
        ('equitation', 'Équitation'),
        ('mer',        'Balade en Mer'),
        ('stage',      'Stage'),
    ]
    nom         = models.CharField(max_length=200)
    description = models.TextField()
    categorie   = models.CharField(
                    max_length=20,
                    choices=CATEGORIE_CHOICES,
                    default='equitation')
    image       = models.ImageField(
                    upload_to='activities/',
                    blank=True, null=True)
    prix        = models.DecimalField(
                    max_digits=8,
                    decimal_places=2,
                    default=0)
    duree       = models.CharField(max_length=50, default='1h')
    places_max  = models.PositiveIntegerField(default=10)
    disponible  = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name        = 'Activité'
        verbose_name_plural = 'Activités'
        ordering            = ['-created_at']

    def __str__(self):
        return self.nom
