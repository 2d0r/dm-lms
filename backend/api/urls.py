from django.urls import path
from . import views

urlpatterns = [
    path('courses/', views.CourseListView.as_view(), name='course-list'),
    path('courses/<int:pk>/', views.CourseView.as_view(), name='course-get'),
    path('courses/create/', views.CourseCreateView.as_view(), name='course-create'),
    path('courses/update/<int:pk>/', views.CourseUpdateView.as_view(), name='course-update'),
    path('courses/delete/<int:pk>/', views.CourseDeleteView.as_view(), name='course-delete'),
    path('courses/<int:course_id>/enroll/<int:user_id>', views.UserEnrollView().as_view(), name='enroll'),
    path('courses/<int:course_id>/unenroll/<int:user_id>', views.UserUnenrollView().as_view(), name='unenroll'),
    path('courses/<int:course_id>/enroll/', views.UserEnrollSelfView().as_view(), name='enroll-self'),
    path('courses/<int:course_id>/unenroll/', views.UserUnenrollSelfView().as_view(), name='unenroll-self'),

    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', views.UserView.as_view(), name='user-get'),
    path('users/delete/<int:pk>/', views.UserDeleteView().as_view(), name='user-delete'),
    path('users/create/', views.UserCreateView().as_view(), name='user-create'),
    path('users/update/<int:pk>/', views.UserUpdateView.as_view(), name='user-update'),
    path('users/<int:user_id>/enrollments/', views.UserUpdateEnrollmentsView.as_view(), name='user-update-enrollments'),

    path('users/<int:user_id>/courses/', views.UserCourseView.as_view(), name='courses-user-get'),
]