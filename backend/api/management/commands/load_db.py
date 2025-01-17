from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from datetime import datetime
from api.models import *

class Command(BaseCommand):
    help = 'Loads sample data into database'

    def handle(self, *args, **options):
        # Create addresses
        residencias = [
            Residencia.objects.create(
                provincia="Córdoba",
                ciudad="Córdoba",
                calle="San Martín",
                numero=150,
                piso=1,
                num_depto=4
            ),
            Residencia.objects.create(
                provincia="Buenos Aires",
                ciudad="CABA",
                calle="Rivadavia",
                numero=1234,
                piso=None,
                num_depto=None
            )
        ]

        # Create healthcare centers
        centros = [
            Centrodesalud.objects.create(
                nombre="Centro A",
                direccion_id_dir=residencias[0]
            ),
            Centrodesalud.objects.create(
                nombre="Centro B", 
                direccion_id_dir=residencias[1]
            )
        ]

        # Create users
        admin = User.objects.create(
            username="admin1",
            password=make_password("admin123"),
            dni=30111222,
            nombre="Admin Principal",
            fecha_nac=datetime(1980, 1, 1),
            genero="M",
            role="admin",
            direccion_id_dir=residencias[0]
        )

        terapeuta = User.objects.create(
            username="terapeuta1",
            password=make_password("tera123"),
            dni=31222333,
            nombre="Terapeuta Uno",
            fecha_nac=datetime(1985, 2, 15),
            genero="F",
            role="terapeuta",
            direccion_id_dir=residencias[0]
        )

        paciente = User.objects.create(
            username="paciente1",
            password=make_password("pac123"),
            dni=40333444,
            nombre="Paciente Uno",
            fecha_nac=datetime(2010, 5, 20),
            genero="M",
            role="paciente",
            direccion_id_dir=residencias[1]
        )

        padre = User.objects.create(
            username="padre1",
            password=make_password("padre123"),
            dni=35444555,
            nombre="Padre Uno",
            fecha_nac=datetime(1990, 10, 10),
            genero="M",
            role="padre",
            direccion_id_dir=residencias[1]
        )

        # Link patient with parent
        paciente.user_id_padre = padre
        paciente.save()

        # Create groups
        grupo = Grupo.objects.create(
            nombre="Grupo 1",
            centrodesalud_id=centros[0]
        )

        # Link professional to center
        centro_prof = CentroProfesional.objects.create(
            centrodesalud=centros[0],
            profesional=terapeuta
        )

        # Create scenes
        escena_1 = Escena.objects.create(
            idioma="Español",
            acento="neutro",
            complejidad=1,
            condiciones="Normal",
            link="https://ejemplo.com/video1",
            nombre="Escena 1"
        )
        escena_2 = Escena.objects.create(
            idioma="Español",
            acento="neutro",
            complejidad=1,
            condiciones="Normal",
            link="https://ejemplo.com/video2",
            nombre="Escena 2"
        )

        # Create objectives
        objetivo_1 = Objetivo.objects.create(
            nombre="Objetivo 1",
            descripcion="Primer objetivo de prueba",
            escena=escena_1,
            centro_profesional=centro_prof
        )
        objetivo_2 = Objetivo.objects.create(
            nombre="Objetivo 2",
            descripcion="Segundo objetivo de prueba",
            escena=escena_2,
            centro_profesional=centro_prof
        )
        objetivo_3 = Objetivo.objects.create(
            nombre="Objetivo 3",
            descripcion="Tercer objetivo de prueba",
            escena=escena_1,
            centro_profesional=centro_prof
        )
        objetivo_4 = Objetivo.objects.create(
            nombre="Objetivo 4",
            descripcion="Cuarto objetivo de prueba",
            escena=escena_2,
            centro_profesional=centro_prof
        )
        objetivo_5 = Objetivo.objects.create(
            nombre="Objetivo 5",
            descripcion="Segundo objetivo de prueba",
            escena=escena_2,
            centro_profesional=centro_prof
        )
        objetivo_6 = Objetivo.objects.create(
            nombre="Objetivo 6",
            descripcion="Sexto objetivo de prueba",
            escena=escena_1,
            centro_profesional=centro_prof
        )
        objetivo_7 = Objetivo.objects.create(
            nombre="Objetivo 7",
            descripcion="Septimo objetivo de prueba",
            escena=escena_2,
            centro_profesional=centro_prof
        )

        Objetivoscumplir.objects.create(
            objetivo=objetivo_2,
            objetivo_previo=objetivo_1
        )

        # Create scene-objective relationship
        escena_obj_1 = EscenaObjetivo.objects.create(
            escena=escena_1,
            objetivo=objetivo_1
        )
        escena_obj_2 = EscenaObjetivo.objects.create(
            escena=escena_2,
            objetivo=objetivo_2
        )
        escena_obj_3 = EscenaObjetivo.objects.create(
            escena=escena_1,
            objetivo=objetivo_3
        )
        escena_obj_4 = EscenaObjetivo.objects.create(
            escena=escena_2,
            objetivo=objetivo_4
        )
        escena_obj_5 = EscenaObjetivo.objects.create(
            escena=escena_1,
            objetivo=objetivo_5
        )
        escena_obj_6 = EscenaObjetivo.objects.create(
            escena=escena_2,
            objetivo=objetivo_6
        )
        escena_obj_7 = EscenaObjetivo.objects.create(
            escena=escena_1,
            objetivo=objetivo_7
        )
        escena_obj_8 = EscenaObjetivo.objects.create(
            escena = escena_2,
            objetivo = objetivo_1
        )


        # Create person-objective-scene relationship
        persona_obj_esc_1 = PersonaObjetivoEscena.objects.create(
            user_id=paciente,
            escena_objetivo=escena_obj_1,
            orden=1,
            es_alternativo=False
        )
        persona_obj_esc_2 = PersonaObjetivoEscena.objects.create(
            user_id=paciente,
            escena_objetivo=escena_obj_2,
            orden=2,
            es_alternativo=False
        )
        persona_obj_esc_3 = PersonaObjetivoEscena.objects.create(
            user_id=paciente,
            escena_objetivo=escena_obj_3,
            orden=1,
            es_alternativo=False
        )
        persona_obj_esc_4 = PersonaObjetivoEscena.objects.create(
            user_id=paciente,
            escena_objetivo=escena_obj_4,
            orden=2,
            es_alternativo=False
        )
        persona_obj_esc_5 = PersonaObjetivoEscena.objects.create(
            user_id=paciente,
            escena_objetivo=escena_obj_5,
            orden=1,
            es_alternativo=False
        )
        persona_obj_esc_6 = PersonaObjetivoEscena.objects.create(
            user_id=paciente,
            escena_objetivo=escena_obj_6,
            orden=2,
            es_alternativo=False
        )
        persona_obj_esc_7 = PersonaObjetivoEscena.objects.create(
            user_id=paciente,
            escena_objetivo=escena_obj_7,
            orden=1,
            es_alternativo=False
        )

        # Create evaluation
        evaluacion = Evaluacion.objects.create(
            nombre="Evaluación 1",
            link="https://ejemplo.com/eval1",
            centro_salud_id=centro_prof,
            profesional_id=centro_prof
        )

        # Create person-objective-evaluation
        PersonaObjetivoEvaluacion.objects.create(
            user_id=paciente,
            objetivo_id=objetivo_1,
            resultado="Progresando bien",
            progreso=75,
            evaluacion=evaluacion
        )

        # Create group memberships
        Personagrupo.objects.create(
            user_id=paciente,
            grupo_id=grupo
        )
        
        Personagrupo.objects.create(
            user_id=terapeuta,
            grupo_id=grupo
        )

        # Create notifications
        Notificacion.objects.create(
            destinatario=terapeuta,
            remitente=admin,
            mensaje="Bienvenido al sistema",
            estado="pendiente",
            timestamp=datetime.now()
        )

        comentario_respuesta = Comentario.objects.create(
            persona_objetivo_escena=persona_obj_esc_1,
            texto="Lorem ipsum no me acuerdo como sigue...",
        )
        Comentario.objects.create(
            persona_objetivo_escena=persona_obj_esc_1,
            texto="Lorem ipsum no me acuerdo como sigue...",
            comentario_respondido=comentario_respuesta
        )

        Videosvistos.objects.create(
            persona_objetivo_escena=persona_obj_esc_1,
        )

        CentroProfesionalEscena.objects.create(
            escena_id=escena_1,
            centro_profesional=centro_prof
        )

        self.stdout.write(self.style.SUCCESS('Successfully loaded sample data'))