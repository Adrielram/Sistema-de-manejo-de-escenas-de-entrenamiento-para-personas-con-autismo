import random
from itertools import combinations
from api.models import RegistroEvaluacion, Objetivo, User, Escena

def generar_patologias():
    """Genera un subconjunto aleatorio de patologías del 1 al 12, con posibilidad de ninguna."""
    patologias_disponibles = list(range(1, 13))  # Patologías del 1 al 12
    cantidad = random.randint(1, 5)  # Puede haber de 0 a 5 patologías por registro
    return random.sample(patologias_disponibles, cantidad)

def generar_resultado(edad, patologias, escena):
    """Genera un resultado de evaluación más sensible a las características del registro."""
    base_resultado = random.uniform(10, 100)  # Evaluación base en porcentaje
    
    # Modificar el resultado según la edad (cuanto mayor la edad, menor el resultado)
    base_resultado *= (100 - edad) / 100
    
    # Ajustar el resultado según las patologías (si tiene más patologías, la evaluación podría bajar)
    base_resultado -= len(patologias) * 2  # Cada patología podría restar 2 puntos
    
    # Ajustar el resultado según la complejidad de la escena
    base_resultado -= escena.complejidad * 1.5  # La complejidad de la escena afecta el resultado
    
    # Asegurarse de que el resultado no sea menor que 10 ni mayor que 100
    base_resultado = max(10, min(base_resultado, 100))
    
    return round(base_resultado, 2)

def poblar_registros(cantidad=500):
    paciente = User.objects.get(dni=40333444)  # Obtener el paciente específico
    objetivos = list(Objetivo.objects.filter(id__in=range(1, 7)))  # Objetivos del 1 al 6
    escenas = list(Escena.objects.filter(id__in=range(1, 10)))  # Escenas del 1 al 9

    registros = []
    for _ in range(cantidad):
        objetivo = random.choice(objetivos)
        escena = random.choice(escenas)
        edad = random.randint(5, 90)  # Edad aleatoria entre 5 y 90 años
        patologias = generar_patologias()  # Generar una lista aleatoria de patologías
        
        # Generar el resultado de la evaluación en función de la edad, patologías y escena
        resultado = generar_resultado(edad, patologias, escena)
        
        # Crear y almacenar el registro de evaluación
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
