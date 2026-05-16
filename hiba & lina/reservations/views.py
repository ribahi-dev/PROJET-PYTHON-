from django.views.generic import ListView, DetailView, CreateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
from django.urls import reverse_lazy
from django.shortcuts import redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Reservation
from activities.models import Activite

class ReservationListView(LoginRequiredMixin, ListView):
    model               = Reservation
    template_name       = 'reservations/list.html'
    context_object_name = 'reservations'

    def get_queryset(self):
        return Reservation.objects.filter(user=self.request.user)

class ReservationDetailView(LoginRequiredMixin, DetailView):
    model               = Reservation
    template_name       = 'reservations/detail.html'
    context_object_name = 'reservation'

class ReservationCreateView(LoginRequiredMixin, CreateView):
    model         = Reservation
    template_name = 'reservations/create.html'
    fields        = ['activite','date_reservation','nombre_personnes']
    success_url   = reverse_lazy('reservations:reservation-list')

    def form_valid(self, form):
        form.instance.user = self.request.user
        response = super().form_valid(form)
        
        # Create ticket for the reservation
        from tickets.models import Ticket
        Ticket.objects.get_or_create(reservation=self.object)
        
        messages.success(self.request, '✅ Réservation confirmée ! Ticket disponible.')
        return response

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['activites'] = Activite.objects.filter(disponible=True)
        return context

@login_required
def reservation_cancel(request, pk):
    r = get_object_or_404(Reservation, pk=pk, user=request.user)
    if request.method == 'POST':
        r.statut = 'annulee'
        r.save()
        messages.info(request, 'Réservation annulée.')
    return redirect('reservations:reservation-list')
