from django.core.management.base import BaseCommand
from api.models import Centrodesalud, Residencia
from django.db import IntegrityError

class Command(BaseCommand):
    help = "Cargar centros de salud de ejemplo en la base de datos"

    def handle(self, *args, **kwargs):
        # Crear residencias para los centros de salud
        residencia_centro_1, _ = Residencia.objects.get_or_create(
            id_dir=10,  # Usando IDs diferentes a las residencias de usuarios
            defaults={
                'provincia': 'Buenos Aires',
                'ciudad': 'La Plata',
                'calle': 'Av. Principal',
                'numero': 789
            }
        )

        residencia_centro_2, _ = Residencia.objects.get_or_create(
            id_dir=11,
            defaults={
                'provincia': 'Buenos Aires',
                'ciudad': 'Mar del Plata',
                'calle': 'Av. Costanera',
                'numero': 456
            }
        )

        residencia_centro_3, _ = Residencia.objects.get_or_create(
            id_dir=12,
            defaults={
                'provincia': 'Córdoba',
                'ciudad': 'Villa Carlos Paz',
                'calle': 'Av. San Martín',
                'numero': 123
            }
        )

        # Lista de centros de salud a crear
        centros = [
            {
                "nombre": "Centro Médico La Plata",
                "direccion": residencia_centro_1
            },
            {
                "nombre": "Hospital Mar del Plata",
                "direccion": residencia_centro_2
            },
            {
                "nombre": "Clínica Carlos Paz",
                "direccion": residencia_centro_3
            }
        ]

        # Crear centros de salud
        for centro in centros:
            try:
                Centrodesalud.objects.create(
                    nombre=centro["nombre"],
                    direccion_id_dir=centro["direccion"]
                )
                self.stdout.write(
                    self.style.SUCCESS(f'Centro de salud "{centro["nombre"]}" creado exitosamente.')
                )
            except IntegrityError:
                self.stdout.write(
                    self.style.WARNING(f'El centro de salud "{centro["nombre"]}" ya existe.')
                )

        self.stdout.write(self.style.SUCCESS("Proceso de carga de centros de salud completado."))