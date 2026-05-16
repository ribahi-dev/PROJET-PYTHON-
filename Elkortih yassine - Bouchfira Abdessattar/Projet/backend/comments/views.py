from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from .models import Comment
from .serializers import CommentSerializer, CommentCreateSerializer
from ideas.models import Idea


class CommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des commentaires.
    
    Endpoints :
    - GET    /api/comments/?idea_id=<uuid>  → liste des commentaires d'une idée
    - POST   /api/comments/                 → créer un commentaire
    - PATCH  /api/comments/<uuid>/          → modifier (auteur uniquement, 24h)
    - DELETE /api/comments/<uuid>/          → soft delete
    """
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = CommentSerializer
    lookup_field = 'id'

    def get_queryset(self):
        """
        Retourne les commentaires racines (parent=None) non supprimés.
        Filtre par idea_id si fourni.
        Optimisation : select_related pour éviter N+1.
        """
        queryset = Comment.objects.filter(
            is_deleted=False,
            parent__isnull=True  # Seulement les commentaires racines
        ).select_related('author', 'author__userprofile', 'idea').prefetch_related('replies')

        idea_id = self.request.query_params.get('idea_id')
        if idea_id:
            queryset = queryset.filter(idea_id=idea_id)

        return queryset.order_by('-created_at')

    def get_serializer_class(self):
        """Utilise CommentCreateSerializer pour la création."""
        if self.action == 'create':
            return CommentCreateSerializer
        return CommentSerializer

    def perform_create(self, serializer):
        comment = serializer.save(author=self.request.user)
        try:
            from notifications.utils import notify
            from accounts.reputation import add_reputation
            idea = comment.idea
            if idea.owner != self.request.user:
                notify(idea.owner, 'new_comment',
                    f'{self.request.user.username} commented on your idea "{idea.title}".',
                    related_id=idea.id)
                add_reputation(idea.owner, 2, f'Received comment on "{idea.title}"')
        except Exception:
            pass

    def update(self, request, *args, **kwargs):
        """
        Modification d'un commentaire.
        Règles :
        - Auteur uniquement
        - Dans les 24h après création
        """
        comment = self.get_object()

        # Vérification : auteur uniquement
        if comment.author != request.user:
            return Response(
                {'detail': 'Vous ne pouvez modifier que vos propres commentaires.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Vérification : 24h maximum
        if not comment.can_edit():
            return Response(
                {'detail': 'Vous ne pouvez plus modifier ce commentaire (délai de 24h dépassé).'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        Soft delete : marque is_deleted=True au lieu de supprimer.
        Seul l'auteur peut supprimer son commentaire.
        """
        comment = self.get_object()

        # Vérification : auteur uniquement
        if comment.author != request.user:
            return Response(
                {'detail': 'Vous ne pouvez supprimer que vos propres commentaires.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Soft delete
        comment.is_deleted = True
        comment.content = "[Commentaire supprimé]"
        comment.save(update_fields=['is_deleted', 'content'])

        return Response(
            {'detail': 'Commentaire supprimé avec succès.'},
            status=status.HTTP_204_NO_CONTENT
        )
