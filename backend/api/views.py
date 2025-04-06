from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer, CourseSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Course

class CourseListCreate(generics.ListCreateAPIView):
    '''List and create courses.'''
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        '''Return a list of all courses'''
        return Course.objects.all()

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(teacher=self.request.user)
        else:
            raise ValueError("Invalid data provided")
        
class CourseDelete(generics.DestroyAPIView):
    '''Delete a course.'''
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    # def perform_destroy(self, instance):
    #     '''Delete the course instance.'''
    #     instance.delete()
    #     return Response(status=204)
    
    def get_queryset(self):
        '''Return a list of all courses.'''
        return Course.objects.all()

# Create your views here.
class CreateUserView(generics.CreateAPIView):
    '''Create a new user.'''
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class UserList(generics.ListCreateAPIView):
    '''List and create teachers.'''
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        '''Return a list of all teachers'''
        return User.objects.all()

    # def perform_create(self, serializer):
    #     if serializer.is_valid():
    #         serializer.save(teacher=self.request.user)
    #     else:
    #         raise ValueError("Invalid data provided")