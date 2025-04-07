from django.urls import path
from . import views

urlpatterns = [
    path('courses/', views.CourseListView.as_view(), name='course-list'),
    path('courses/create/', views.CourseCreateView.as_view(), name='course-create'),
    path('courses/delete/<int:pk>/', views.CourseDeleteView.as_view(), name='course-delete'),
    path('users/<int:pk>/', views.UserListView.as_view(), name='user-find'),
    path('users/', views.UserListView.as_view(), name='user-list'),
]