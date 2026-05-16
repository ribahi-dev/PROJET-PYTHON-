import uuid
from django.db import models
from django.conf import settings


class Bookmark(models.Model):
    """
    Modèle de favoris (bookmarks) pour les idées.
    
    Règles :
    - UUID obligatoire
    - UNIQUE(user, idea) : un utilisateur ne peut bookmarker qu'une fois la même idée
    - Toggle : bookmarker deux fois = supprimer
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookmarks')
    idea = models.ForeignKey('ideas.Idea', on_delete=models.CASCADE, related_name='bookmarks')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'idea')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f"{self.user.username} bookmarked {self.idea.title[:30]}"
