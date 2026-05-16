from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('token/refresh/', views.token_refresh, name='token_refresh'),
    path('me/', views.current_user, name='current_user'),
    path('me/update/', views.update_my_profile, name='update_my_profile'),
    path('users/', views.UserListView.as_view(), name='user_list'),
    path('users/<int:pk>/manage/', views.admin_update_user, name='admin_update_user'),
    path('users/<int:pk>/delete/', views.admin_delete_user, name='admin_delete_user'),
    path('users/<str:username>/', views.get_user_by_username, name='user_by_username'),
    path('profile/', views.UserProfileDetailView.as_view(), name='user_profile'),
    path('reputation/', views.ReputationLogListView.as_view(), name='reputation_logs'),
]
