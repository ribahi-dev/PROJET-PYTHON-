from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.views.generic import CreateView
from django.urls import reverse_lazy
from django.contrib.auth.views import LoginView, LogoutView
from .forms import CustomUserCreationForm
from .models import CustomUser
from activities.models import Activite
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import logging

# Configure logging
logger = logging.getLogger(__name__)

class SignupView(CreateView):
    form_class    = CustomUserCreationForm
    template_name = 'users/signup.html'
    success_url   = reverse_lazy('login')

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect('home')
        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        messages.success(self.request, '✅ Compte créé ! Connectez-vous.')
        return super().form_valid(form)

class CustomLoginView(LoginView):
    template_name = 'users/login.html'

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect('home')
        return super().dispatch(request, *args, **kwargs)

class CustomLogoutView(LogoutView):
    next_page = reverse_lazy('login')

def home_view(request):
    if request.user.is_authenticated:
        if request.user.role == 'admin':
            return redirect('admin_dashboard')
        elif request.user.role == 'moniteur':
            return redirect('moniteur_dashboard')
    
    activites = Activite.objects.filter(disponible=True)[:3]
    return render(request, 'home.html', {'activites_populaires': activites})

# Vues Admin
@login_required
def admin_dashboard_view(request):
    if request.user.role != 'admin':
        messages.error(request, "Accès réservé aux administrateurs.")
        return redirect('home')
    
    # Statistiques
    total_clients = CustomUser.objects.filter(role='client').count()
    total_moniteurs = CustomUser.objects.filter(role='moniteur').count()
    
    context = {
        'total_clients': total_clients,
        'total_moniteurs': total_moniteurs,
    }
    return render(request, 'admin/dashboard.html', context)

# Vues Moniteur
@login_required
def moniteur_dashboard_view(request):
    if request.user.role not in ['admin', 'moniteur']:
        messages.error(request, "Accès réservé aux moniteurs.")
        return redirect('home')
    
    context = {
        'user': request.user,
    }
    return render(request, 'moniteur/dashboard.html', context)

# API Endpoints
@csrf_exempt
@login_required
def user_detail_api(request, user_id):
    """
    API endpoint pour récupérer les détails d'un utilisateur
    """
    logger.info(f"User detail requested for user_id={user_id} by user {request.user.username}")
    
    if request.user.role != 'admin':
        logger.warning(f"Permission denied for user {request.user.username} - not admin")
        return JsonResponse({'error': 'Permission denied'}, status=403)
    
    try:
        user = get_object_or_404(CustomUser, pk=user_id)
        logger.info(f"User found: {user.username}")
        
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'date_joined': user.date_joined.isoformat() if user.date_joined else None,
            'is_active': user.is_active
        }
        
        logger.info(f"User data prepared: {user_data}")
        return JsonResponse(user_data, status=200)
        
    except Exception as e:
        logger.error(f"Error in user_detail_api: {str(e)}", exc_info=True)
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@login_required
def user_update_api(request, user_id):
    """
    API endpoint pour mettre à jour un utilisateur
    """
    logger.info(f"User update requested for user_id={user_id} by user {request.user.username}")
    
    if request.user.role != 'admin':
        logger.warning(f"Permission denied for user {request.user.username} - not admin")
        return JsonResponse({'error': 'Permission denied'}, status=403)
    
    if request.method != 'PUT':
        logger.warning(f"Wrong method: {request.method}, expected PUT")
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        user = get_object_or_404(CustomUser, pk=user_id)
        logger.info(f"User found: {user.username}")
        
        # Parse PUT data
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            logger.error("Invalid JSON data")
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        
        # Update user fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'email' in data:
            user.email = data['email']
        if 'role' in data:
            user.role = data['role']
        if 'is_active' in data:
            user.is_active = data['is_active']
        
        user.save()
        logger.info(f"User updated successfully: {user.username}")
        
        return JsonResponse({
            'message': 'Utilisateur mis à jour avec succès',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'is_active': user.is_active
            }
        }, status=200)
        
    except Exception as e:
        logger.error(f"Error in user_update_api: {str(e)}", exc_info=True)
        return JsonResponse({'error': str(e)}, status=400)
