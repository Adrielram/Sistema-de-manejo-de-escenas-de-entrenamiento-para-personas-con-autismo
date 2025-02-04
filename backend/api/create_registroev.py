import random
from itertools import combinations
from api.models import RegistroEvaluacion, Objetivo, User, Escena

def generar_patologias():
    """Genera un subconjunto aleatorio de patologías del 1 al 12, con posibilidad de ninguna."""
    patologias_disponibles = list(range(1, 13))  # Patologías del 1 al 12
    cantidad = random.randint(0, 5)  # Puede haber de 0 a 5 patologías por registro
    return random.sample(patologias_disponibles, cantidad)

def poblar_registros(cantidad=100):
    paciente = User.objects.get(dni=40333444)  # Obtener el paciente específico
    objetivos = list(Objetivo.objects.filter(id__in=range(1, 7)))  # Objetivos del 1 al 6
    escenas = list(Escena.objects.filter(id__in=range(1, 10)))  # Escenas del 1 al 9

    registros = []
    for _ in range(cantidad):
        objetivo = random.choice(objetivos)
        escena = random.choice(escenas)
        edad = random.randint(5, 90)  # Edad aleatoria entre 5 y 90 años
        patologias = generar_patologias()  # Generar una lista aleatoria de patologías
        resultado = round(random.uniform(10, 100), 2)  # Evaluación en porcentaje

        registro = RegistroEvaluacion(
            objetivo=objetivo,
            paciente=paciente,
            edad=edad,
            patologias=patologias,  # Lista aleatoria de patologías
            escena=escena,
            complejidad=escena.complejidad,  # Se asume que Escena tiene una propiedad 'complejidad'
            resultado=resultado
        )
        registros.append(registro)

    # Insertar todos los registros en la base de datos en una sola operación
    RegistroEvaluacion.objects.bulk_create(registros)
    print(f"✅ Se insertaron {cantidad} registros en la base de datos.")

# Ejecutar la función
poblar_registros(100)
