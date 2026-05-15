# Generated manually to add UniqueConstraint on (user, program) for completed payments

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0005_clean_duplicate_payments'),
    ]

    operations = [
        migrations.AddConstraint(
            model_name='payment',
            constraint=models.UniqueConstraint(
                condition=models.Q(('status', 'completed')),
                fields=('user', 'program'),
                name='unique_user_program_completed'
            ),
        ),
    ]
