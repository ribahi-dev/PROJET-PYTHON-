from django.urls import path
from . import views

urlpatterns = [
    path('entrepreneur/', views.entrepreneur_analytics, name='entrepreneur-analytics'),
    path('reviewer/', views.reviewer_analytics, name='reviewer-analytics'),
    path('admin/', views.admin_analytics, name='admin-analytics'),
]
