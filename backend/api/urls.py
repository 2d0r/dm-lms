from django.urls import path
from .views import course_views, user_views, user_course_views

urlpatterns = [
    # Courses
    path('courses/', course_views.CourseView.as_view()),
    path('courses/<int:course_id>/', course_views.CourseView.as_view()),

    # Users
    path('users/', user_views.UserView.as_view()), # GET all, POST new
    path('users/<int:user_id>/', user_views.UserView.as_view()), # GET, PATCH, DELETE by ID
    path('user/', user_views.CurrentUserView.as_view(), name='current-user'),

    # Users - Courses
    path('users/<int:user_id>/courses/', user_course_views.UserCourseView.as_view()),
    path('users/<int:user_id>/courses/<int:course_id>', user_course_views.UserCourseView.as_view()),
    path('courses/<int:course_id>/users/me/', user_course_views.SelfEnrollmentView.as_view()),
]