from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..serializers import CourseSerializer
from ..models import Course
from ..permissions import IsAdminOrTeacher

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