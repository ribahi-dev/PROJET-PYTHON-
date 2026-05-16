from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import datetime, timedelta
from activities.models import Activite
from reservations.models import Reservation
from tickets.models import Ticket
from .models import Planning, Presence

User = get_user_model()

@login_required
def admin_dashboard_view(request):
    if request.user.role != 'admin':
        messages.error(request, "Accès réservé aux administrateurs.")
        return redirect('home')
    
    # Statistiques globales
    total_clients = User.objects.filter(role='client').count()
    total_moniteurs = User.objects.filter(role='moniteur').count()
    total_activites = Activite.objects.count()
    total_reservations = Reservation.objects.count()
    
    # Revenus estimés
    revenus_estimes = Reservation.objects.aggregate(
        total=Sum('activite__prix')
    )['total'] or 0
    
    # Activités les plus réservées
    activites_populaires = Activite.objects.annotate(
        nb_reservations=Count('reservations')
    ).order_by('-nb_reservations')[:5]
    
    # Réservations récentes
    reservations_recentes = Reservation.objects.select_related('user', 'activite').order_by('-created_at')[:5]
    
    context = {
        'total_clients': total_clients,
        'total_moniteurs': total_moniteurs,
        'total_activites': total_activites,
        'total_reservations': total_reservations,
        'revenus_estimes': revenus_estimes,
        'activites_populaires': activites_populaires,
        'reservations_recentes': reservations_recentes,
    }
    return render(request, 'admin/dashboard.html', context)

@login_required
def admin_activities_view(request):
    if request.user.role != 'admin':
        messages.error(request, "Accès réservé aux administrateurs.")
        return redirect('home')
    
    activites = Activite.objects.all().order_by('-created_at')
    return render(request, 'admin/activities.html', {'activites': activites})

@login_required
def admin_reservations_view(request):
    if request.user.role != 'admin':
        messages.error(request, "Accès réservé aux administrateurs.")
        return redirect('home')
    
    reservations = Reservation.objects.select_related('user', 'activite').all().order_by('-created_at')
    
    # Filtrage
    date_filter = request.GET.get('date')
    activite_filter = request.GET.get('activite')
    
    if date_filter:
        reservations = reservations.filter(created_at__date=date_filter)
    if activite_filter:
        reservations = reservations.filter(activite_id=activite_filter)
    
    activites = Activite.objects.all()
    context = {
        'reservations': reservations,
        'activites': activites,
    }
    return render(request, 'admin/reservations.html', context)

@login_required
def admin_tickets_view(request):
    if request.user.role != 'admin':
        messages.error(request, "Accès réservé aux administrateurs.")
        return redirect('home')
    
    tickets = Ticket.objects.select_related('reservation__user', 'reservation__activite').all().order_by('-created_at')
    return render(request, 'admin/tickets.html', {'tickets': tickets})

@login_required
def admin_users_view(request):
    if request.user.role != 'admin':
        messages.error(request, "Accès réservé aux administrateurs.")
        return redirect('home')
    
    users = User.objects.all().order_by('-date_joined')
    
    # Recherche
    search = request.GET.get('search')
    if search:
        users = users.filter(
            Q(username__icontains=search) |
            Q(email__icontains=search) |
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search)
        )
    
    return render(request, 'admin/users.html', {'users': users})

@login_required
def admin_monitors_view(request):
    if request.user.role != 'admin':
        messages.error(request, "Accès réservé aux administrateurs.")
        return redirect('home')
    
    moniteurs = User.objects.filter(role='moniteur').order_by('username')
    return render(request, 'admin/monitors.html', {'moniteurs': moniteurs})

@login_required
def admin_statistics_view(request):
    if request.user.role != 'admin':
        messages.error(request, "Accès réservé aux administrateurs.")
        return redirect('home')
    
    # Revenus par mois (6 derniers mois)
    six_mois_avant = timezone.now() - timedelta(days=180)
    revenus_mensuels = Reservation.objects.filter(
        created_at__gte=six_mois_avant
    ).extra(
        select={'month': 'strftime("%%Y-%%m", created_at)'}
    ).values('month').annotate(
        total=Sum('activite__prix'),
        count=Count('id')
    ).order_by('month')
    
    # Réservations par activité
    reservations_par_activite = Activite.objects.annotate(
        nb_reservations=Count('reservations'),
        revenus_total=Sum('reservations__activite__prix')
    ).order_by('-nb_reservations')
    
    # Taux de remplissage
    taux_remplissage = []
    for activite in Activite.objects.all():
        total_places = activite.places_max
        places_reservees = Reservation.objects.filter(activite=activite).count()
        taux = (places_reservees / total_places * 100) if total_places > 0 else 0
        taux_remplissage.append({
            'activite': activite,
            'taux': taux,
            'places_reservees': places_reservees,
            'total_places': total_places
        })
    
    context = {
        'revenus_mensuels': revenus_mensuels,
        'reservations_par_activite': reservations_par_activite,
        'taux_remplissage': taux_remplissage,
        'total_tickets': Ticket.objects.count(),
    }
    return render(request, 'admin/statistics.html', context)

@login_required
def reservation_confirm(request, pk):
    if request.user.role != 'admin':
        return redirect('home')
    if request.method == 'POST':
        reservation = get_object_or_404(Reservation, pk=pk)
        reservation.statut = 'confirmee'
        reservation.save()
        messages.success(request, '✅ Réservation confirmée !')
    return redirect('admin_app:reservations')

@login_required
def admin_activity_delete(request, pk):
    if request.user.role != 'admin':
        return redirect('home')
    activite = get_object_or_404(Activite, pk=pk)
    if request.method == 'POST':
        activite.delete()
        messages.success(request, '✅ Activité supprimée.')
    return redirect('admin_app:activities')

@login_required
def reservation_cancel(request, pk):
    if request.user.role != 'admin':
        return redirect('home')
    reservation = get_object_or_404(Reservation, pk=pk)
    if request.method == 'POST':
        reservation.statut = 'annulee'
        reservation.save()
        messages.info(request, '❌ Réservation annulée.')
    return redirect('admin_app:reservations')

@login_required
def ticket_validate(request, pk):
    if request.user.role != 'admin':
        return redirect('home')
    ticket = get_object_or_404(Ticket, pk=pk)
    if request.method == 'POST':
        ticket.statut = 'utilise'
        ticket.save()
        messages.success(request, '✅ Ticket validé !')
    return redirect('admin_app:tickets')

@login_required
def user_delete(request, pk):
    if request.user.role != 'admin':
        return redirect('home')
    user = get_object_or_404(User, pk=pk)
    if request.method == 'POST':
        user.delete()
        messages.success(request, '✅ Utilisateur supprimé.')
    return redirect('admin_app:users')

@login_required
def reservation_edit(request, pk):
    if request.user.role != 'admin':
        return redirect('home')
    reservation = get_object_or_404(Reservation, pk=pk)
    if request.method == 'POST':
        nouveau_statut = request.POST.get('statut')
        nouvelle_date  = request.POST.get('date_reservation')
        nb_personnes   = request.POST.get('nombre_personnes')
        if nouveau_statut:
            reservation.statut = nouveau_statut
        if nouvelle_date:
            reservation.date_reservation = nouvelle_date
        if nb_personnes:
            reservation.nombre_personnes = int(nb_personnes)
        reservation.save()
        messages.success(request, '✅ Réservation modifiée !')
        return redirect('admin_app:reservations')

    return render(request,
                  'admin/reservation_edit.html',
                  {'reservation': reservation})
