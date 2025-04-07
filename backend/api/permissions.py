# permissions.py
from rest_framework import permissions
from .models import Role

class IsAdmin(permissions.BasePermission):
    """Allow access to admins only."""
    def has_permission(self, request, view):
        return request.user.profile.role == Role.ADMIN

class IsTeacher(permissions.BasePermission):
    """Allow access to teachers only."""
    def has_permission(self, request, view):
        return request.user.profile.role == Role.TEACHER

class IsStudent(permissions.BasePermission):
    """Allow access to students only."""
    def has_permission(self, request, view):
        return request.user.profile.role == Role.STUDENT
    
class IsAdminOrTeacher(permissions.BasePermission):
    """Allow access to admins and teachers only."""
    
    def has_permission(self, request, view):
        user_role = request.user.profile.role  # assuming the user has a profile with the role
        return user_role in [Role.ADMIN, Role.TEACHER]