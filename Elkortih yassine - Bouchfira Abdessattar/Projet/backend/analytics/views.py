from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Avg, Q
from django.utils import timezone
from datetime import timedelta
from ideas.models import Idea
from feedbacks.models import Feedback
from accounts.models import User
from ideas.serializers import IdeaSerializer
from feedbacks.serializers import FeedbackSerializer


def _level_for_reputation(points):
    if points >= 300:
        return 'Expert'
    if points >= 150:
        return 'Gold'
    if points >= 50:
        return 'Silver'
    return 'Bronze'


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def entrepreneur_analytics(request):
    """
    Dashboard analytics pour les entrepreneurs.
    
    Retourne :
    - total_ideas, total_feedbacks, avg_sgv, best_sgv
    - sgv_evolution[] : évolution du SGV par idée (chart line)
    - dimensions_radar[] : moyenne des 4 dimensions (chart radar)
    - recent_feedbacks[] : derniers feedbacks reçus
    """
    user = request.user
    
    # Récupérer les idées et feedbacks de l'entrepreneur
    ideas = Idea.objects.filter(owner=user).select_related('owner')
    feedbacks = Feedback.objects.filter(idea__owner=user).select_related(
        'reviewer', 'reviewer__userprofile', 'idea'
    ).order_by('-created_at')

    # ── Statistiques globales ──────────────────────────────
    total_ideas = ideas.count()
    total_feedbacks = feedbacks.count()
    
    # Calcul du SGV moyen et meilleur SGV
    if feedbacks.exists():
        scores = [f.weighted_score for f in feedbacks]
        avg_sgv = round(sum(scores) / len(scores), 2)
        best_sgv = round(max(scores), 2)
    else:
        avg_sgv = 0
        best_sgv = 0

    # ── Évolution du SGV par idée (chart line) ─────────────
    sgv_evolution = []
    for idea in ideas:
        idea_feedbacks = feedbacks.filter(idea=idea)
        if idea_feedbacks.exists():
            idea_scores = [f.weighted_score for f in idea_feedbacks]
            sgv_evolution.append({
                'idea_id': str(idea.id),
                'idea_title': idea.title[:30],
                'score': round(sum(idea_scores) / len(idea_scores), 2),
                'feedbacks_count': idea_feedbacks.count()
            })

    # ── Moyennes des 4 dimensions (chart radar) ────────────
    dimensions_radar = []
    if feedbacks.exists():
        count = feedbacks.count()
        dimensions_radar = [
            {'dimension': 'Marché', 'score': round(sum(f.market_score for f in feedbacks) / count, 2)},
            {'dimension': 'Innovation', 'score': round(sum(f.innovation_score for f in feedbacks) / count, 2)},
            {'dimension': 'Faisabilité', 'score': round(sum(f.feasibility_score for f in feedbacks) / count, 2)},
            {'dimension': 'ROI', 'score': round(sum(f.roi_score for f in feedbacks) / count, 2)},
        ]

    # ── Derniers feedbacks reçus ────────────────────────────
    recent_feedbacks = []
    for f in feedbacks[:10]:
        recent_feedbacks.append({
            'id': str(f.id),
            'idea_id': str(f.idea.id),
            'idea_title': f.idea.title,
            'reviewer': f.reviewer.username,
            'reviewer_level': getattr(getattr(f.reviewer, 'userprofile', None), 'level', 'Bronze'),
            'weighted_score': round(f.weighted_score, 2),
            'market_score': f.market_score,
            'innovation_score': f.innovation_score,
            'feasibility_score': f.feasibility_score,
            'roi_score': f.roi_score,
            'comment': f.comment[:100] + '...' if len(f.comment) > 100 else f.comment,
            'created_at': f.created_at,
        })

    return Response({
        'stats': {
            'total_ideas': total_ideas,
            'total_feedbacks': total_feedbacks,
            'avg_sgv': avg_sgv,
            'best_sgv': best_sgv,
        },
        'sgv_evolution': sgv_evolution,
        'dimensions_radar': dimensions_radar,
        'recent_feedbacks': recent_feedbacks,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reviewer_analytics(request):
    """Dashboard analytics for reviewers."""
    if request.user.role not in ('reviewer', 'admin'):
        return Response(
            {'detail': 'Reviewer analytics are only available to reviewers.'},
            status=status.HTTP_403_FORBIDDEN
        )

    user = request.user
    feedbacks = Feedback.objects.filter(reviewer=user).select_related(
        'reviewer', 'reviewer__userprofile', 'idea', 'idea__owner'
    ).order_by('-created_at')

    reviewed_idea_ids = feedbacks.values_list('idea_id', flat=True)
    pending_ideas = Idea.objects.filter(status__in=('submitted', 'review')).exclude(
        owner=user
    ).exclude(
        id__in=reviewed_idea_ids
    ).select_related('owner').order_by('-created_at')

    scores = [round(f.weighted_score or 0, 2) for f in feedbacks]
    total_feedbacks = feedbacks.count()
    reputation_points = 0
    try:
        reputation_points = user.userprofile.reputation_score or 0
    except Exception:
        pass

    return Response({
        'stats': {
            'total_feedbacks': total_feedbacks,
            'ideas_reviewed': feedbacks.values('idea_id').distinct().count(),
            'average_score': round(sum(scores) / len(scores), 1) if scores else 0,
            'pending_count': pending_ideas.count(),
            'reputation_points': reputation_points,
            'level': _level_for_reputation(reputation_points),
        },
        'evaluated_ideas': [
            {
                'id': str(f.id),
                'idea_id': f.idea_id,
                'idea_title': f.idea.title,
                'my_score': round(f.weighted_score or 0, 2),
                'market_score': f.market_score,
                'innovation_score': f.innovation_score,
                'feasibility_score': f.feasibility_score,
                'roi_score': f.roi_score,
                'created_at': f.created_at,
            }
            for f in feedbacks
        ],
        'scores': scores,
        'pending_ideas': IdeaSerializer(pending_ideas, many=True, context={'request': request}).data,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_analytics(request):
    """
    Dashboard analytics pour les administrateurs.
    
    Retourne :
    - total_users, total_ideas, total_feedbacks, global_avg_sgv
    - ideas_by_category[] : répartition des idées par catégorie (chart pie)
    - signups_30_days[] : inscriptions des 30 derniers jours
    - feedbacks_30_days[] : feedbacks des 30 derniers jours
    """
    # Vérification : admin uniquement
    if request.user.role != 'admin':
        return Response(
            {'detail': 'Accès réservé aux administrateurs.'},
            status=status.HTTP_403_FORBIDDEN
        )

    # ── Statistiques globales ──────────────────────────────
    total_users = User.objects.count()
    total_ideas = Idea.objects.count()
    total_feedbacks = Feedback.objects.count()
    
    # SGV moyen global
    feedbacks = Feedback.objects.all()
    if feedbacks.exists():
        global_avg_sgv = round(sum(f.weighted_score for f in feedbacks) / feedbacks.count(), 2)
    else:
        global_avg_sgv = 0

    # ── Répartition des idées par statut (chart pie) ───────
    ideas_by_status = Idea.objects.values('status').annotate(count=Count('id'))
    ideas_by_status_data = [
        {'name': item['status'], 'count': item['count']}
        for item in ideas_by_status
    ]

    # ── Inscriptions des 30 derniers jours ─────────────────
    thirty_days_ago = timezone.now() - timedelta(days=30)
    signups_30_days = []
    for i in range(30):
        date = thirty_days_ago + timedelta(days=i)
        count = User.objects.filter(
            date_joined__date=date.date()
        ).count()
        signups_30_days.append({
            'date': date.strftime('%Y-%m-%d'),
            'count': count
        })

    # ── Feedbacks des 30 derniers jours ────────────────────
    feedbacks_30_days = []
    for i in range(30):
        date = thirty_days_ago + timedelta(days=i)
        count = Feedback.objects.filter(
            created_at__date=date.date()
        ).count()
        feedbacks_30_days.append({
            'date': date.strftime('%Y-%m-%d'),
            'count': count
        })

    # ── Utilisateurs par rôle ──────────────────────────────
    users_by_role = User.objects.values('role').annotate(count=Count('id'))
    users_by_role_data = [
        {'role': item['role'], 'count': item['count']}
        for item in users_by_role
    ]

    return Response({
        'stats': {
            'total_users': total_users,
            'total_ideas': total_ideas,
            'total_feedbacks': total_feedbacks,
            'global_avg_sgv': global_avg_sgv,
        },
        'ideas_by_status': ideas_by_status_data,
        'signups_30_days': signups_30_days,
        'feedbacks_30_days': feedbacks_30_days,
        'users_by_role': users_by_role_data,
    })
