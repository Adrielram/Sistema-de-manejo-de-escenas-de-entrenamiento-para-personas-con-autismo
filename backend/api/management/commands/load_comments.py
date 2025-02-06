from django.core.management.base import BaseCommand
from api.models import Escena, Comentario, User


class Command(BaseCommand):
    help = "Crea datos de prueba para comentarios y escenas"

    def handle(self, *args, **kwargs):
        # Llama a la función para crear los datos de prueba
        self.crear_datos_prueba()

    def crear_datos_prueba(self):
        # Crear una escena
        escena = Escena.objects.create(
            idioma="Español",
            acento="neutro",
            complejidad=3,
            condiciones="Sin restricciones",
            link="https://ejemplo.com/escena1",
            nombre="Escena 1"
        )

        print(f"Escena creada con ID: {escena.id}")

        # Obtener usuarios por sus DNIs
        usuarios_dni = [100, 101, 102, 43305894]
        usuarios = User.objects.filter(dni__in=usuarios_dni)
        usuarios_dict = {user.dni: user for user in usuarios}

        # Validar que todos los usuarios existen
        if len(usuarios) != len(usuarios_dni):
            raise ValueError("No se encontraron todos los usuarios especificados por DNI.")

        # Crear comentarios principales y secundarios
        # Comentario 1 (principal)
        comentario_1 = Comentario.objects.create(
            user=usuarios_dict[100],
            escena=escena,
            texto="Este es el comentario principal 1",
            visibilidad=True,
            comentario_contestado=None  # Es un comentario principal
        )

        # Comentario 2 (responde a 1)
        comentario_2 = Comentario.objects.create(
            user=usuarios_dict[101],
            escena=escena,
            texto="Este comentario responde al comentario principal 1",
            visibilidad=True,
            comentario_contestado=comentario_1
        )

        # Comentario 3 (responde también a 1)
        comentario_3 = Comentario.objects.create(
            user=usuarios_dict[102],
            escena=escena,
            texto="Otro comentario que responde al comentario principal 1",
            visibilidad=True,
            comentario_contestado=comentario_1
        )

        # Comentario 4 (responde a 2)
        comentario_4 = Comentario.objects.create(
            user=usuarios_dict[43305894],
            escena=escena,
            texto="Este comentario responde al comentario 2",
            visibilidad=True,
            comentario_contestado=comentario_2
        )

        # Comentario 5 (responde a 4)
        comentario_5 = Comentario.objects.create(
            user=usuarios_dict[100],
            escena=escena,
            texto="Este comentario responde al comentario 4",
            visibilidad=True,
            comentario_contestado=comentario_4
        )
        # Comentario 5 (responde a 4)
        comentario_6 = Comentario.objects.create(
            user=usuarios_dict[100],
            escena=escena,
            texto="Principal 2",
            visibilidad=True,
            comentario_contestado=None
        )
        # Comentario 5 (responde a 4)
        comentario_7 = Comentario.objects.create(
            user=usuarios_dict[101],
            escena=escena,
            texto="Secu 2",
            visibilidad=True,
            comentario_contestado=comentario_6
        )
        # Comentario 5 (responde a 4)
        comentario_8 = Comentario.objects.create(
            user=usuarios_dict[101],
            escena=escena,
            texto="Secu 2",
            visibilidad=True,
            comentario_contestado=comentario_3
        )
        # Comentario 5 (responde a 4)
        comentario_9 = Comentario.objects.create(
            user=usuarios_dict[101],
            escena=escena,
            texto="Secu 2",
            visibilidad=True,
            comentario_contestado=comentario_7
        )

        print("Comentarios creados:")
        print(f"Comentario 1: {comentario_1.id}")
        print(f"Comentario 2: {comentario_2.id}")
        print(f"Comentario 3: {comentario_3.id}")
        print(f"Comentario 4: {comentario_4.id}")
        print(f"Comentario 5: {comentario_5.id}")
