from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Profile, Course

class Command(BaseCommand):
    help = 'Seeds the database with one admin, 3 teachers, 1 student and 2 courses.'

    def handle(self, *args, **kwargs):
        def create_user(username='', name='', role='', is_superuser=False):
            if username and role in ['STUDENT', 'TEACHER', 'ADMIN'] and not User.objects.filter(username=username).exists():
                user = User.objects.create_user(
                    username=username,
                    email=f'{username}@dm.com',
                    password='pass123!',
                    first_name=name,
                    is_superuser=is_superuser,
                    is_staff=is_superuser
                )
                Profile.objects.create(user=user, role=role.upper())
                self.stdout.write(self.style.SUCCESS(f'{role.capitalize()} user created: {username}'))
            else:
                self.stdout.write(f'{role.capitalize()} user "{username}" already exists.')

        def create_course(title='', description='', teacherUsername='', students=[]):
            if not title:
                self.stdout.write(self.style.WARNING('Course title is required.'))
                return
            if Course.objects.filter(title=title).exists():
                self.stdout.write(f'Course already exists: {title}')
                return

            try:
                teacher = User.objects.get(username=teacherUsername)
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Teacher with username "{teacherUsername}" not found.'))
                return

            course = Course.objects.create(title=title, description=description, teacher=teacher)

            enrolled_students = []
            for username in students:
                try:
                    student = User.objects.get(username=username)
                    enrolled_students.append(student)
                except User.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f'Student "{username}" not found. Skipping.'))

            course.enrolled_students.set(enrolled_students)
            self.stdout.write(self.style.SUCCESS(f'✅ Course created: {title} with {len(enrolled_students)} student(s).'))

        create_user(username='admin', name='Admin', role='ADMIN', is_superuser=True)
        create_user(username='teacher', name='T. Cher', role='TEACHER')
        create_user(username='cordelia', name='Cordelia Cupp', role='TEACHER')
        create_user(username='lisa', name='Lisa Simpson', role='TEACHER')
        create_user(username='student', name='Studious Stud', role='STUDENT')

        create_course(
            title='Rare Bird Spotting', 
            description='Learn how to track the rarest birds', 
            teacherUsername='cordelia',
            students=['student']
        )
        create_course(
            title='The Psychology of the Simpsons', 
            description='Delve into the complex (or less complex) inner workings of the world\'s most popular family', 
            teacherUsername='lisa',
        )
        
        self.stdout.write(self.style.SUCCESS('Seeding complete.'))