from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from datetime import datetime
from api.models import *
import mysql.connector
from django.conf import settings

class Command(BaseCommand):
    help = 'Loads sample data into database'

    def handle(self, *args, **options):
        # Conectar a MySQL y reiniciar la base de datos
        self.stdout.write("Resetting database...")
        try:
            db_config = {
                'host': settings.DATABASES['default']['HOST'],
                'user': settings.DATABASES['default']['USER'],
                'password': settings.DATABASES['default']['PASSWORD'],
                'port': settings.DATABASES['default'].get('PORT', 3306),
            }
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor()
            db_name = settings.DATABASES['default']['NAME']

            # Eliminar y volver a crear la base de datos
            cursor.execute(f"DROP DATABASE IF EXISTS {db_name};")
            cursor.execute(f"CREATE DATABASE {db_name};")
            connection.commit()

            self.stdout.write(f"Database {db_name} reset successfully.")
        except mysql.connector.Error as err:
            self.stderr.write(f"Error resetting database: {err}")
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()

        # Aplicar las migraciones
        self.stdout.write("Applying migrations...")
        from django.core.management import call_command
        call_command('makemigrations')
        call_command('migrate')

        # Cargar los datos
        self.stdout.write("Loading sample data...")
        self.load_sample_data()

    def load_sample_data(self, *args, **options):
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
        
        paciente2 = User.objects.create(
            username="paciente2",
            password=make_password("pac123"),
            dni=44333222,
            nombre="Paciente Dos",
            fecha_nac=datetime(2010, 5, 20),
            genero="M",
            role="paciente",
            direccion_id_dir=residencias[1]
        )

        paciente3 = User.objects.create(
            username="paciente3",
            password=make_password("pac123"),
            dni=44112233,
            nombre="Paciente Tres",
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

        # Create condiciones
        condicion1 = Condicion.objects.create(
            edad= 10
        )


        # Create scenes
        escena_1 = Escena.objects.create(
            idioma="Español",
            acento="neutro",
            complejidad=1,
            link="https://ejemplo.com/video1",
            nombre="Escena 1",
            descripcion = "Esta escena reflexiona sobre la importancia de la amistad"
        )
        escena_2 = Escena.objects.create(
            idioma="Español",
            acento="neutro",
            complejidad=1,
            link="https://ejemplo.com/video2",
            nombre="Escena 2",
            descripcion = "Esta escena refleja la importancia de la familia"

        )
        escena_3 = Escena.objects.create(
            idioma="Español",
            acento="neutro",
            complejidad=2,
            link="https://ejemplo.com/video3",
            nombre="Escena 3",
            descripcion = "Esta escena demuestra la importancia de la educación"

        )
        escena_4 = Escena.objects.create(
            idioma="Español",
            acento="neutro",
            complejidad=4,
            link="https://ejemplo.com/video4",
            nombre="Escena 4",
            descripcion = "Esta escena refuerza la importancia de la juventud"
        )
        escena_5 = Escena.objects.create(
            idioma="Español",
            acento="neutro",
            complejidad=3,
            link="https://ejemplo.com/video5",
            nombre="Escena 5",
            descripcion = "Esta escena refleja la importancia del viaje antes que el destino"

        )
        escena_6 = Escena.objects.create(
            idioma="Español",
            acento="neutro",
            complejidad=5,
            link="https://ejemplo.com/video6",
            nombre="Escena 6",
            descripcion = "Esta escena refuerza la importancia de la juventud"
        )
        ##estos tienen video que funciona
        escena_7 = Escena.objects.create(
            idioma="Español",
            acento="neutro",
            complejidad=1,
            condicion= condicion1,
            link="https://drive.google.com/file/d/17RTqxuu9WPX5Nwvs1h3s7wuQh5ldDDTz/preview",
            nombre="Escena 1",
            descripcion = "Esta escena aclara la importancia de los abuelos"
        )
        escena_8 = Escena.objects.create(
            idioma="Español",
            acento="neutro",
            complejidad=1,
            link="https://drive.google.com/file/d/1qzY31odKmd2FlrjU0VK4dkfezlzEcoaJ/preview",
            nombre="Escena 2",
            descripcion = "Esta escena muestra la vida en la fabella"
        )
        escena_9 = Escena.objects.create(
            idioma="Español",
            acento="neutro",
            complejidad=1,
            link="https://drive.google.com/file/d/1yPgHYRagTJXTqlrGhNkZDEy5zNY4-f77/preview",
            nombre="Escena 3",
            descripcion = "Esta escena recomienda comportamientos bajo"
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
            escena=escena_3,
            centro_profesional=centro_prof
        )
        objetivo_3 = Objetivo.objects.create(
            nombre="Este es el que funca (messi)",
            descripcion="Tenes que vencer a goku",
            escena=escena_5,
            centro_profesional=centro_prof
        )
        objetivo_4 = Objetivo.objects.create(
            nombre="CR7",
            descripcion="Tenes que vencer a vegeta",
            escena=escena_6,
            centro_profesional=centro_prof
        )
        objetivo_5 = Objetivo.objects.create(
            nombre="Ronaldinho",
            descripcion="Tenes que vencer a krillin",
            escena=escena_6,
            centro_profesional=centro_prof
        )
        objetivo_6 = Objetivo.objects.create(
            nombre="neymar",
            descripcion="Tenes que vencer a yamcha",
            escena=escena_1,
            centro_profesional=centro_prof
        )

        Objetivoscumplir.objects.create(
            objetivo=objetivo_2,
            objetivo_previo=objetivo_1
        )

        # Create scene-objective relationship
        escena_obj_1 = EscenaObjetivo.objects.create(
            escena=escena_2,
            objetivo=objetivo_1
        )
        escena_obj_2 = EscenaObjetivo.objects.create(
            escena=escena_4,
            objetivo=objetivo_2
        )
        escena_obj_3 = EscenaObjetivo.objects.create(
            escena=escena_7,
            objetivo=objetivo_3,
            orden= 1
        )
        escena_obj_4 = EscenaObjetivo.objects.create(
            escena=escena_8,
            objetivo=objetivo_3,
            orden= 2
            
        )
        escena_obj_5 = EscenaObjetivo.objects.create(
            escena=escena_9,
            objetivo=objetivo_3,
        )
        escena_obj_6 = EscenaObjetivo.objects.create(
            escena=escena_7,
            objetivo=objetivo_4
        )
        escena_obj_7 = EscenaObjetivo.objects.create(
            escena=escena_8,
            objetivo=objetivo_5
        )
        escena_obj_8 = EscenaObjetivo.objects.create(
            escena=escena_9,
            objetivo=objetivo_6
        )

        # Create person-objective-scene relationship
        persona_obj_esc_1 = PersonaObjetivoEscena.objects.create(
            user_id=paciente,
            escena_objetivo=escena_obj_3,

        )
        persona_obj_esc_2 = PersonaObjetivoEscena.objects.create(
            user_id=paciente,
            escena_objetivo=escena_obj_4,
        )
        persona_obj_esc_3 = PersonaObjetivoEscena.objects.create(
            user_id=paciente,
            escena_objetivo=escena_obj_5,
        )
        persona_obj_esc_4 = PersonaObjetivoEscena.objects.create(
            user_id=paciente,
            escena_objetivo=escena_obj_1,
        )
        persona_obj_esc_5 = PersonaObjetivoEscena.objects.create(
            user_id=paciente,
            escena_objetivo=escena_obj_2,
        )

        formulario_1 = Formulario.objects.create(
            nombre="Formulario 1",
            descripcion="Lorem ipsum dolor anda a saber como sigue...",
            es_verificacion_automatica=True,
            creado_por=terapeuta,
            fecha_creacion=datetime.now()
        )
        formulario_2= Formulario.objects.create(
            nombre="Formulario 2",
            descripcion="Lorem ipsum dolor anda a saber como sigue...",
            es_verificacion_automatica=True,
            creado_por=terapeuta,
            fecha_creacion=datetime.now()
        )
        Formulario.objects.create(
            nombre="Formulario 3",
            descripcion="Lorem ipsum dolor anda a saber como sigue...",
            es_verificacion_automatica=True,
            creado_por=terapeuta,
            fecha_creacion=datetime.now()
        )
        Formulario.objects.create(
            nombre="Formulario 4",
            descripcion="Lorem ipsum dolor anda a saber como sigue...",
            es_verificacion_automatica=True,
            creado_por=terapeuta,
            fecha_creacion=datetime.now()
        )
        Formulario.objects.create(
            nombre="Formulario 5",
            descripcion="Lorem ipsum dolor anda a saber como sigue...",
            es_verificacion_automatica=True,
            creado_por=terapeuta,
            fecha_creacion=datetime.now()
        )
        Formulario.objects.create(
            nombre="Formulario 6",
            descripcion="Lorem ipsum dolor anda a saber como sigue...",
            es_verificacion_automatica=True,
            creado_por=terapeuta,
            fecha_creacion=datetime.now()
        )

        # Añadir preguntas al Formulario 1
        pregunta_1 = Pregunta.objects.create(
            formulario=formulario_1,
            texto="¿Cuál es la capital de Francia?",
            tipo="multiple-choice",
            correcta="París"
        )

        Opcion.objects.create(pregunta=pregunta_1, texto="Madrid")
        Opcion.objects.create(pregunta=pregunta_1, texto="Roma")
        Opcion.objects.create(pregunta=pregunta_1, texto="París")
        Opcion.objects.create(pregunta=pregunta_1, texto="Berlín")

        pregunta_2 = Pregunta.objects.create(
            formulario=formulario_1,
            texto="Escribe una breve descripción sobre tu día.",
            tipo="respuesta-corta"
        )

        pregunta_3 = Pregunta.objects.create(
            formulario=formulario_1,
            texto="Describe tus objetivos para la semana.",
            tipo="respuesta-larga"
        )

        # Añadir preguntas al Formulario 2
        pregunta_4 = Pregunta.objects.create(
            formulario=formulario_2,
            texto="¿Qué color es el cielo durante un día despejado?",
            tipo="multiple-choice",
            correcta="Azul"
        )

        Opcion.objects.create(pregunta=pregunta_4, texto="Rojo")
        Opcion.objects.create(pregunta=pregunta_4, texto="Amarillo")
        Opcion.objects.create(pregunta=pregunta_4, texto="Azul")
        Opcion.objects.create(pregunta=pregunta_4, texto="Verde")

        pregunta_5 = Pregunta.objects.create(
            formulario=formulario_2,
            texto="¿Cuál es tu plato favorito?",
            tipo="respuesta-corta"
        )


        # Create person-objective-evaluation
        PersonaObjetivoEvaluacion.objects.create(
            user_id=paciente,
            objetivo_id=objetivo_3,
            resultado="Progresando bien",
            progreso=75,
            evaluacion=formulario_1
        )
        PersonaObjetivoEvaluacion.objects.create(
            user_id=paciente,
            objetivo_id=objetivo_3,
            resultado="Re mal",
            progreso=0,
            evaluacion=formulario_2
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

        comentario_respuesta = Comentario.objects.create(
            user=paciente,
            escena=escena_1,
            texto="En el minuto 1:31 no entiendo que dice el letrero",
        )
        Comentario.objects.create(
            user=terapeuta,
            escena=escena_1,
            texto="El letrero dice aguante messi",
            comentario_contestado=comentario_respuesta
        )

        Videosvistos.objects.create(
            paciente_id=paciente,
            escena_id=escena_1
        )

        CentroProfesionalEscena.objects.create(
            escena_id=escena_1,
            centro_profesional=centro_prof
        )
        
        # Ansiedad Social
        Patologia.objects.create(
            nombre="Ansiedad Social",
            descripcion="Miedo a interacciones; Interpretación errónea de señales sociales; Vergüenza/temor al rechazo; Fobia social, evaluación negativa, interpretación distorsionada, evitación social, timidez extrema, miedo al juicio, Miedo a hablar en grupo, me muero si me miran, no puedo mirar a los ojos, temblores cuando hablo"
        )

        # Ansiedad Sensorial
        Patologia.objects.create(
            nombre="Ansiedad Sensorial",
            descripcion="Dolor a los sonidos fuertes de una discoteca, me molestan las luces brillantes, no soporto que me toquen, Sobrecarga por ruidos; Hipersensibilidad táctil; Incomodidad con luces/texturas;  Sobrecarga neurológica, hiperestimulación, umbral sensorial bajo, defensividad sensorial, intolerancia a estímulos"
        )

        # Ansiedad por Espera
        Patologia.objects.create(
            nombre="Ansiedad por Espera",
            descripcion="Me estreso si cambian los planes, necesito saber todo con anticipación, no me gusta lo imprevisto, Necesidad de predictibilidad; Frustración por desorden; Ansiedad por rutinas interrumpidas;  Rigidez cognitiva, necesidad de control, predicción compulsiva, intransigencia, disrupciones de esquema"
        )

        # Ansiedad Comunicacional
        Patologia.objects.create(
            nombre="Ansiedad Comunicacional",
            descripcion="No sé explicar lo que siento, me cuesta hablar, me bloqueo cuando tengo que comunicar algo, Dificultad para expresarse; Malentendidos frecuentes; Problemas con lenguaje no verbal; Déficit pragmático, comunicación atípica, disregulación emocional, malinterpretación contextual, barrera lingüística"
        )

        # Ansiedad de Interacción
        Patologia.objects.create(
            nombre="Ansiedad de Interacción",
            descripcion="Pánico en fiestas, no sé cómo empezar una conversación, me dan ganas de irme, Miedo a situaciones nuevas; Pánico en ambientes sociales; Dificultad para iniciar conversaciones; Inhibición social, parálisis conversacional, evitación relacional, ansiedad de encuentro, bloqueo interpersonal"
        )

        # Trastornos de Ansiedad
        Patologia.objects.create(
            nombre="Trastornos de Ansiedad",
            descripcion="Mil preocupaciones a la vez, mi cabeza no para de dar vueltas, Conjunto de trastornos que incluyen diversos tipos de ansiedad; Desregulación emocional, hiperactivación autonómica, espectro ansioso, manifestaciones psicofisiológicas"
        )

        # Ansiedad Generalizada
        Patologia.objects.create(
            nombre="Ansiedad Generalizada",
            descripcion="Me preocupo por todo, siempre pensando en lo peor, nervios constantes, Preocupación excesiva y persistente sobre varias áreas de la vida; Preocupación persistente, catastrofización, rumiación cognitiva, tensión crónica, anticipación negativa"
        )

        # Ansiedad Anticipatoria
        Patologia.objects.create(
            nombre="Ansiedad Anticipatoria",
            descripcion="Ya me estoy imaginando que va a salir mal, no puedo dejar de pensar en lo que viene, Ansiedad sobre eventos futuros, anticipando resultados negativos; Proyección negativa, escenarios catastróficos, preocupación prospectiva, miedo predictivo, antelación angustiante"
        )

        # Trastornos Sensoriales
        Patologia.objects.create(
            nombre="Trastornos Sensoriales",
            descripcion="El mundo me abruma, demasiados estímulos, no puedo procesarlo todo, Alteraciones en la percepción sensorial que afectan el procesamiento de estímulos; Disregulación perceptiva, alteración neurológica, procesamiento atípico, umbral sensorial desajustado"
        )

        # Hipersensibilidad Sensorial
        Patologia.objects.create(
            nombre="Hipersensibilidad Sensorial",
            descripcion="Me molesta todo, ruidos me descontrolan, texturas me alteran, Respuesta exagerada a estímulos sensoriales normales; Sensibilidad exacerbada, respuesta hiperdinámica, umbral de tolerancia reducido, reactivididad sensorial"
        )

        # Trastornos del Neurodesarrollo
        Patologia.objects.create(
            nombre="Trastornos del Neurodesarrollo",
            descripcion="Mi cerebro funciona distinto, no proceso igual que los demás, Conjunto de trastornos que afectan el desarrollo neurológico y comportamiento; Desviación neurocognitiva, atipicidad neurológica, desarrollo neuronal divergente, variabilidad neurofuncional"
        )

        # Trastorno de Procesamiento Sensorial
        Patologia.objects.create(
            nombre="Trastorno de Procesamiento Sensorial",
            descripcion=" Información sensorial me supera, no filtro bien los estímulos, Dificultad en la organización y respuesta a la información sensorial; Integración sensorial deficiente, modulación neurológica alterada, respuesta sensorial desorganizada"
        )

        PersonaPatologia.objects.create(
            user_id=paciente,
            patologia_id=Patologia.objects.get(nombre="Ansiedad Sensorial")
        )

        PersonaPatologia.objects.create(
            user_id=paciente,
            patologia_id=Patologia.objects.get(nombre="Ansiedad Social")
        )

        PersonaPatologia.objects.create(
            user_id=paciente,
            patologia_id=Patologia.objects.get(nombre="Trastornos de Ansiedad")
        )

        PersonaPatologia.objects.create(
            user_id=paciente,
            patologia_id=Patologia.objects.get(nombre="Hipersensibilidad Sensorial")
        )


        PersonaPatologia.objects.create(
            user_id=paciente2,
            patologia_id=Patologia.objects.get(nombre="Ansiedad Comunicacional")
        )

        PersonaPatologia.objects.create(
            user_id=paciente2,
            patologia_id=Patologia.objects.get(nombre="Ansiedad de Interacción")
        )

        PersonaPatologia.objects.create(
            user_id=paciente2,
            patologia_id=Patologia.objects.get(nombre="Ansiedad Anticipatoria")
        )

        PersonaPatologia.objects.create(
            user_id=paciente2,
            patologia_id=Patologia.objects.get(nombre="Trastornos del Neurodesarrollo")
        )

        PersonaPatologia.objects.create(
            user_id=paciente3,
            patologia_id=Patologia.objects.get(nombre="Ansiedad por Espera")
        )

        PersonaPatologia.objects.create(
            user_id=paciente3,
            patologia_id=Patologia.objects.get(nombre="Ansiedad Generalizada")
        )

        PersonaPatologia.objects.create(
            user_id=paciente3,
            patologia_id=Patologia.objects.get(nombre="Trastornos Sensoriales")
        )

        PersonaPatologia.objects.create(
            user_id=paciente3,
            patologia_id=Patologia.objects.get(nombre="Trastorno de Procesamiento Sensorial")
        )

        self.stdout.write(self.style.SUCCESS('Successfully loaded sample data'))