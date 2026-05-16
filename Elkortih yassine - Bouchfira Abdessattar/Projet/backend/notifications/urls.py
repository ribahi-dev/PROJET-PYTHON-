from django.urls import path
from .views import NotificationListView, mark_all_read, mark_one_read

urlpatterns = [
    path('',                   NotificationListView.as_view(), name='notification-list'),
    path('read-all/',          mark_all_read,                  name='notification-read-all'),
    path('<uuid:pk>/read/',    mark_one_read,                  name='notification-read-one'),
]