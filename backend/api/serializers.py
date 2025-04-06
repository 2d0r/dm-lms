from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Course

# A serialiser converts python objects to JSON, to be used in API

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        '''Create and return a new user instance, given the validated data.'''
        user = User.objects.create_user(**validated_data)
        return user

class CourseSerializer(serializers.ModelSerializer):
    '''Serialiser for the Course model.'''
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'created_at', 'teacher']
        extra_kwargs = {'teacher': {'read_only': True}}