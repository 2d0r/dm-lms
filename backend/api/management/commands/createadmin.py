from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Profile

class Command(BaseCommand):
    help = 'Create a default admin user'

    def handle(self, *args, **kwargs):
        if not User.objects.filter(username='admin').exists():
            user = User.objects.create_superuser(
                username='admin',
                email='',
                password='12345',
            )
            Profile.objects.create(user=user, role='ADMIN')
            self.stdout.write(self.style.SUCCESS('Admin user created.'))
        else:
            self.stdout.write(self.style.WARNING('Admin user already exists.'))