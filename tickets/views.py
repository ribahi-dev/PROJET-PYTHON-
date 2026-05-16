from django.views.generic import ListView, DetailView
from django.contrib.auth.mixins import LoginRequiredMixin
from .models import Ticket

class TicketListView(LoginRequiredMixin, ListView):
    model               = Ticket
    template_name       = 'tickets/list.html'
    context_object_name = 'tickets'

    def get_queryset(self):
        return Ticket.objects.filter(
            reservation__user=self.request.user
        ).order_by('-created_at')

class TicketDetailView(LoginRequiredMixin, DetailView):
    model               = Ticket
    template_name       = 'tickets/detail.html'
    context_object_name = 'ticket'
