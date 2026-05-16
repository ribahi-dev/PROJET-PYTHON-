from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Feedback
from .serializers import FeedbackSerializer
from accounts.permissions import IsReviewer, IsOwnerOrAdmin, IsAdminUser


class FeedbackListCreateView(generics.ListCreateAPIView):
    """
    GET  /feedbacks/?idea=<id>  → feedbacks d'une idée
    GET  /feedbacks/?reviewer=me → mes reviews (authenticated only)
    POST /feedbacks/            → soumettre un feedback (reviewer seulement)
    """
    serializer_class = FeedbackSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsReviewer()]
        # Require authentication if filtering by reviewer='me'
        reviewer = self.request.query_params.get('reviewer')
        if reviewer == 'me':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        qs = Feedback.objects.select_related(
            'reviewer', 'reviewer__userprofile', 'idea', 'idea__owner'
        ).order_by('-created_at')
        idea_id = self.request.query_params.get('idea')
        if idea_id:
            qs = qs.filter(idea_id=idea_id)
        reviewer = self.request.query_params.get('reviewer')
        if reviewer == 'me' and self.request.user.is_authenticated:
            qs = qs.filter(reviewer=self.request.user)
        return qs


class FeedbackDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /feedbacks/<id>/  → détail
    PUT    /feedbacks/<id>/  → modifier (reviewer, dans 24h)
    DELETE /feedbacks/<id>/  → supprimer (admin seulement)
    """
    queryset           = Feedback.objects.select_related('reviewer', 'idea')
    serializer_class   = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [permissions.IsAuthenticated(), IsAdminUser()]
        return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]

    def perform_destroy(self, instance):
        idea = instance.idea
        instance.delete()
        # Recalculate SGV synchronously
        try:
            feedbacks = Feedback.objects.filter(idea=idea)
            if feedbacks.exists():
                avg = sum(f.weighted_score for f in feedbacks) / feedbacks.count()
                idea.global_score = round(avg, 2)
            else:
                idea.global_score = 0
            idea.save(update_fields=['global_score'])
        except Exception:
            pass


class FeedbackHelpfulView(APIView):
    """
    POST /feedbacks/<id>/helpful/
    L'entrepreneur marque un feedback comme "le plus utile".
    Donne +3 pts de réputation au reviewer.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            feedback = Feedback.objects.select_related(
                'idea__owner', 'reviewer__profile'
            ).get(pk=pk)
        except Feedback.DoesNotExist:
            return Response({'error': 'Feedback introuvable.'}, status=404)

        # Seul le propriétaire de l'idée peut marquer
        if feedback.idea.owner != request.user:
            return Response(
                {'error': 'Seul le propriétaire de l\'idée peut marquer un feedback comme utile.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Démarquer l'ancien helpful si existant
        Feedback.objects.filter(
            idea=feedback.idea, is_helpful=True
        ).exclude(pk=pk).update(is_helpful=False)

        # Marquer ce feedback
        feedback.is_helpful = True
        feedback.save(update_fields=['is_helpful'])

        # Récompenser le reviewer (+3 pts)
        try:
            feedback.reviewer.profile.add_reputation(3)
            from accounts.models import ReputationLog
            ReputationLog.objects.create(
                user=feedback.reviewer,
                points=3,
                reason="Feedback marqué comme le plus utile",
            )
        except Exception:
            pass

        return Response({'message': 'Feedback marqué comme le plus utile !'})
