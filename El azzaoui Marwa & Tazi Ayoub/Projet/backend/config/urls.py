from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter

from programs.views import ProgramViewSet, ProgressViewSet
from users.views import UserViewSet
from coaching.views import CoachViewSet, SubscriptionViewSet, MessageViewSet, AppointmentViewSet

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Import pour Swagger
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

router = DefaultRouter()
router.register(r'programs', ProgramViewSet, basename='programs')
router.register(r'users', UserViewSet, basename='users')
router.register(r'coaches', CoachViewSet, basename='coaches')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscriptions')
router.register(r'messages', MessageViewSet, basename='messages')
router.register(r'appointments', AppointmentViewSet, basename='appointments')
router.register(r'progress', ProgressViewSet, basename='progress')

urlpatterns = [
    path('admin/', admin.site.urls),

    # API routes
    path('api/', include(router.urls)),

    # User auth (register, etc.)
    path('api/', include('users.urls')),

    # payments
    path('api/payments/', include('payments.urls')),

    # JWT auth
    path('api/token/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),

    # Swagger/OpenAPI documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
