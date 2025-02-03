from django.core.management.base import BaseCommand
from api.models import User, Residencia  
from datetime import datetime

class Command(BaseCommand):
    help = "Cargar usuarios de ejemplo en la base de datos"

    def handle(self, *args, **kwargs):
        # Crear residencias de ejemplo
        residencia_1, _ = Residencia.objects.get_or_create(
            id_dir=1,
            defaults={
                'provincia': 'Buenos Aires',
                'ciudad': 'La Plata',
                'calle': 'Calle Falsa',
                'numero': 123
            }
        )

        residencia_2, _ = Residencia.objects.get_or_create(
            id_dir=2,
            defaults={
                'provincia': 'Córdoba',
                'ciudad': 'Córdoba Capital',
                'calle': 'Av. Siempre Viva',
                'numero': 456
            }
        )

        padre_1 = User.objects.create(
            dni=1001,
            nombre="Padre1",
            username="padre1_1001",  # Username único basado en nombre y dni
            fecha_nac=datetime(1980, 5, 10),
            genero="Masculino",
            role="padre",
            direccion_id_dir=residencia_1,
        )

        padre_2 = User.objects.create(
            dni=1002,
            nombre="Padre2",
            username="padre2_1002",  # Username único basado en nombre y dni
            fecha_nac=datetime(1982, 8, 15),
            genero="Femenino",
            role="padre",
            direccion_id_dir=residencia_2,
        )



        # Crear usuarios Paciente
        pacientes = [
            {"dni": 2001, "nombre": "Paciente1", "padre": padre_1, "residencia": residencia_1},
            {"dni": 2002, "nombre": "Paciente2", "padre": padre_1, "residencia": residencia_1},
            {"dni": 2003, "nombre": "Paciente3", "padre": padre_2, "residencia": residencia_2},
            {"dni": 2004, "nombre": "Paciente4", "padre": padre_2, "residencia": residencia_2},
        ]

        for paciente in pacientes:
            User.objects.create(
                dni=paciente["dni"],
                nombre=paciente["nombre"],
                username=f"paciente_{paciente['dni']}",  # Username único basado en dni
                fecha_nac=datetime(2010, 3, 25),
                genero="Masculino",
                role="paciente",
                direccion_id_dir=paciente["residencia"],
                user_id_padre=paciente["padre"],
            )

        self.stdout.write(self.style.SUCCESS("Usuarios cargados exitosamente."))