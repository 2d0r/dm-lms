from django.urls import path
from . import views

urlpatterns = [
    path('courses/', views.CourseListCreate.as_view(), name='course-list'),
    path('courses/delete/<int:pk>/', views.CourseDelete.as_view(), name='course-delete'),
    path('users/<int:pk>/', views.UserList.as_view(), name='user-get'),
    path('users/', views.UserList.as_view(), name='user-list'),
]