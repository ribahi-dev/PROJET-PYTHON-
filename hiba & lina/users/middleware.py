from django.shortcuts import redirect
from django.contrib import messages
from django.urls import reverse

class RoleMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_view(self, request, view_func, view_args, view_kwargs):
        if not request.user.is_authenticated:
            return None

        # URLs protégées par rôle
        admin_urls = ['/admin/', '/admin/dashboard', '/admin/activities', '/admin/reservations', 
                      '/admin/tickets', '/admin/users', '/admin/monitors', '/admin/statistics']
        
        moniteur_urls = ['/moniteur/', '/moniteur/dashboard', '/moniteur/planning', 
                        '/moniteur/presences', '/moniteur/tickets']

        current_path = request.path

        # Vérifier les accès admin
        if any(current_path.startswith(url) for url in admin_urls):
            if request.user.role != 'admin':
                messages.error(request, "Accès réservé aux administrateurs.")
                return redirect('home')

        # Vérifier les accès moniteur
        if any(current_path.startswith(url) for url in moniteur_urls):
            if request.user.role not in ['admin', 'moniteur']:
                messages.error(request, "Accès réservé aux moniteurs.")
                return redirect('home')

        return None
