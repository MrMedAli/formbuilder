from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'forms', views.FormViewSet)
router.register(r'presets', views.PresetViewSet)
router.register(r'responses', views.FormResponseViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/register/', views.RegisterView.as_view(), name='register'),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('api/auth/logout/', views.logout_view, name='logout'),
    path('api/forms/<int:pk>/', views.get_form, name='get_form'),
    path('api/forms/<int:pk>/submit/', views.submit_form_response, name='submit_form_response'),
    path('accounts/', include('allauth.urls')),
]
