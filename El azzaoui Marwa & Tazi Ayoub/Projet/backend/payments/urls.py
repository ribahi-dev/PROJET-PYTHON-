from django.urls import path
from .views import (
    get_payments,
    create_payment,
    check_payment,
    get_user_payments,
    create_payment_for_coach,
    get_my_coaches,
)

urlpatterns = [
    # NOUVEAU: Endpoints coaching
    path('create-coach-session/', create_payment_for_coach),  # POST /api/payments/create-coach-session/
    path('my-coaches/', get_my_coaches),  # GET /api/payments/my-coaches/
    
    # Endpoints existants (programs)
    path('', get_payments),  # GET /api/payments/ - Liste tous les paiements
    path('create/', create_payment),  # POST /api/payments/create/ - Créer un paiement
    path('check/<int:program_id>/', check_payment),  # GET /api/payments/check/<id>/ - Vérifier achat
    path('my/', get_user_payments),  # GET /api/payments/my/ - Paiements de l'utilisateur
    path('my_payments/', get_user_payments),  # GET /api/payments/my_payments/ - Alias
]