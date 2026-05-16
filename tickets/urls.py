from django.urls import path
from . import views

app_name = 'tickets'

urlpatterns = [
    path('',
         views.TicketListView.as_view(),
         name='ticket-list'),
    path('<int:pk>/',
         views.TicketDetailView.as_view(),
         name='ticket-detail'),
]
