from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from activities.models import Activite
from users.models import CustomUser
from reservations.models import Reservation
from tickets.models import Ticket
import random

class Command(BaseCommand):
    help = 'Crée des données exemples pour tester le système'

    def handle(self, *args, **options):
        self.stdout.write('Création des données exemples...')
        
        # Créer des activités
        self.create_activities()
        
        # Créer des utilisateurs
        self.create_users()
        
        # Créer des réservations et tickets
        self.create_reservations()
        
        self.stdout.write(self.style.SUCCESS('Données exemples créées avec succès!'))

    def create_activities(self):
        activities_data = [
            {
                'nom': 'Cours d\'équitation débutant',
                'description': 'Cours parfait pour les débutants qui veulent découvrir l\'équitation. Apprenez les bases du montage, des allures et du soin du cheval.',
                'categorie': 'equitation',
                'prix': 495.00,
                'duree': '1h30',
                'places_max': 8,
                'disponible': True
            },
            {
                'nom': 'Balade à cheval en forêt',
                'description': 'Balade relaxante à travers les sentiers forestiers. Idéal pour tous niveaux avec vue panoramique sur la campagne.',
                'categorie': 'equitation',
                'prix': 385.00,
                'duree': '2h',
                'places_max': 6,
                'disponible': True
            },
            {
                'nom': 'Stage d\'équitation 3 jours',
                'description': 'Stage intensif de 3 jours pour progresser rapidement. Inclus cours, balades et théorie.',
                'categorie': 'stage',
                'prix': 2750.00,
                'duree': '3 jours',
                'places_max': 10,
                'disponible': True
            },
            {
                'nom': 'Sortie voile coucher de soleil',
                'description': 'Magnifique sortie en voile pour admirer le coucher de soleil sur la mer. Apéritif inclus.',
                'categorie': 'mer',
                'prix': 660.00,
                'duree': '3h',
                'places_max': 12,
                'disponible': True
            },
            {
                'nom': 'Initiation à la planche à voile',
                'description': 'Découvrez les bases de la planche à voile avec nos moniteurs qualifiés. Tout matériel fourni.',
                'categorie': 'mer',
                'prix': 605.00,
                'duree': '2h',
                'places_max': 8,
                'disponible': True
            },
            {
                'nom': 'Randonnée équestre complète',
                'description': 'Journée complète avec pique-nique en pleine nature. Niveau intermédiaire requis.',
                'categorie': 'equitation',
                'prix': 935.00,
                'duree': '6h',
                'places_max': 4,
                'disponible': True
            }
        ]
        
        for activity_data in activities_data:
            activity, created = Activite.objects.get_or_create(
                nom=activity_data['nom'],
                defaults=activity_data
            )
            if created:
                self.stdout.write(f'  ✅ Activité créée: {activity.nom}')

    def create_users(self):
        users_data = [
            {
                'username': 'jean_client',
                'email': 'jean@example.com',
                'role': 'client',
                'password': 'password123'
            },
            {
                'username': 'marie_moniteur',
                'email': 'marie@example.com',
                'role': 'moniteur',
                'password': 'password123'
            },
            {
                'username': 'admin_equiclub',
                'email': 'admin@example.com',
                'role': 'admin',
                'password': 'password123'
            }
        ]
        
        for user_data in users_data:
            user, created = CustomUser.objects.get_or_create(
                email=user_data['email'],
                defaults={
                    'username': user_data['username'],
                    'role': user_data['role'],
                    'is_staff': user_data['role'] == 'admin'
                }
            )
            if created:
                user.set_password(user_data['password'])
                user.save()
                self.stdout.write(f'  ✅ Utilisateur créé: {user.username} ({user.role})')

    def create_reservations(self):
        users = CustomUser.objects.filter(role='client')
        activities = Activite.objects.filter(disponible=True)
        
        if not users or not activities:
            self.stdout.write('  ⚠️  Pas d\'utilisateurs ou d\'activités disponibles pour les réservations')
            return
        
        # Créer quelques réservations
        for i in range(5):
            user = random.choice(users)
            activity = random.choice(activities)
            
            # Date aléatoire dans les 30 prochains jours
            date = timezone.now().date() + timedelta(days=random.randint(1, 30))
            
            reservation, created = Reservation.objects.get_or_create(
                user=user,
                activite=activity,
                date_reservation=date,
                defaults={
                    'nombre_personnes': random.randint(1, 4),
                    'statut': random.choice(['en_attente', 'confirmee', 'annulee'])
                }
            )
            
            if created:
                self.stdout.write(f'  ✅ Réservation créée: {reservation}')
                
                # Créer un ticket si la réservation est confirmée
                if reservation.statut == 'confirmee':
                    ticket, ticket_created = Ticket.objects.get_or_create(
                        reservation=reservation,
                        defaults={'statut': random.choice(['valide', 'utilise'])}
                    )
                    if ticket_created:
                        self.stdout.write(f'    🎫 Ticket créé: {ticket.code}')
                else:
                    self.stdout.write(f'  ⏸️  Réservation en attente/annulée: {reservation}')
