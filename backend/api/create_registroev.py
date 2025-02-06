import random
from api.models import RegistroEvaluacion, Objetivo, User, Escena

# Mapeo de objetivos a sus escenas correspondientes
OBJETIVOS_ESCENAS = {
    1: [1, 2, 3],
    2: [4, 5, 6],
    3: [7, 8, 9],
}

def generar_resultado(edad, escena):
    """Genera un resultado de evaluación en función de la edad y la escena."""
    base_resultado = random.uniform(10, 100)  # Evaluación base en porcentaje

    # Modificar el resultado según la edad (cuanto mayor la edad, menor el resultado)
    base_resultado *= (100 - edad) / 100

    # Ajustar el resultado según la complejidad de la escena
    base_resultado -= escena.complejidad * 1.5  # La complejidad de la escena afecta el resultado

    # Asegurarse de que el resultado no sea menor que 10 ni mayor que 100
    return round(max(10, min(base_resultado, 100)), 2)

def poblar_registros(cantidad=500):
    paciente = User.objects.get(dni=40333444)  # Obtener el paciente específico
    objetivos = list(Objetivo.objects.filter(id__in=OBJETIVOS_ESCENAS.keys()))  # Objetivos 1, 2 y 3
    escenas_dict = {
        obj: list(Escena.objects.filter(id__in=OBJETIVOS_ESCENAS[obj.id])) for obj in objetivos
    }

    patologias_fijas = [1, 2]  # Siempre las mismas patologías para el paciente

    registros = []
    for _ in range(cantidad):
        objetivo = random.choice(objetivos)
        escena = random.choice(escenas_dict[objetivo])  # Escena válida según el objetivo
        edad = random.randint(5, 90)  # Edad aleatoria entre 5 y 90 años

        # Generar el resultado de la evaluación
        resultado = generar_resultado(edad, escena)

        # Crear y almacenar el registro de evaluación
        registro = RegistroEvaluacion(
            objetivo=objetivo,
            paciente=paciente,
            edad=edad,
            patologias=patologias_fijas,  # Siempre [4,5]
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
