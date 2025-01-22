from django.core.management.base import BaseCommand
from api.models import *

class Command(BaseCommand):
    help = 'Loads sample data into database'

    def handle(self, *args, **options):
        CentroProfesional.objects.all().delete()

        self.stdout.write(self.style.SUCCESS('Successfully loaded sample data'))