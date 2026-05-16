from django.urls import path
from . import views

app_name = 'activities'

urlpatterns = [
    path('',
         views.ActiviteListView.as_view(),
         name='activite-list'),
    path('<int:pk>/',
         views.ActiviteDetailView.as_view(),
         name='activite-detail'),
    path('<int:pk>/update/',
         views.ActiviteUpdateView.as_view(),
         name='activite-update'),
    path('<int:pk>/delete/',
         views.activite_delete,
         name='activite-delete'),
]
