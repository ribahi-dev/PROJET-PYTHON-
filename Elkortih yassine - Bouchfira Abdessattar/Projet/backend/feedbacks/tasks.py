"""
tasks.py — Tâches Celery asynchrones pour IdeaLab

Tâche principale :
    recalculate_sgv_task(idea_id) → appelée après chaque
    création, modification ou suppression d'un feedback.
"""

from celery import shared_task
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=5)
def recalculate_sgv_task(self, idea_id):
    """
    Tâche Celery : recalcule le SGV d'une idée de façon asynchrone.

    Args:
        idea_id (str): UUID de l'idée à recalculer

    Triggers:
        - Après création d'un feedback
        - Après modification d'un feedback
        - Après suppression d'un feedback
        - Après changement de niveau d'un reviewer
    """
    try:
        from .scoring import calculate_sgv
        sgv = calculate_sgv(idea_id)
        logger.info(f"[Celery] SGV recalculé pour idea={idea_id}: {sgv}")
        return sgv
    except Exception as exc:
        logger.error(f"[Celery] Erreur recalcul SGV idea={idea_id}: {exc}")
        raise self.retry(exc=exc)


@shared_task
def send_feedback_notification_task(feedback_id):
    """
    Tâche Celery : envoie une notification après un nouveau feedback.
    """
    try:
        from .models import Feedback
        from notifications.models import Notification

        feedback = Feedback.objects.select_related(
            'idea__owner', 'reviewer'
        ).get(id=feedback_id)

        Notification.objects.create(
            user=feedback.idea.owner,
            notif_type='new_feedback',
            message=f"{feedback.reviewer.username} a soumis un feedback sur votre idée '{feedback.idea.title}'.",
            related_id=str(feedback.idea.id),
        )
        logger.info(f"[Celery] Notification envoyée pour feedback={feedback_id}")
    except Exception as e:
        logger.error(f"[Celery] Erreur notification feedback={feedback_id}: {e}")