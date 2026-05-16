from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Bookmark
from .serializers import BookmarkSerializer, BookmarkCreateSerializer
from ideas.models import Idea


class BookmarkViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des bookmarks.
    
    Endpoints :
    - GET  /api/bookmarks/           → liste des favoris de l'utilisateur
    - POST /api/bookmarks/           → toggle bookmark (ajouter/retirer)
    - GET  /api/bookmarks/check/     → vérifier si une idée est bookmarkée
    """
    permission_classes = [IsAuthenticated]
    serializer_class = BookmarkSerializer
    http_method_names = ['get', 'post', 'delete']

    def get_queryset(self):
        """
        Retourne les bookmarks de l'utilisateur connecté.
        Optimisation : select_related + prefetch_related pour éviter N+1.
        """
        return Bookmark.objects.filter(user=self.request.user).select_related(
            'idea', 'idea__owner'
        ).order_by('-created_at')

    def get_serializer_class(self):
        """Utilise BookmarkCreateSerializer pour la création."""
        if self.action == 'create':
            return BookmarkCreateSerializer
        return BookmarkSerializer

    def create(self, request, *args, **kwargs):
        """
        Toggle bookmark :
        - Si bookmark existe → supprimer
        - Si bookmark n'existe pas → créer
        """
        idea_id = request.data.get('idea')
        
        if not idea_id:
            return Response(
                {'detail': 'idea est requis.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Vérifier que l'idée existe
        idea = get_object_or_404(Idea, id=idea_id)

        # Vérifier si le bookmark existe déjà
        try:
            bookmark = Bookmark.objects.get(user=request.user, idea=idea)
            bookmark.delete()
            return Response(
                {'detail': 'Bookmark supprimé.', 'action': 'removed'},
                status=status.HTTP_200_OK
            )
        except Bookmark.DoesNotExist:
            # Créer un nouveau bookmark
            bookmark = Bookmark.objects.create(user=request.user, idea=idea)
            serializer = self.get_serializer(bookmark)
            return Response(
                {'detail': 'Bookmark créé.', 'action': 'created', 'bookmark': serializer.data},
                status=status.HTTP_201_CREATED
            )

    @action(detail=False, methods=['get'], url_path='check')
    def check_bookmark(self, request):
        """
        Vérifie si une idée est bookmarkée par l'utilisateur.
        Query param : idea_id
        """
        idea_id = request.query_params.get('idea_id')
        
        if not idea_id:
            return Response(
                {'detail': 'idea_id est requis.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        is_bookmarked = Bookmark.objects.filter(
            user=request.user,
            idea_id=idea_id
        ).exists()

        return Response({'is_bookmarked': is_bookmarked})
