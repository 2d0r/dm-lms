from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Course, Profile
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# A serialiser converts python objects to JSON, to be used in API

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'created_at', 'teacher', 'enrolled_students']

# custom token serialiser which returns role to frontend
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['role'] = self.user.profile.role
        data['id'] = self.user.id
        data['first_name'] = self.user.first_name
        return data
    

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['role']

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()
    courses = CourseSerializer(many=True, read_only=True)
    courses_taught = CourseSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'profile', 'courses', 'courses_taught']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        '''Create and return a new user instance, given the validated data.'''
        profile_data = validated_data.pop('profile')
        password = validated_data.pop('password')

        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()

        Profile.objects.create(user=user, **profile_data)
        return user
    
    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        password = validated_data.pop('password', None)

        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Handle password if provided
        if password:
            instance.set_password(password)

        instance.save()

        # Update profile fields
        profile = instance.profile
        for attr, value in profile_data.items():
            setattr(profile, attr, value)
        profile.save()

        return instance