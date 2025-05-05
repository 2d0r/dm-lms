from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from .models import Profile, Course, Role
from rest_framework_simplejwt.tokens import RefreshToken

class TokenTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password', first_name='Test')
        Profile.objects.create(user=self.user, role=Role.TEACHER)

    def test_token_returns_custom_fields(self):
        response = self.client.post('/api/token/', {'username': 'testuser', 'password': 'password'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['role'], Role.TEACHER)
        self.assertEqual(response.data['first_name'], 'Test')

class UserTests(APITestCase):
    def test_create_user_with_profile(self):
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'securepass123',
            'first_name': 'New',
            'profile': {'role': Role.STUDENT}
        }
        response = self.client.post('/api/users/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        user = User.objects.first()
        self.assertEqual(user.profile.role, Role.STUDENT)

class CourseTests(APITestCase):
    def setUp(self):
        self.teacher = User.objects.create_user(username='teacher', password='pass')
        Profile.objects.create(user=self.teacher, role=Role.TEACHER)

        refresh = RefreshToken.for_user(self.teacher)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh.access_token)}')

    def test_create_course(self):
        data = {
            'title': 'New Course',
            'description': 'Learn something new',
            'teacher': self.teacher.id
        }
        response = self.client.post('/api/courses/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Course.objects.count(), 1)
        self.assertEqual(Course.objects.first().teacher, self.teacher)

    def test_list_courses(self):
        Course.objects.create(title='Course A', description='desc', teacher=self.teacher)
        response = self.client.get('/api/courses/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 1)

    def test_enroll_student(self):
        student = User.objects.create_user(username='student', password='pass')
        Profile.objects.create(user=student, role=Role.STUDENT)
        course = Course.objects.create(title='Course A', description='desc', teacher=self.teacher)
        course.enrolled_students.add(student)

        self.assertIn(student, course.enrolled_students.all())