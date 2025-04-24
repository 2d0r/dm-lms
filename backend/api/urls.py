from django.urls import path
from . import views

urlpatterns = [
    # Courses
    path('courses/', views.CourseView.as_view()),
    path('courses/<int:course_id>/', views.CourseView.as_view()),

    # Users
    path('users/', views.UserView.as_view()), # GET all, POST new
    path('users/<int:user_id>/', views.UserView.as_view()), # GET, PATCH, DELETE by ID

    # Users - Courses
    path('users/<int:user_id>/courses/', views.UserCourseView.as_view()),
    path('users/<int:user_id>/courses/<int:course_id>', views.UserCourseView.as_view()),
    path('courses/<int:course_id>/users/me/', views.SelfEnrollmentView.as_view()),
]