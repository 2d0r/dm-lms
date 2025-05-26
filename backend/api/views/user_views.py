from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from ..serializers import UserSerializer
from ..permissions import IsAdmin


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
        

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)