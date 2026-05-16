"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from .views import root_view

urlpatterns = [
    path('', root_view, name='root'),
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/bookmarks/', include('bookmarks.urls')),
    path('api/chatbot/', include('chatbot.urls')),
    path('api/comments/', include('comments.urls')),
    path('api/feedbacks/', include('feedbacks.urls')),
    path('api/ideas/', include('ideas.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/export/', include('export.urls')),
    path('api/search/', include('search.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
