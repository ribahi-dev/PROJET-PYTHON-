import uuid
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Feedback(models.Model):
    id                = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    idea              = models.ForeignKey('ideas.Idea', on_delete=models.CASCADE, related_name='feedbacks')
    reviewer          = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='feedbacks_given')

    # ── 4 dimensions (0-25 chacune) ──────────────────────
    market_score      = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(25)],
        help_text="Potentiel de marché (0-25)"
    )
    innovation_score  = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(25)],
        help_text="Innovation / différenciation (0-25)"
    )
    feasibility_score = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(25)],
        help_text="Faisabilité technique (0-25)"
    )
    roi_score         = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(25)],
        help_text="Rentabilité / ROI (0-25)"
    )

    # ── Commentaire obligatoire ───────────────────────────
    comment           = models.TextField(help_text="Commentaire détaillé (min 50 caractères)")

    # ── Score calculé ─────────────────────────────────────
    weighted_score    = models.FloatField(default=0.0)
    is_helpful        = models.BooleanField(default=False)

    created_at        = models.DateTimeField(auto_now_add=True)
    updated_at        = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('idea', 'reviewer')  # 1 seul feedback par (reviewer, idea)
        ordering        = ['-created_at']

    def __str__(self):
        return f"Feedback de {self.reviewer.username} sur '{self.idea.title}'"

    @property
    def raw_score(self):
        """Score brut = somme des 4 dimensions (max 100)."""
        return self.market_score + self.innovation_score + self.feasibility_score + self.roi_score

    def can_edit(self):
        """Modifiable seulement dans les 24h après soumission."""
        from django.utils import timezone
        from datetime import timedelta
        return (timezone.now() - self.created_at) < timedelta(hours=24)

    def calculate_weighted_score(self):
        """Calcule le score pondéré selon la réputation du reviewer."""
        try:
            coeff = self.reviewer.profile.sgv_coefficient
        except Exception:
            coeff = 1.0
        self.weighted_score = self.raw_score * coeff
        self.save(update_fields=['weighted_score'])
        return self.weighted_score