from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from .serializers import MyTokenObtainPairView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Your existing router and view imports
from core import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'forms', views.FormViewSet)
router.register(r'presets', views.PresetViewSet)
router.register(r'responses', views.FormResponseViewSet)
router.register(r'formulaires',views.FormulaireViewSet)
router.register(r'form-responses', views.FormsResponseViewSet)
router.register(r'form-fields', views.FormFieldViewSet)

schema_view = get_schema_view(
    openapi.Info(
        title="Your API Title",
        default_version='v1',
        description="Your API description",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@yourapi.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/register/', views.RegisterView.as_view(), name='register'),
    path('api/auth/login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('api/auth/logout/', views.logout_view, name='logout'),
    path('api/forms/<int:pk>/', views.get_form, name='get_form'),
    path('api/auth/change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    path('responses/<int:response_id>/', views.delete_form_response, name='delete_form_response'),
    path('api/user-info/', views.user_info, name='user_info'),
    path('api/forms/<int:pk>/submit/', views.submit_form_response, name='submit_form_response'),
    path('accounts/', include('allauth.urls')),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
]
