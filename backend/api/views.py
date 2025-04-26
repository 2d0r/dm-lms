from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserSerializer, CourseSerializer, MyTokenObtainPairSerializer
from .models import Course
from .permissions import IsAdmin, IsAdminOrTeacher, IsStudent

# Courses

class CourseView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsAdminOrTeacher()]
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdminOrTeacher()] # DELETE and PATCH

    def get(self, request, course_id=None):
        if course_id:
            try:
                course = Course.objects.get(pk=course_id)
                serializer = CourseSerializer(course)
                return Response(serializer.data)
            except Course.DoesNotExist:
                return Response({'error': 'Course not found'}, status=404)

        courses = Course.objects.all()
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CourseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def patch(self, request, course_id):
        try:
            course = Course.objects.get(pk=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=404)

        serializer = CourseSerializer(course, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, course_id):
        try:
            course = Course.objects.get(pk=course_id)
            course.delete()
            return Response({'message': 'Course deleted'})
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=404)


# Users

class UserView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [AllowAny()]
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdmin()]

    def get(self, request, user_id=None):
        if user_id:
            try:
                user = User.objects.get(pk=user_id)
                serializer = UserSerializer(user)
                return Response(serializer.data)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=404)

        role = request.GET.get('role')
        users = User.objects.filter(profile__role=role) if role else User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def patch(self, request, user_id):
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()

            # Update profile role if present
            role = request.data.get('role')
            if role:
                profile = getattr(user, 'profile', None)
                if profile:
                    profile.role = role
                    profile.save()

            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, user_id):
        try:
            user = User.objects.get(pk=user_id)
            profile = getattr(user, 'profile', None)
            if profile:
                profile.delete()
            user.delete()
            return Response({'message': 'User deleted'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)


# Users - Courses
        
class SelfEnrollmentView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request, course_id):
        try:
            course = Course.objects.get(pk=course_id)
            course.enrolled_students.add(request.user)
            return Response({'message': 'Enrolled successfully'})
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=404)

    def delete(self, request, course_id):
        try:
            course = Course.objects.get(pk=course_id)
            course.enrolled_students.remove(request.user)
            return Response({'message': 'Unenrolled successfully'})
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=404)


class UserCourseView(APIView):
    def get_permissions(self):
        if self.request.method == 'PATCH':
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

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

    def patch(self, request, user_id):
        '''Link user to multiple courses'''
        role = request.GET.get('role', '').upper()

        try:
            user = User.objects.get(pk=user_id)
            course_ids = request.data.get('courseIds', [])
            courses = Course.objects.filter(id__in=course_ids)
        except User.DoesNotExist:
            return Response({'error': 'User or course not found'}, status=404)
        
        if role == 'STUDENT':
            user.courses.set(courses)  # replaces current list
            return Response({'message': 'User enrolled in courses successfully'})
        if role == 'TEACHER':
            user.courses_taught.set(courses)
            return Response({'message': 'User set as teacher for multiple courses successfully', 'courses': courses})
        return Response({'error': 'Invalid role'}, status=400)
        
    def post(self, request, user_id, course_id):
        '''Create new relation users-courses'''
        role = request.GET.get('role', '').upper()

        try:
            user = User.objects.get(pk=user_id)
            course = Course.objects.get(pk=course_id)
        except:
            return Response({'error': 'User or course not found'}, status=404)
        
        if role == 'STUDENT':
            user.courses.add(course)
            return Response({'message': 'User enrolled in course successfully'})
        if role == 'TEACHER':
            course.teacher = user
            course.save()
            return Response({'message': 'User assigned as teacher for course'})
        return Response({'error': 'Invalid role'}, status=400)
    
    def delete(self, request, user_id, course_id):
        '''Delete relation users-courses'''
        role = request.GET.get('role', '').upper()

        try:
            user = User.objects.get(pk=user_id)
            course = Course.objects.get(pk=course_id)
            if role == 'STUDENT':
                user.courses.remove(course)
                return Response({'message': 'User unenrolled successfully'})
            if role == 'TEACHER':
                return Response({'error': 'Teacher cannot be removed from course'})
        except:
            return Response({'error': 'User or course not found'}, status=404)

# Tokens

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer