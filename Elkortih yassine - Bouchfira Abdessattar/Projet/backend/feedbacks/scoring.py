"""
scoring.py — Algorithme SGV (Score Global de Validation)

Formule :
    SGV = Σ(raw_score × coeff_reviewer) / Σ(coeff_reviewer)

Coefficients selon le niveau de réputation du reviewer :
    Bronze : 1.0  (0-49 pts)
    Silver : 1.2  (50-149 pts)
    Gold   : 1.5  (150-299 pts)
    Expert : 2.0  (300+ pts)

SGV ≥ 70 → idée passe au statut "promising"
"""

import logging
from .models import Feedback

logger = logging.getLogger(__name__)

COEFFICIENTS = {
    'bronze': 1.0,
    'silver': 1.2,
    'gold':   1.5,
    'expert': 2.0,
}


def calculate_sgv(idea_id):
    """
    Calcule et met à jour le SGV d'une idée.
    Appelé via tâche Celery après chaque feedback.

    Returns:
        float: le nouveau SGV (0.0 si aucun feedback)
    """
    from ideas.models import Idea, SGVHistory

    try:
        feedbacks = (
            Feedback.objects
            .filter(idea_id=idea_id)
            .select_related('reviewer__profile')
        )

        if not feedbacks.exists():
            # Remettre le score à 0 si tous les feedbacks sont supprimés
            Idea.objects.filter(id=idea_id).update(global_score=0.0)
            return 0.0

        total_weighted = 0.0
        total_coeff    = 0.0

        for feedback in feedbacks:
            # Récupérer le niveau du reviewer
            try:
                level = feedback.reviewer.profile.level
            except Exception:
                level = 'bronze'

            coeff           = COEFFICIENTS.get(level, 1.0)
            raw             = feedback.raw_score  # max 100
            weighted        = raw * coeff

            total_weighted += weighted
            total_coeff    += coeff

            # Mettre à jour le weighted_score du feedback
            if feedback.weighted_score != weighted:
                feedback.weighted_score = weighted
                feedback.save(update_fields=['weighted_score'])

        # Calcul du SGV norma
        sgv = round(total_weighted / total_coeff, 2) if total_coeff > 0 else 0.0

        
        idea = Idea.objects.get(id=idea_id)
        idea.global_score = sgv

        # Seuil 70 → statut "promising"
        if sgv >= 70 and idea.status == 'validating':
            idea.status = 'promising'
            logger.info(f"Idée '{idea.title}' promue au statut 'promising' (SGV={sgv})")
            # Déclencher la notification via signal
            _notify_idea_promoted(idea)

        idea.save(update_fields=['global_score', 'status'])

        # Sauvegarder l'historique SGV
        SGVHistory.objects.create(
            idea=idea,
            score=sgv,
            feedback_count=feedbacks.count(),
        )

        logger.info(f"SGV recalculé pour '{idea.title}': {sgv}")
        return sgv

    except Exception as e:
        logger.error(f"Erreur lors du calcul SGV pour idea_id={idea_id}: {e}")
        return 0.0


def recalculate_reviewer_feedbacks(reviewer):
    """
    Recalcule tous les weighted_scores d'un reviewer
    quand son niveau de réputation change.
    Puis retrigger le SGV de toutes les idées concernées.
    """
    feedbacks = (
        Feedback.objects
        .filter(reviewer=reviewer)
        .select_related('idea')
    )

    idea_ids = set()
    for feedback in feedbacks:
        feedback.calculate_weighted_score()
        idea_ids.add(str(feedback.idea_id))

    # Retrigger SGV pour toutes les idées concernées
    from .tasks import recalculate_sgv_task
    for idea_id in idea_ids:
        recalculate_sgv_task.delay(idea_id)

    logger.info(f"Recalcul SGV déclenché pour {len(idea_ids)} idées après changement de niveau de {reviewer.username}")


def _notify_idea_promoted(idea):
    """Crée une notification quand une idée passe à 'promising'."""
    try:
        from notifications.models import Notification
        Notification.objects.create(
            user=idea.owner,
            notif_type='idea_promoted',
            message=f"Félicitations ! Votre idée '{idea.title}' a atteint un SGV ≥ 70 et est maintenant Prometteuse !",
            related_id=str(idea.id),
        )
    except Exception as e:
        logger.error(f"Erreur notification idea_promoted: {e}")