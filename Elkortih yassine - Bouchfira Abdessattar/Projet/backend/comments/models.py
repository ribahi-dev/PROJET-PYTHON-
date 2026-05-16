import uuid
from django.db import models
from django.conf import settings


class Comment(models.Model):
    """
    Modèle de commentaire imbriqué (threads) avec soft delete.
    Règles :
    - UUID obligatoire
    - Soft delete uniquement (is_deleted=True)
    - Support des réponses via parent
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    idea = models.ForeignKey('ideas.Idea', on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField(help_text="Contenu du commentaire")
    
    # Thread support : parent = None pour commentaire racine
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    
    # Soft delete : jamais de suppression physique
    is_deleted = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['idea', '-created_at']),
            models.Index(fields=['parent']),
        ]

    def __str__(self):
        return f"Comment by {self.author.username} on {self.idea.title[:30]}"

    def can_edit(self):
        """Modifiable dans les 24h après création."""
        from django.utils import timezone
        from datetime import timedelta
        return (timezone.now() - self.created_at) < timedelta(hours=24)
