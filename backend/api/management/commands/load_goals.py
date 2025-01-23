from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from datetime import datetime
from api.models import *

class Command(BaseCommand):
    help = 'Loads sample data into database'

    def handle(self, *args, **options):
        # Link professional to center
        centro_prof = CentroProfesional.objects.get(id=1)

        # Create scenes
        escena_3 = Escena.objects.create(
            idioma="Español",
            acento="neutro",
            complejidad=2,
            condiciones="Normal",
            link="https://ejemplo.com/video3",
            nombre="Escena 3"
        )
        escena_4 = Escena.objects.create(
            idioma="Español",
            acento="neutro",
            complejidad=4,
            condiciones="Normal",
            link="https://ejemplo.com/video4",
            nombre="Escena 4"
        )
        escena_5 = Escena.objects.create(
            idioma="Español",
            acento="neutro",
            complejidad=3,
            condiciones="Normal",
            link="https://ejemplo.com/video5",
            nombre="Escena 5"
        )
        escena_6 = Escena.objects.create(
            idioma="Español",
            acento="neutro",
            complejidad=5,
            condiciones="Normal",
            link="https://ejemplo.com/video6",
            nombre="Escena 6"
        )

        # Create objectives
        objetivo_3 = Objetivo.objects.create(
            nombre="Objetivo 3",
            descripcion="Tercer objetivo de prueba",
            escena=escena_3,
            centro_profesional=centro_prof
        )
        objetivo_4 = Objetivo.objects.create(
            nombre="Objetivo 4",
            descripcion="Cuarto objetivo de prueba",
            escena=escena_4,
            centro_profesional=centro_prof
        )
        objetivo_5 = Objetivo.objects.create(
            nombre="Objetivo 5",
            descripcion="Quinto objetivo de prueba",
            escena=escena_5,
            centro_profesional=centro_prof
        )
        objetivo_6 = Objetivo.objects.create(
            nombre="Objetivo 6",
            descripcion="Sexto objetivo de prueba",
            escena=escena_6,
            centro_profesional=centro_prof
        )

        Objetivoscumplir.objects.create(
            objetivo=objetivo_6,
            objetivo_previo=objetivo_5
        )
        Objetivoscumplir.objects.create(
            objetivo=objetivo_5,
            objetivo_previo=objetivo_4
        )
        Objetivoscumplir.objects.create(
            objetivo=objetivo_4,
            objetivo_previo=objetivo_3
        )

        # Create scene-objective relationship
        escena_obj_3 = EscenaObjetivo.objects.create(
            escena=escena_3,
            objetivo=objetivo_3
        )
        escena_obj_4 = EscenaObjetivo.objects.create(
            escena=escena_4,
            objetivo=objetivo_4
        )
        escena_obj_5 = EscenaObjetivo.objects.create(
            escena=escena_5,
            objetivo=objetivo_5
        )
        escena_obj_6 = EscenaObjetivo.objects.create(
            escena=escena_6,
            objetivo=objetivo_6
        )


# from django.core.management.base import BaseCommand
# from api.models import (
#     Residencia, Centrodesalud, User, Escena, Grupo,
#     CentroProfesional, Objetivo, EscenaObjetivo
# )

# class Command(BaseCommand):
#     help = "Cargar objetivos de ejemplo en la base de datos"

#     def handle(self, *args, **kwargs):
#         # * Crear residencia
#         residencia, _ = Residencia.objects.get_or_create(
#             provincia="Buenos Aires",
#             ciudad="Tandil",
#             calle="Avenida Siempreviva",
#             numero=742
#         )

#         # # * Crear residencia
#         # residencia, _ = Residencia.objects.get_or_create(
#         #     provincia="Buenos Aires",
#         #     ciudad="Tandil",
#         #     calle="Avenida Avellaneda",
#         #     numero=448
#         # )

#         # # * obtener residencia
#         # #residencia = Residencia.objects.get(pk=1)
#         #residencia = Residencia.objects.get(pk=1)

#         # * Crear centro de salud
#         centro_salud, _ = Centrodesalud.objects.get_or_create(
#             nombre="Centro Casabella 2",
#             direccion_id_dir=residencia
#         )

#         # * Crear usuario profesional
#         profesional, _ = User.objects.get_or_create(
#             dni=15345678,
#             defaults={
#                 "username": "soyhomelochino",
#                 "nombre": "Homero Simpson",
#                 "fecha_nac": "1970-01-01",
#                 "genero": "Masculino",
#                 "role": "terapeuta",
#                 "direccion_id_dir": residencia
#             }
#         )

#         # # * obtener profesional
#         # profesional = User.objects.get(dni=15345678)

#         # # * obtener residencia
#         # centro_salud = Centrodesalud.objects.get(pk=1)

#         # Crear instancia de CentroProfesional
#         centroProfesional, _ = CentroProfesional.objects.get_or_create(
#             centrodesalud=centro_salud,
#             profesional=profesional
#         )

#         # # * obtener residencia
#         # centroProfesional = CentroProfesional.objects.get(pk=1)

#         # * Crear escenas
#         escena_1, _ = Escena.objects.get_or_create(
#             idioma="Español",
#             acento="Argentino",
#             complejidad=3,
#             condiciones="Sin condiciones especiales",
#             link="https://example.com/escena1",
#             nombre="Escena 1"
#         )

#         escena_2, _ = Escena.objects.get_or_create(
#             idioma="Inglés",
#             acento="Británico",
#             complejidad=5,
#             condiciones="Sin condiciones especiales",
#             link="https://example.com/escena2",
#             nombre="Escena 2"
#         )

#         # # * obtener residencia
#         # escena_1 = Escena.objects.get(pk=1)
#         # escena_2 = Escena.objects.get(pk=2)

#         # Objetivo.objects.get_or_create(
#         #         nombre="Objetivo 1",
#         #         descripcion="Descripción del objetivo 1",
#         #         escena=escena_1,
#         #         centro_profesional=centroProfesional
#         # )

#         # * Crear objetivos
#         objetivos_data = [
#             {"nombre": "Objetivo 1", "descripcion": "Descripción del objetivo 1", "escena": escena_1},
#             {"nombre": "Objetivo 2", "descripcion": "Descripción del objetivo 2", "escena": escena_1},
#             {"nombre": "Objetivo 3", "descripcion": "Descripción del objetivo 3", "escena": escena_2},
#             {"nombre": "Objetivo 4", "descripcion": "Descripción del objetivo 4", "escena": escena_2},
#         ]

#         for objetivo_data in objetivos_data:
#             objetivo, _ = Objetivo.objects.get_or_create(
#                 nombre=objetivo_data["nombre"],
#                 descripcion=objetivo_data["descripcion"],
#                 escena=objetivo_data["escena"],
#                 centro_profesional=centroProfesional
#             )

#             # Relacionar objetivo con escena en EscenaObjetivo
#             EscenaObjetivo.objects.get_or_create(
#                 escena=objetivo_data["escena"],
#                 objetivo=objetivo
#             )

#         self.stdout.write(self.style.SUCCESS("Objetivos y relaciones creados exitosamente."))
