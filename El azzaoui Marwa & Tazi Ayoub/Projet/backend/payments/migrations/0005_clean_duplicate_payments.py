# Generated manually to clean duplicate payments before adding unique constraint

from django.db import migrations


def clean_duplicate_payments(apps, schema_editor):
    """
    Garde seulement le dernier paiement (complété) pour chaque (user, program).
    Supprime les doublons.
    """
    Payment = apps.get_model('payments', 'Payment')
    
    # Récupérer tous les paiements complétés
    payments = Payment.objects.filter(status='completed').order_by('user', 'program', '-date')
    
    seen = set()
    to_delete = []
    
    for payment in payments:
        key = (payment.user_id, payment.program_id)
        if key in seen:
            # Doublon détecté - le marquer pour suppression
            to_delete.append(payment.id)
        else:
            # Premier paiement pour cette (user, program) - le garder
            seen.add(key)
    
    # Supprimer les doublons
    if to_delete:
        Payment.objects.filter(id__in=to_delete).delete()


def reverse_clean(apps, schema_editor):
    # Cette opération est irréversible (suppression de données)
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0004_alter_payment_id'),
    ]

    operations = [
        migrations.RunPython(clean_duplicate_payments, reverse_clean),
    ]
