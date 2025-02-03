from api.models import User, Residencia
from django.utils.timezone import now
from django.core.management.base import BaseCommand
from api.models import *

class Command(BaseCommand):
    help = 'Loads sample data into database'

    def handle(self, *args, **options):
        # Busca o crea una residencia para asociarla al usuario
        residencia = Residencia.objects.create(
                        provincia="Córdoba",
                        ciudad="Córdoba",
                        calle="San Martín",
                        numero=150,
                        piso=1,
                        num_depto=4
                    )

        # Crea el usuario
        admin_user = User.objects.create_user(
            username='admin',
            password='123123',
            dni=12345678,
            nombre='Administrador Ejemplo',
            fecha_nac=now(),
            genero='No especificado',
            role='admin',
            direccion_id_dir=residencia
        )

        # Confirma que el usuario fue creado
        print(f'Usuario creado: {admin_user}')