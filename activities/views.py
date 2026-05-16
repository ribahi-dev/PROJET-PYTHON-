from django.views.generic import ListView, DetailView, UpdateView
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, get_object_or_404
from django.contrib import messages
from .models import Activite

class ActiviteListView(ListView):
    model               = Activite
    template_name       = 'activities/list.html'
    context_object_name = 'activites'
    paginate_by         = 6

    def get_queryset(self):
        queryset  = Activite.objects.filter(disponible=True)
        categorie = self.request.GET.get('categorie')
        if categorie:
            queryset = queryset.filter(categorie=categorie)
        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categories']       = Activite.CATEGORIE_CHOICES
        context['categorie_active'] = self.request.GET.get('categorie','')
        return context

class ActiviteDetailView(DetailView):
    model               = Activite
    template_name       = 'activities/detail.html'
    context_object_name = 'activite'

class ActiviteUpdateView(UpdateView):
    model = Activite
    template_name = 'activities/update.html'
    fields = ['nom', 'description', 'categorie', 'prix', 'duree', 'places_max', 'disponible']
    
    def get_success_url(self):
        return '/admin/activities/'
    
    def form_valid(self, form):
        messages.success(self.request, '✅ Activité mise à jour avec succès !')
        return super().form_valid(form)
    
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated or request.user.role != 'admin':
            return redirect('home')
        return super().dispatch(request, *args, **kwargs)

@login_required
def activite_delete(request, pk):
    if request.user.role != 'admin':
        return redirect('home')
    activite = get_object_or_404(Activite, pk=pk)
    if request.method == 'POST':
        activite.delete()
        messages.success(request, '✅ Activité supprimée avec succès !')
    return redirect('admin_app:activities')
