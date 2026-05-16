from django.urls import path
from .views import FeedbackListCreateView, FeedbackDetailView, FeedbackHelpfulView

urlpatterns = [
    path('',                    FeedbackListCreateView.as_view(), name='feedback-list'),
    path('<uuid:pk>/',          FeedbackDetailView.as_view(),     name='feedback-detail'),
    path('<uuid:pk>/helpful/',  FeedbackHelpfulView.as_view(),    name='feedback-helpful'),
]