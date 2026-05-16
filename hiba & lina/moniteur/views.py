from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
from activities.models import Activite
from reservations.models import Reservation
from tickets.models import Ticket
from admin_app.models import Planning, Presence
from .models import AssignationMoniteur

User = get_user_model()

@login_required
def moniteur_dashboard_view(request):
    if request.user.role not in ['admin', 'moniteur']:
        messages.error(request, "Accès réservé aux moniteurs.")
        return redirect('home')
    
    JOURS_FR = {
        'monday': 'lundi',
        'tuesday': 'mardi',
        'wednesday': 'mercredi',
        'thursday': 'jeudi',
        'friday': 'vendredi',
        'saturday': 'samedi',
        'sunday': 'dimanche',
    }
    
    # Si admin, il peut voir tous les plannings, sinon seulement les siens
    if request.user.role == 'admin':
        plannings_du_jour = Planning.objects.filter(
            jour=JOURS_FR.get(timezone.now().strftime('%A').lower(), '')
        ).select_related('moniteur', 'activite')
    else:
        plannings_du_jour = Planning.objects.filter(
            moniteur=request.user,
            jour=JOURS_FR.get(timezone.now().strftime('%A').lower(), '')
        ).select_related('activite')
    
    # Nombre total de participants pour aujourd'hui
    total_participants = sum(
        Reservation.objects.filter(activite=planning.activite).count()
        for planning in plannings_du_jour
    )
    
    # Activités assignées
    if request.user.role == 'admin':
        activites_assignees = Activite.objects.all()
    else:
        activites_assignees = Activite.objects.filter(
            Q(planning__moniteur=request.user) | 
            Q(assignationmoniteur__moniteur=request.user)
        ).distinct()
    
    context = {
        'plannings_du_jour': plannings_du_jour,
        'total_participants': total_participants,
        'activites_assignees': activites_assignees,
        'user_role': request.user.role,
    }
    return render(request, 'moniteur/dashboard.html', context)

@login_required
def moniteur_planning_view(request):
    if request.user.role not in ['admin', 'moniteur']:
        messages.error(request, "Accès réservé aux moniteurs.")
        return redirect('home')
    
    if request.method == 'POST':
        print("POST reçu:", request.POST)  # debug
        try:
            from activities.models import Activite
            from admin_app.models import Planning
            
            activite_id        = request.POST.get('activite')
            heure_debut        = request.POST.get('heure_debut')
            heure_fin          = request.POST.get('heure_fin')
            jour               = request.POST.get('jour')
            places_disponibles = request.POST.get(
                                   'places_disponibles', 10)

            print(f"activite={activite_id} jour={jour}")

            activite = Activite.objects.get(pk=activite_id)

            # Convertir jour majuscule → minuscule pour le modèle
            jour_mapping = {
                'Lundi': 'lundi', 'Mardi': 'mardi',
                'Mercredi': 'mercredi', 'Jeudi': 'jeudi',
                'Vendredi': 'vendredi', 'Samedi': 'samedi',
                'Dimanche': 'dimanche'
            }
            jour_model = jour_mapping.get(jour, 'lundi')

            p = Planning(
                moniteur           = request.user,
                activite           = activite,
                jour               = jour_model,
                heure_debut        = heure_debut,
                heure_fin          = heure_fin,
                places_disponibles = int(places_disponibles),
            )

            p.save()
            print("Planning sauvegardé !")
            messages.success(request,
                '✅ Séance ajoutée avec succès !')

        except Exception as e:
            print(f"ERREUR: {e}")
            messages.error(request, f'Erreur : {str(e)}')

        return redirect('moniteur_planning')

    from admin_app.models import Planning
    plannings = Planning.objects.filter(
                  moniteur=request.user
                ).order_by('jour', 'heure_debut')
    from activities.models import Activite
    activites = Activite.objects.filter(disponible=True)

    return render(request, 'moniteur/planning.html', {
        'plannings' : plannings,
        'activites' : activites,
    })

@login_required
def moniteur_presences_view(request, planning_id=None):
    if request.user.role not in ['admin', 'moniteur']:
        messages.error(request, "Accès réservé aux moniteurs.")
        return redirect('home')

    from admin_app.models import Planning

    plannings = Planning.objects.filter(
        moniteur=request.user
    ).select_related('activite').order_by('jour', 'heure_debut')

    planning_selectionne = None
    reservations = []

    if planning_id:
        try:
            planning_selectionne = Planning.objects.select_related(
                'activite'
            ).get(id=planning_id, moniteur=request.user)

            reservations = Reservation.objects.filter(
                activite=planning_selectionne.activite
            ).select_related('user').order_by('user__last_name')

        except Planning.DoesNotExist:
            messages.error(request, "Planning introuvable.")
            return redirect('moniteur_presences')

    context = {
        'plannings': plannings,
        'planning_selectionne': planning_selectionne,
        'reservations': reservations,
        'planning_id': planning_id,
    }
    return render(request, 'moniteur/presences.html', context)

@login_required
def marquer_presence_view(request, planning_id, client_id, statut):
    if request.user.role not in ['admin', 'moniteur']:
        messages.error(request, "Accès réservé aux moniteurs.")
        return redirect('home')
    
    from admin_app.models import Planning
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    try:
        planning = Planning.objects.get(id=planning_id)
        client = User.objects.get(id=client_id)
        
        presence, created = Presence.objects.get_or_create(
            planning=planning,
            client=client,
            defaults={'statut': statut}
        )
        
        if not created:
            presence.statut = statut
            presence.save()
        
        if statut == 'present':
            messages.success(request, f"✅ {client.get_full_name() or client.username} marqué présent.")
        else:
            messages.warning(request, f"❌ {client.get_full_name() or client.username} marqué absent.")
            
    except Exception as e:
        messages.error(request, f"Erreur : {str(e)}")
    
    return redirect('moniteur_presences_detail', planning_id=planning_id)
    
    if request.user.role == 'moniteur' and planning.moniteur != request.user:
        messages.error(request, "Vous n'êtes pas assigné à cette séance.")
        return redirect('moniteur_planning')
    
    # Créer ou mettre à jour la présence
    presence, created = Presence.objects.update_or_create(
        planning=planning,
        user=client,
        defaults={'statut': statut}
    )
    
    messages.success(request, f"Présence marquée pour {client.username}")
    return redirect('moniteur_presences', planning_id=planning_id)

@login_required
def moniteur_tickets_view(request):
    from tickets.models import Ticket
    tickets = Ticket.objects.all(
    ).select_related(
        'reservation__user',
        'reservation__activite'
    ).order_by('-created_at')
    return render(request,
                  'moniteur/tickets.html',
                  {'tickets': tickets})

@login_required
def valider_ticket_view(request, ticket_id):
    if request.user.role not in ['admin', 'moniteur']:
        messages.error(request, "Accès réservé aux moniteurs.")
        return redirect('home')
    
    ticket = get_object_or_404(Ticket, id=ticket_id)
    
    # Vérifier que le moniteur est bien assigné à cette activité
    if request.user.role == 'moniteur':
        if not ticket.reservation.activite.planning.filter(moniteur=request.user).exists():
            messages.error(request, "Vous n'êtes pas assigné à cette activité.")
            return redirect('moniteur_tickets')
    
    if ticket.statut == 'utilise':
        messages.warning(request, "Ce ticket a déjà été utilisé.")
    else:
        ticket.statut = 'utilise'
        ticket.utilise_le = timezone.now()
        ticket.save()
        messages.success(request, f"Ticket {ticket.qr_code} validé avec succès!")
    
    return redirect('moniteur_tickets')
