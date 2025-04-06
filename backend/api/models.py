from django.db import models
from django.contrib.auth.models import User

class Course(models.Model):
    '''Course model to represent a course.'''
    title = models.CharField(max_length=100)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True) # Automatically populate field creation time
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses')

    def __str__(self):
        return self.tile
