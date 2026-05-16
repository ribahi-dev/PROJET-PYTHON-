from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from ideas.models import Idea
from feedbacks.models import Feedback
from accounts.models import User
from ideas.serializers import IdeaSerializer
from feedbacks.serializers import FeedbackSerializer


class SearchPagination(PageNumberPagination):
    """Pagination pour les résultats de recherche."""
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 50


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def global_search(request):
    """
    Recherche globale dans ideas, users et feedbacks.
    
    Query params :
    - q : terme de recherche (requis)
    - filter : 'ideas', 'users', 'feedbacks', ou 'all' (défaut: 'all')
    - page : numéro de page
    - page_size : taille de page (défaut: 12)
    
    Full-text search sur :
    - Ideas : title, description, problem, solution, target, sector
    - Users : username, email, first_name, last_name
    - Feedbacks : comment
    """
    query = request.query_params.get('q', '').strip()
    filter_type = request.query_params.get('filter', 'all').lower()
    
    if not query:
        return Response({
            'detail': 'Le paramètre "q" (terme de recherche) est requis.',
            'results': []
        })
    
    results = {
        'query': query,
        'filter': filter_type,
        'ideas': [],
        'users': [],
        'feedbacks': [],
        'total': 0
    }
    
    # ── Recherche dans les idées ──────────────────────────
    if filter_type in ['all', 'ideas']:
        ideas = Idea.objects.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query) |
            Q(problem__icontains=query) |
            Q(solution__icontains=query) |
            Q(target__icontains=query) |
            Q(sector__icontains=query)
        ).select_related('owner').distinct()[:20]
        
        results['ideas'] = IdeaSerializer(ideas, many=True, context={'request': request}).data
        results['total'] += len(results['ideas'])
    
    # ── Recherche dans les utilisateurs ───────────────────
    if filter_type in ['all', 'users']:
        users = User.objects.filter(
            Q(username__icontains=query) |
            Q(email__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query)
        ).distinct()[:20]
        
        results['users'] = [
            {
                'id': str(user.id),
                'username': user.username,
                'email': user.email,
                'full_name': user.get_full_name(),
                'role': user.role,
                'is_active': user.is_active,
            }
            for user in users
        ]
        results['total'] += len(results['users'])
    
    # ── Recherche dans les feedbacks ──────────────────────
    if filter_type in ['all', 'feedbacks']:
        feedbacks = Feedback.objects.filter(
            Q(comment__icontains=query)
        ).select_related('reviewer', 'idea', 'reviewer__userprofile').distinct()[:20]
        
        results['feedbacks'] = [
            {
                'id': str(f.id),
                'idea_id': str(f.idea.id),
                'idea_title': f.idea.title,
                'reviewer': f.reviewer.username,
                'reviewer_level': getattr(f.reviewer.userprofile, 'level', 'Bronze') if hasattr(f.reviewer, 'userprofile') else 'Bronze',
                'weighted_score': round(f.weighted_score, 2),
                'comment': f.comment[:200] + '...' if len(f.comment) > 200 else f.comment,
                'created_at': f.created_at,
            }
            for f in feedbacks
        ]
        results['total'] += len(results['feedbacks'])
    
    return Response(results)
