from django.core.management.base import BaseCommand
from api.models import Objetivo, Escena, EscenaObjetivo

class Command(BaseCommand):
    help = "Cargar objetivos de ejemplo en la base de datos"

    def handle(self, *args, **kwargs):
        # Crear escenas de ejemplo
        escena_1, _ = Escena.objects.get_or_create(
            id=1,
            defaults={
                'idioma': 'Español',
                'acento': 'Argentino',
                'complejidad': 3,
                'link': 'https://example.com/escena1',
                'nombre': 'Escena 1'
            }
        )

        escena_2, _ = Escena.objects.get_or_create(
            id=2,
            defaults={
                'idioma': 'Inglés',
                'acento': 'Británico',
                'complejidad': 5,
                'link': 'https://example.com/escena2',
                'nombre': 'Escena 2'
            }
        )

        # Crear objetivos de ejemplo
        objetivos = [
            {"nombre": "Objetivo 1", "descripcion": "Descripción del objetivo 1", "escena": escena_1},
            {"nombre": "Objetivo 2", "descripcion": "Descripción del objetivo 2", "escena": escena_1},
            {"nombre": "Objetivo 3", "descripcion": "Descripción del objetivo 3", "escena": escena_2},
            {"nombre": "Objetivo 4", "descripcion": "Descripción del objetivo 4", "escena": escena_2},
        ]

        for objetivo_data in objetivos:
            objetivo = Objetivo.objects.create(
                nombre=objetivo_data["nombre"],
                descripcion=objetivo_data["descripcion"],
                escena=objetivo_data["escena"]
            )

            # Relacionar el objetivo con la escena en la tabla EscenaObjetivo
            EscenaObjetivo.objects.create(
                escena=objetivo_data["escena"],
                objetivo=objetivo
            )

        self.stdout.write(self.style.SUCCESS("Objetivos y relaciones con escenas cargados exitosamente."))
