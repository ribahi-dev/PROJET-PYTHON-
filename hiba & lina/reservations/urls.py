from django.urls import path
from . import views

app_name = 'reservations'

urlpatterns = [
    path('',
         views.ReservationListView.as_view(),
         name='reservation-list'),
    path('create/',
         views.ReservationCreateView.as_view(),
         name='reservation-create'),
    path('<int:pk>/',
         views.ReservationDetailView.as_view(),
         name='reservation-detail'),
    path('<int:pk>/cancel/',
         views.reservation_cancel,
         name='reservation-cancel'),
]
