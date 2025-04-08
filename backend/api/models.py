from django.db import models
from django.contrib.auth.models import User

class Course(models.Model):
    '''Course model to represent a course.'''
    title = models.CharField(max_length=100)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True) # Automatically populate field creation time
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses')
    enrolled_students = models.ManyToManyField(User, related_name='courses_enrolled_in')

    def __str__(self):
        return self.tile

class Role(models.TextChoices):
    ADMIN = 'ADMIN', 'admin'
    TEACHER = 'TEACHER', 'teacher'
    STUDENT = 'STUDENT', 'student'

class Profile(models.Model):
    '''Profile model to include authentication credentials and other user details.'''
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(
        max_length=20, 
        choices=Role.choices, 
        default=Role.STUDENT, # Default to the role with fewest permissions
    )

    def __str__(self):
        return f'{self.user.username} - {self.role}'