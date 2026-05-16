from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.CategoryListView.as_view(), name='category_list'),
    path('categories/<int:pk>/', views.CategoryDetailView.as_view(), name='category_detail'),
    path('trending/', views.trending_ideas, name='trending_ideas'),
    path('recommended/', views.recommended_ideas, name='recommended_ideas'),
    path('review-queue/', views.review_queue, name='review_queue'),
    path('', views.IdeaListView.as_view(), name='idea_list'),
    path('<int:pk>/', views.IdeaDetailView.as_view(), name='idea_detail'),
    path('<int:pk>/status/', views.change_idea_status, name='change_idea_status'),
    path('my-ideas/', views.my_ideas, name='my_ideas'),
    path('submit/', views.submit_idea, name='submit_idea'),
    path('<int:idea_id>/versions/', views.IdeaVersionListView.as_view(), name='idea_versions'),
]
