from django.core.management.base import BaseCommand
from api.models import Grupo, Centrodesalud, Residencia

class Command(BaseCommand):
    help = "Cargar grupos de ejemplo en la base de datos"

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

        # Crear centros de salud
        centro_1, _ = Centrodesalud.objects.get_or_create(
            id=1,
            defaults={
                'nombre': 'Centro de Salud La Esperanza',
                'direccion_id_dir': residencia_1
            }
        )

        centro_2, _ = Centrodesalud.objects.get_or_create(
            id=2,
            defaults={
                'nombre': 'Centro de Salud San José',
                'direccion_id_dir': residencia_2
            }
        )

        # Lista de grupos de ejemplo
        grupos = [
            {"id": 1, "nombre": "Grupo Terapia Familiar", "centrodesalud": centro_1},
            {"id": 2, "nombre": "Grupo Ansiedad Generalizada", "centrodesalud": centro_1},
            {"id": 3, "nombre": "Grupo Apoyo Psicológico", "centrodesalud": centro_2},
            {"id": 4, "nombre": "Grupo Rehabilitación Física", "centrodesalud": centro_2},
        ]

        # Crear los grupos
        for grupo in grupos:
            Grupo.objects.get_or_create(
                id=grupo["id"],
                defaults={
                    "nombre": grupo["nombre"],
                    "centrodesalud": grupo["centrodesalud"],
                }
            )

        self.stdout.write(self.style.SUCCESS("Grupos y centros de salud creados exitosamente."))
