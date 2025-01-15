from django.core.management.base import BaseCommand
from api.models import (
    Residencia, Centrodesalud, User, Escena, Grupo,
    CentroProfesional, Objetivo, EscenaObjetivo
)

class Command(BaseCommand):
    help = "Cargar objetivos de ejemplo en la base de datos"

    def handle(self, *args, **kwargs):
        # * Crear residencia
        residencia, _ = Residencia.objects.get_or_create(
            provincia="Buenos Aires",
            ciudad="Tandil",
            calle="Avenida Siempreviva",
            numero=742
        )

        # # * Crear residencia
        # residencia, _ = Residencia.objects.get_or_create(
        #     provincia="Buenos Aires",
        #     ciudad="Tandil",
        #     calle="Avenida Avellaneda",
        #     numero=448
        # )

        # # * obtener residencia
        # #residencia = Residencia.objects.get(pk=1)
        #residencia = Residencia.objects.get(pk=1)

        # * Crear centro de salud
        centro_salud, _ = Centrodesalud.objects.get_or_create(
            nombre="Centro Casabella 2",
            direccion_id_dir=residencia
        )

        # * Crear usuario profesional
        profesional, _ = User.objects.get_or_create(
            dni=15345678,
            defaults={
                "username": "soyhomelochino",
                "nombre": "Homero Simpson",
                "fecha_nac": "1970-01-01",
                "genero": "Masculino",
                "role": "terapeuta",
                "direccion_id_dir": residencia
            }
        )

        # # * obtener profesional
        # profesional = User.objects.get(dni=15345678)

        # # * obtener residencia
        # centro_salud = Centrodesalud.objects.get(pk=1)

        # Crear instancia de CentroProfesional
        centroProfesional, _ = CentroProfesional.objects.get_or_create(
            centrodesalud=centro_salud,
            profesional=profesional
        )

        # # * obtener residencia
        # centroProfesional = CentroProfesional.objects.get(pk=1)

        # * Crear escenas
        escena_1, _ = Escena.objects.get_or_create(
            idioma="Español",
            acento="Argentino",
            complejidad=3,
            condiciones="Sin condiciones especiales",
            link="https://example.com/escena1",
            nombre="Escena 1"
        )

        escena_2, _ = Escena.objects.get_or_create(
            idioma="Inglés",
            acento="Británico",
            complejidad=5,
            condiciones="Sin condiciones especiales",
            link="https://example.com/escena2",
            nombre="Escena 2"
        )

        # # * obtener residencia
        # escena_1 = Escena.objects.get(pk=1)
        # escena_2 = Escena.objects.get(pk=2)

        # Objetivo.objects.get_or_create(
        #         nombre="Objetivo 1",
        #         descripcion="Descripción del objetivo 1",
        #         escena=escena_1,
        #         centro_profesional=centroProfesional
        # )

        # * Crear objetivos
        objetivos_data = [
            {"nombre": "Objetivo 1", "descripcion": "Descripción del objetivo 1", "escena": escena_1},
            {"nombre": "Objetivo 2", "descripcion": "Descripción del objetivo 2", "escena": escena_1},
            {"nombre": "Objetivo 3", "descripcion": "Descripción del objetivo 3", "escena": escena_2},
            {"nombre": "Objetivo 4", "descripcion": "Descripción del objetivo 4", "escena": escena_2},
        ]

        for objetivo_data in objetivos_data:
            objetivo, _ = Objetivo.objects.get_or_create(
                nombre=objetivo_data["nombre"],
                descripcion=objetivo_data["descripcion"],
                escena=objetivo_data["escena"],
                centro_profesional=centroProfesional
            )

            # Relacionar objetivo con escena en EscenaObjetivo
            EscenaObjetivo.objects.get_or_create(
                escena=objetivo_data["escena"],
                objetivo=objetivo
            )

        self.stdout.write(self.style.SUCCESS("Objetivos y relaciones creados exitosamente."))






# from django.core.management.base import BaseCommand
# from api.models import Objetivo, Escena, EscenaObjetivo

# class Command(BaseCommand):
#     help = "Cargar objetivos de ejemplo en la base de datos"

#     def handle(self, *args, **kwargs):
#         # Crear escenas de ejemplo
#         escena_1, _ = Escena.objects.get_or_create(
#             id=1,
#             defaults={
#                 'idioma': 'Español',
#                 'acento': 'Argentino',
#                 'complejidad': 3,
#                 'link': 'https://example.com/escena1',
#                 'nombre': 'Escena 1'
#             }
#         )

#         escena_2, _ = Escena.objects.get_or_create(
#             id=2,
#             defaults={
#                 'idioma': 'Inglés',
#                 'acento': 'Británico',
#                 'complejidad': 5,
#                 'link': 'https://example.com/escena2',
#                 'nombre': 'Escena 2'
#             }
#         )

#         # Crear objetivos de ejemplo
#         objetivos = [
#             {"nombre": "Objetivo 1", "descripcion": "Descripción del objetivo 1", "escena": escena_1},
#             {"nombre": "Objetivo 2", "descripcion": "Descripción del objetivo 2", "escena": escena_1},
#             {"nombre": "Objetivo 3", "descripcion": "Descripción del objetivo 3", "escena": escena_2},
#             {"nombre": "Objetivo 4", "descripcion": "Descripción del objetivo 4", "escena": escena_2},
#         ]

#         for objetivo_data in objetivos:
#             objetivo = Objetivo.objects.create(
#                 nombre=objetivo_data["nombre"],
#                 descripcion=objetivo_data["descripcion"],
#                 escena=objetivo_data["escena"]
#             )

#             # Relacionar el objetivo con la escena en la tabla EscenaObjetivo
#             EscenaObjetivo.objects.create(
#                 escena=objetivo_data["escena"],
#                 objetivo=objetivo
#             )

#         self.stdout.write(self.style.SUCCESS("Objetivos y relaciones con escenas cargados exitosamente."))