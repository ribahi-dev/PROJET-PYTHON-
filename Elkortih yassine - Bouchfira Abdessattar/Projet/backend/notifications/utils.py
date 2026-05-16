from notifications.models import Notification


def notify(user, notif_type, message, related_id=None):
    if not user:
        return
    try:
        Notification.objects.create(
            user=user,
            notif_type=notif_type,
            message=message,
            related_id=str(related_id) if related_id else None,
        )
    except Exception:
        pass


def notify_admins(notif_type, message, related_id=None, exclude_user=None):
    from accounts.models import User

    admins = User.objects.filter(role='admin', is_active=True)
    if exclude_user:
        admins = admins.exclude(id=exclude_user.id)

    for admin in admins:
        notify(admin, notif_type, message, related_id)
