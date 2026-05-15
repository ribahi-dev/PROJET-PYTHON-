from django.core.management.base import BaseCommand

from sris.demo_seed import seed_demo_data


class Command(BaseCommand):
    help = 'Charge les donnees de demonstration EMSI pour la plateforme.'

    def handle(self, *args, **options):
        result = seed_demo_data()
        self.stdout.write(self.style.SUCCESS('Base de demonstration initialisee avec succes.'))
        self.stdout.write(f"Nombre de salles chargees: {result['rooms_count']}")
        self.stdout.write('Comptes:')
        for account in result['accounts']:
            self.stdout.write(f'  - {account}')
