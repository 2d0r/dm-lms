from django.urls import path
from . import views

urlpatterns = [
    path('courses/', views.CourseListView.as_view(), name='course-list'),
    path('courses/create/', views.CourseCreateView.as_view(), name='course-create'),
    path('courses/update/<int:pk>/', views.CourseUpdateView.as_view(), name='course-update'),
    path('courses/delete/<int:pk>/', views.CourseDeleteView.as_view(), name='course-delete'),
    path('courses/<int:course_id>/enroll/<int:user_id>', views.UserEnrollView().as_view(), name='enroll'),
    path('courses/<int:course_id>/unenroll/<int:user_id>', views.UserUnenrollView().as_view(), name='unenroll'),
    path('courses/<int:course_id>/enroll/', views.UserEnrollSelfView().as_view(), name='enroll-self'),
    path('courses/<int:course_id>/unenroll/', views.UserUnenrollSelfView().as_view(), name='unenroll-self'),
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', views.UserListView.as_view(), name='user-find'),
    path('users/delete/<int:pk>/', views.UserDeleteView().as_view(), name='user-delete'),
    path('users/create/', views.UserCreateView().as_view(), name='user-create'),
]