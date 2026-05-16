from rest_framework import serializers
from .models import Feedback


class FeedbackSerializer(serializers.ModelSerializer):
    reviewer_username = serializers.CharField(source='reviewer.username', read_only=True)
    idea_title        = serializers.CharField(source='idea.title', read_only=True)
    idea_owner_username = serializers.CharField(source='idea.owner.username', read_only=True)
    reviewer_level    = serializers.SerializerMethodField()
    raw_score         = serializers.IntegerField(read_only=True)
    can_edit          = serializers.SerializerMethodField()

    class Meta:
        model  = Feedback
        fields = [
            'id', 'idea', 'idea_title', 'idea_owner_username',
            'reviewer_username', 'reviewer_level',
            'market_score', 'innovation_score', 'feasibility_score', 'roi_score',
            'raw_score', 'weighted_score', 'comment',
            'is_helpful', 'can_edit',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'reviewer_username', 'reviewer_level',
            'raw_score', 'weighted_score', 'is_helpful',
            'created_at', 'updated_at',
        ]

    def get_reviewer_level(self, obj):
        try:
            return obj.reviewer.userprofile.level
        except Exception:
            return 'Bronze'

    def get_can_edit(self, obj):
        return obj.can_edit()

    def validate_comment(self, value):
        if len(value.strip()) < 50:
            raise serializers.ValidationError("Comment must be at least 50 characters.")
        return value

    def validate(self, attrs):
        request = self.context.get('request')
        if self.instance is None:
            idea     = attrs.get('idea')
            reviewer = request.user if request else None
            if reviewer and Feedback.objects.filter(idea=idea, reviewer=reviewer).exists():
                raise serializers.ValidationError("You already submitted feedback for this idea.")
        if self.instance is not None and not self.instance.can_edit():
            raise serializers.ValidationError("The 24h edit window has passed.")
        return attrs

    def create(self, validated_data):
        reviewer = self.context['request'].user
        # Calculate weighted score synchronously (no Celery needed)
        scores = [
            validated_data.get('market_score', 0),
            validated_data.get('innovation_score', 0),
            validated_data.get('feasibility_score', 0),
            validated_data.get('roi_score', 0),
        ]
        weighted = sum(scores) / 4
        feedback = Feedback.objects.create(
            reviewer=reviewer,
            weighted_score=weighted,
            **validated_data
        )
        # Update idea global score synchronously
        self._recalculate_sgv(feedback.idea)
        # Send notification synchronously
        self._notify(feedback)
        # Reward reviewer reputation
        self._reward_reviewer(reviewer)
        return feedback

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        scores = [instance.market_score, instance.innovation_score,
                  instance.feasibility_score, instance.roi_score]
        instance.weighted_score = sum(scores) / 4
        instance.save()
        self._recalculate_sgv(instance.idea)
        return instance

    def _recalculate_sgv(self, idea):
        try:
            from .models import Feedback as F
            feedbacks = F.objects.filter(idea=idea)
            if feedbacks.exists():
                avg = sum(f.weighted_score for f in feedbacks) / feedbacks.count()
                idea.global_score = round(avg, 2)
                idea.save(update_fields=['global_score'])
        except Exception:
            pass

    def _notify(self, feedback):
        try:
            from notifications.models import Notification
            Notification.objects.create(
                user=feedback.idea.owner,
                notif_type='new_feedback',
                message=f"{feedback.reviewer.username} reviewed your idea '{feedback.idea.title}' — score: {round(feedback.weighted_score, 1)}/25.",
                related_id=str(feedback.idea.id),
            )
        except Exception:
            pass

    def _reward_reviewer(self, reviewer):
        try:
            from accounts.reputation import add_reputation
            add_reputation(reviewer, 2, "Feedback submitted")
        except Exception:
            pass
