from django.contrib import admin
from django.urls import path, include
from api.views import MyTokenObtainPairView
# Pre-built views for JWT authentication
from rest_framework_simplejwt.views import TokenRefreshView
from django.http import JsonResponse

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', MyTokenObtainPairView.as_view(), name='get_token'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='refresh_token'),
    # Include the default authentication URLs provided by DRF
    path('api-auth/', include('rest_framework.urls')),
    path('api/', include('api.urls')),
    # Message for backend root directory
    path('', lambda request: JsonResponse({'message': 'Django backend running ✅'})),
]
