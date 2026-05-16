from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from django.utils.text import slugify
from .models import Idea, Category, IdeaVersion
from .serializers import IdeaSerializer, CategorySerializer, IdeaVersionSerializer


class CategoryListView(generics.ListCreateAPIView):
    """List all categories or create new category"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def list(self, request, *args, **kwargs):
        categories = [
            {
                'id': category.id,
                'name': category.name,
                'slug': category.slug,
                'source': 'managed',
                'ideas_count': Idea.objects.filter(sector__iexact=category.name).count(),
            }
            for category in Category.objects.all().order_by('name')
        ]
        known_slugs = {category['slug'] for category in categories}

        sector_rows = (
            Idea.objects
            .exclude(sector='')
            .values('sector')
            .annotate(ideas_count=Count('id'))
            .order_by('sector')
        )
        for row in sector_rows:
            name = (row['sector'] or '').strip()
            if not name:
                continue
            slug = slugify(name)
            if slug in known_slugs:
                continue
            categories.append({
                'id': None,
                'name': name,
                'slug': slug,
                'source': 'idea_sector',
                'ideas_count': row['ideas_count'],
            })
            known_slugs.add(slug)

        return Response(categories)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def perform_create(self, serializer):
        from rest_framework.exceptions import PermissionDenied
        if self.request.user.role != 'admin':
            raise PermissionDenied('Only admins can create categories')
        serializer.save()


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update or delete a category"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        from rest_framework.exceptions import PermissionDenied
        if self.request.user.role != 'admin':
            raise PermissionDenied('Only admins can update categories')
        serializer.save()

    def perform_destroy(self, instance):
        from rest_framework.exceptions import PermissionDenied
        if self.request.user.role != 'admin':
            raise PermissionDenied('Only admins can delete categories')
        instance.delete()


class IdeaListView(generics.ListCreateAPIView):
    queryset = Idea.objects.all()
    serializer_class = IdeaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        p = self.request.query_params
        owner    = p.get('owner')
        search   = p.get('search')
        sector   = p.get('sector') or p.get('category')  # frontend sends 'category'
        audience = p.get('audience')
        ordering = p.get('ordering', '-created_at')
        user = self.request.user
        role = user.role if user.is_authenticated else None
        can_review = role in ('reviewer', 'admin')
        show_all = p.get('all') in ('1', 'true', 'True') and role == 'admin'
        min_score = p.get('min_score')
        max_score = p.get('max_score')
        date_from = p.get('date_from')
        date_to   = p.get('date_to')

        if owner:
            queryset = Idea.objects.filter(owner__username=owner)
            if not user.is_authenticated or (user.username != owner and not can_review):
                queryset = queryset.filter(status='validated')
        elif show_all:
            queryset = Idea.objects.all()
        elif p.get('queue') == 'review' and can_review:
            queryset = Idea.objects.filter(status__in=('submitted', 'review'))
        else:
            requested_statuses = [
                item.strip()
                for item in (p.get('status') or '').split(',')
                if item.strip()
            ]
            allowed_statuses = ('draft', 'submitted', 'review', 'validated', 'rejected') if can_review else ('validated',)
            statuses = [status for status in requested_statuses if status in allowed_statuses]
            if statuses:
                queryset = Idea.objects.filter(status__in=statuses)
            elif can_review and audience == 'reviewer':
                queryset = Idea.objects.all()
            elif can_review:
                queryset = Idea.objects.filter(status__in=('submitted', 'review', 'validated', 'rejected'))
            else:
                queryset = Idea.objects.filter(status='validated')

        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(description__icontains=search))
        if sector:
            queryset = queryset.filter(sector__iexact=sector)
        if min_score:
            queryset = queryset.filter(global_score__gte=min_score)
        if max_score:
            queryset = queryset.filter(global_score__lte=max_score)
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)

        allowed_orderings = ('created_at', '-created_at', 'global_score', '-global_score')
        if ordering not in allowed_orderings:
            ordering = '-created_at'
        return queryset.order_by(ordering)

    def perform_create(self, serializer):
        idea = serializer.save()
        if idea.status == 'submitted':
            from notifications.utils import notify_admins
            notify_admins(
                'admin_new_idea',
                f'New idea "{idea.title}" was submitted by {idea.owner.username}.',
                related_id=idea.id,
            )


class IdeaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Idea.objects.all()
    serializer_class = IdeaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Idea.objects.all()
        user = self.request.user
        if not user.is_authenticated:
            return queryset.filter(status='validated')
        if user.role == 'admin':
            return queryset
        if user.role == 'reviewer':
            return queryset.filter(Q(owner=user) | Q(status__in=('submitted', 'review', 'validated', 'rejected')))
        return queryset.filter(Q(owner=user) | Q(status='validated'))

    def perform_update(self, serializer):
        idea = self.get_object()
        if idea.owner != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You can only update your own ideas')
        if idea.status not in ('draft', 'rejected'):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only draft or rejected ideas can be edited')
        updated = serializer.save()
        # +50 pts if idea just got validated
        if updated.status == 'validated' and idea.status != 'validated':
            from accounts.reputation import add_reputation
            from notifications.utils import notify
            add_reputation(idea.owner, 50, f'Idea "{idea.title}" was validated')
            notify(idea.owner, 'status_changed', f'Your idea "{idea.title}" has been validated! +50 reputation points.', related_id=idea.id)

    def perform_destroy(self, instance):
        if self.request.user.role == 'admin':
            instance.delete()
            return
        if instance.owner != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You can only delete your own ideas')
        if instance.status != 'draft':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only draft ideas can be deleted')
        instance.delete()


@api_view(['GET'])
@permission_classes([AllowAny])
def trending_ideas(request):
    ideas = Idea.objects.filter(status='validated').order_by('-global_score', '-created_at')[:10]
    return Response(IdeaSerializer(ideas, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recommended_ideas(request):
    ideas = Idea.objects.filter(status='validated').exclude(owner=request.user).order_by('-global_score')[:10]
    return Response(IdeaSerializer(ideas, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def review_queue(request):
    """List submitted/in-review ideas for reviewers and admins."""
    from rest_framework.exceptions import PermissionDenied
    # Check if user is reviewer or admin
    if not (request.user.role in ('reviewer', 'admin')):
        raise PermissionDenied('Only reviewers or admins can view the review queue')

    ideas = Idea.objects.filter(status__in=('submitted', 'review')).order_by('-created_at')
    serializer = IdeaSerializer(ideas, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def change_idea_status(request, pk):
    """Reviewer or admin can validate/reject a submitted idea."""
    from rest_framework.exceptions import PermissionDenied
    if request.user.role not in ('reviewer', 'admin'):
        raise PermissionDenied('Only reviewers or admins can change idea status')
    try:
        idea = Idea.objects.get(id=pk)
    except Idea.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    allowed = ('review', 'validated', 'rejected')
    if new_status not in allowed:
        return Response({'detail': f'Status must be one of {allowed}'}, status=status.HTTP_400_BAD_REQUEST)

    old_status = idea.status
    idea.status = new_status
    if new_status == 'rejected':
        idea.rejection_reason = request.data.get('rejection_reason', '')
    else:
        idea.rejection_reason = ''
    idea.save()

    from notifications.utils import notify
    from accounts.reputation import add_reputation

    label = {'review': 'moved to review', 'validated': 'validated ✓', 'rejected': 'rejected'}
    notify(
        idea.owner, 'status_changed',
        f'Your idea "{idea.title}" has been {label[new_status]} by {request.user.username}.',
        related_id=idea.id,
    )
    if new_status == 'validated' and old_status != 'validated':
        add_reputation(idea.owner, 50, f'Idea "{idea.title}" was validated')
    if request.user.role != 'admin' and old_status != new_status:
        from notifications.utils import notify_admins
        admin_label = {'review': 'moved to review', 'validated': 'validated', 'rejected': 'rejected'}
        notify_admins(
            'admin_status',
            f'{request.user.username} {admin_label[new_status]} "{idea.title}".',
            related_id=idea.id,
        )

    return Response(IdeaSerializer(idea).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_ideas(request):
    ideas = Idea.objects.filter(owner=request.user).order_by('-created_at')
    return Response(IdeaSerializer(ideas, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_idea(request):
    """Submit idea for review"""
    idea_id = request.data.get('idea_id')
    try:
        idea = Idea.objects.get(id=idea_id, owner=request.user)
        old_status = idea.status
        idea.status = 'submitted'
        idea.save()
        if old_status != 'submitted':
            from notifications.utils import notify_admins
            notify_admins(
                'admin_new_idea',
                f'New idea "{idea.title}" was submitted by {idea.owner.username}.',
                related_id=idea.id,
            )
        return Response({
            'message': 'Idea submitted successfully',
            'idea': IdeaSerializer(idea).data
        })
    except Idea.DoesNotExist:
        return Response(
            {'error': 'Idea not found or unauthorized'},
            status=status.HTTP_404_NOT_FOUND
        )


class IdeaVersionListView(generics.ListCreateAPIView):
    """List versions of an idea"""
    serializer_class = IdeaVersionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        idea_id = self.kwargs.get('idea_id')
        return IdeaVersion.objects.filter(idea_id=idea_id).order_by('-version_number')

    def perform_create(self, serializer):
        """Create new version"""
        idea_id = self.kwargs.get('idea_id')
        idea = get_object_or_404(Idea, id=idea_id, owner=self.request.user)
        
        latest_version = IdeaVersion.objects.filter(idea=idea).order_by('-version_number').first()
        version_number = (latest_version.version_number + 1) if latest_version else 1
        
        serializer.save(idea=idea, version_number=version_number)
