from django.urls import path
from django.contrib.auth.views import LogoutView
from . import views

urlpatterns = [
    path('signup/', views.SignupView.as_view(),      name='signup'),
    path('login/',  views.CustomLoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(next_page='login'), name='logout'),
    # URLs Admin
    path('admin/dashboard/', views.admin_dashboard_view, name='admin_dashboard'),
    # URLs Moniteur
    path('moniteur/dashboard/', views.moniteur_dashboard_view, name='moniteur_dashboard'),
    # API URLs
    path('api/users/<int:user_id>/', views.user_detail_api, name='user-detail-api'),
    path('api/users/<int:user_id>/update/', views.user_update_api, name='user-update-api'),
]
