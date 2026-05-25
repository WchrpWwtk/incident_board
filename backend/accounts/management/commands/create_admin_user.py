import os

from django.contrib.auth import get_user_model
from django.core.management import BaseCommand


class Command(BaseCommand):
	help = "Create admin user from environment variables"
	
	def handle(self, *args, **options):
		username = os.getenv("ADMIN_USERNAME")
		email = os.getenv("ADMIN_EMAIL")
		password = os.getenv("ADMIN_PASSWORD")
		
		if not username or not email or not password:
			self.stdout.write(self.style.WARNING("Admin env vars not set. Skipping."))
			
		User = get_user_model()
		
		user, created = User.objects.get_or_create(username=username, defaults={
			"email": email,
			"is_staff": True,
			"is_superuser": True,
			"role": "admin",
		})
		
		if created:
			user.set_password(password)
			user.save()
			self.stdout.write(self.style.SUCCESS("Admin user created."))
		else:
			self.stdout.write(self.style.WARNING("Admin user already exists."))