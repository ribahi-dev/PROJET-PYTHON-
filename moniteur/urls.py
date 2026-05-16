from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.moniteur_dashboard_view, name='moniteur_dashboard'),
    path('planning/', views.moniteur_planning_view, name='moniteur_planning'),
    path('presences/', views.moniteur_presences_view, name='moniteur_presences'),
    path('presences/<int:planning_id>/', views.moniteur_presences_view, name='moniteur_presences_detail'),
    path('presences/<int:planning_id>/<int:client_id>/<str:statut>/', views.marquer_presence_view, name='marquer_presence'),
    path('tickets/', views.moniteur_tickets_view, name='moniteur_tickets'),
    path('tickets/valider/<int:ticket_id>/', views.valider_ticket_view, name='valider_ticket'),
]
