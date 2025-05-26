from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..serializers import CourseSerializer
from ..models import Course
from ..permissions import IsAdmin, IsStudent


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
            return Response({'message': 'User set as teacher for multiple courses successfully'})
        if role == 'ADMIN' and len(courses):
            return Response({'message': 'Admin can\'t be linked to courses'}, status=403)
        return Response({'error': 'Invalid role'}, status=400)
        
    def post(self, request, user_id, course_id):
        '''Create new relation users-courses'''
        role = request.GET.get('role', '').upper()

        try:
            user = User.objects.get(pk=user_id)
            course = Course.objects.get(pk=course_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=404)
        
        if role == 'STUDENT':
            user.courses.add(course)
            return Response({'message': 'User enrolled in course successfully'})
        if role == 'TEACHER':
            course.teacher = user
            course.save()
            return Response({'message': 'User assigned as teacher for course'})
        if role == 'ADMIN':
            return Response({'message': 'Admin can\'t be linked to course'}, status=403)
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
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=404)