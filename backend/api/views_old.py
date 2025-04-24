from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserSerializer, CourseSerializer, MyTokenObtainPairSerializer
from .models import Course, Profile
from .permissions import IsAdmin, IsAdminOrTeacher, IsStudent, IsTeacher

# Courses

class CourseListView(generics.ListAPIView):
    '''List courses.'''
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        '''Return a list of all courses'''
        return Course.objects.all()
    
class CourseView(generics.RetrieveAPIView):
    '''Retrieve a single course by ID.'''
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]


class CourseCreateView(generics.CreateAPIView):
    '''Create a new course.'''
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated, IsAdminOrTeacher]

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(teacher=self.request.user)
        else:
            raise ValueError("Invalid data provided")


class CourseUpdateView(generics.UpdateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated, IsAdminOrTeacher]

        
class CourseDeleteView(generics.DestroyAPIView):
    '''Delete a course.'''
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated, IsAdminOrTeacher]
    
    def get_queryset(self):
        '''Return a list of all courses.'''
        return Course.objects.all()


# Users

class UserCreateView(generics.CreateAPIView):
    '''Create a new user.'''
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class UserListView(generics.ListCreateAPIView):
    '''List and create users.'''
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        role = self.request.GET.get('role', '')
        
        if role:
            return User.objects.filter(profile__role=role)
        '''Return a list of all users'''
        return User.objects.all()
    
class UserView(generics.RetrieveAPIView):
    '''Retrieve a user by ID.'''
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

class UserUpdateView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        user = self.get_object()

        # Update related profile.role if provided
        role = request.data.get('role')
        if role:
            profile = getattr(user, 'profile', None)
            if profile:
                profile.role = role
                profile.save()

        return response


class UserDeleteView(generics.DestroyAPIView):
    '''Delete a user and related profile.'''
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get_queryset(self):
        '''Return a list of all users.'''
        return User.objects.all()

    def perform_destroy(self, instance):
        '''Override perform_destroy to delete related profile.'''
        # Delete the related profile
        try:
            profile = Profile.objects.get(user=instance)
            profile.delete()
        except Profile.DoesNotExist:
            pass  # Profile might not exist if not created for some users

        # Delete the user
        instance.delete()


# Users - Courses

class UserEnrollSelfView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request, course_id):
        try:
            course = Course.objects.get(pk=course_id)
            course.enrolled_students.add(request.user)
            return Response({'message': 'Enrolled successfully'})
        except Course.DoesNotExist:
            return Response({'error': 'Course or user not found'}, status=404)


class UserUnenrollSelfView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def delete(self, request, course_id):
        try:
            course = Course.objects.get(pk=course_id)
            course.enrolled_students.remove(request.user)
            return Response({'message': 'Unenrolled successfully'})
        except Course.DoesNotExist:
            return Response({'error': 'Course or user not found'}, status=404)
        

class UserEnrollView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, course_id, user_id):
        try:
            course = Course.objects.get(pk=course_id)
            user = User.objects.get(pk=user_id)
            course.enrolled_students.add(user)
            return Response({'message': 'Enrolled successfully'})
        except Course.DoesNotExist:
            return Response({'error': 'Course or user not found'}, status=404)


class UserUnenrollView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, course_id, user_id):
        try:
            course = Course.objects.get(pk=course_id)
            user = User.objects.get(pk=user_id)
            course.enrolled_students.remove(user)
            return Response({'message': 'Unenrolled successfully'})
        except Course.DoesNotExist:
            return Response({'error': 'Course or user not found'}, status=404)
        
class UserUpdateEnrollmentsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]  # Or IsAdminUser if only admins can update others

    def patch(self, request, user_id):
        try:
            user = User.objects.get(pk=user_id)
            course_ids = request.data.get('courseIds', [])
            courses = Course.objects.filter(id__in=course_ids)
            user.courses.set(courses)  # replaces current list
            return Response({'message': 'Courses updated successfully'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)


class UserCourseView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        role = request.GET.get('role', '').upper()

        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

        if role == 'TEACHER':
            courses = user.courses_taught.all()  # related_name on FK
        elif role == 'STUDENT':
            courses = user.courses.all()  # related_name on M2M
        else:
            return Response({'error': 'Invalid role'}, status=400)

        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

# Tokens

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer