from django.contrib import admin
from django.urls import path, include
from api.views import UserCreateView, MyTokenObtainPairView
# Pre-built views for JWT authentication
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/user/register/', UserCreateView.as_view(), name='register'),
    path('api/token/', MyTokenObtainPairView.as_view(), name='get_token'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='refresh_token'),
    # Include the default authentication URLs provided by DRF
    path('api-auth/', include('rest_framework.urls')),
    path('api/', include('api.urls')),
]
