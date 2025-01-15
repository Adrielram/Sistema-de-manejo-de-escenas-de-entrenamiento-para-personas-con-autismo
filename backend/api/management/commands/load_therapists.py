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

        # Crear usuarios Terapeuta
        terapeutas = [
            {"dni": 3001, "nombre": "Terapeuta1", "residencia": residencia_1},
            {"dni": 3002, "nombre": "Terapeuta2", "residencia": residencia_1},
            {"dni": 3003, "nombre": "Terapeuta3", "residencia": residencia_2},
            {"dni": 3004, "nombre": "Terapeuta4", "residencia": residencia_2},
        ]

        for terapeuta in terapeutas:
            User.objects.create(
                dni=terapeuta["dni"],
                nombre=terapeuta["nombre"],
                username=f"terapeuta_{terapeuta['dni']}",  # Username único basado en dni
                fecha_nac=datetime(1990, 5, 15),
                genero="Masculino",
                role="terapeuta",
                direccion_id_dir=terapeuta["residencia"],
            )

        self.stdout.write(self.style.SUCCESS("Usuarios terapeutas cargados exitosamente."))