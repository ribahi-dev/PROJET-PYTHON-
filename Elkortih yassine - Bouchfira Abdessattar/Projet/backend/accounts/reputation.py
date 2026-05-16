from accounts.models import UserProfile, ReputationLog


def add_reputation(user, points, reason):
    """Add reputation points to a user and log it."""
    if user.role == 'admin':
        return

    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.reputation_score = (profile.reputation_score or 0) + points

    # Update level
    score = profile.reputation_score
    if score >= 300:
        profile.level = 'Expert'
    elif score >= 150:
        profile.level = 'Gold'
    elif score >= 50:
        profile.level = 'Silver'
    else:
        profile.level = 'Bronze'

    profile.save()
    ReputationLog.objects.create(user=user, points=points, reason=reason)
