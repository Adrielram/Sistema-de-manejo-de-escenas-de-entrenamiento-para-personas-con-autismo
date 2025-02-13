import random
from api.models import RegistroEvaluacion, Objetivo, User, Escena, Patologia  # Se importa el modelo Patologia

# Mapeo de objetivos a sus escenas correspondientes.
# Se asume que el primer id es la escena con muy buena valoración y los demás son muy malas.
OBJETIVOS_ESCENAS = {
    1: [1, 2, 3],
    2: [4, 5, 6],
    3: [7, 8, 9],
}

def generar_resultado(edad, escena, tipo):
    """
    Genera un resultado de evaluación en función de la edad, la escena y el tipo de valoración.
    
    Parámetros:
      - edad: la edad del paciente.
      - escena: objeto Escena (se usa su propiedad 'complejidad' si se desea incorporar más lógica).
      - tipo: 'buena' o 'mala'.
    
    En este ejemplo se ignoran edad y complejidad para forzar el rango de la evaluación.
    """
    if tipo == 'buena':
        # Generar una evaluación alta (por ejemplo, entre 90 y 100).
        base_resultado = random.uniform(90, 100)
    else:
        # Generar una evaluación baja (por ejemplo, entre 10 y 30).
        base_resultado = random.uniform(10, 30)
    
    # Redondeamos el resultado a 2 decimales.
    return round(base_resultado, 2)

def poblar_registros(cantidad=500):
    paciente = User.objects.get(dni=40333444)  # Obtener el paciente específico
    objetivos = list(Objetivo.objects.filter(id__in=OBJETIVOS_ESCENAS.keys()))  # Objetivos 1, 2 y 3

    # Para cada objetivo, obtener las escenas en el orden definido.
    escenas_dict = {}
    for obj in objetivos:
        escena_ids = OBJETIVOS_ESCENAS[obj.id]
        # Se obtienen las escenas en el mismo orden definido en la lista.
        escenas = [Escena.objects.get(id=esc_id) for esc_id in escena_ids]
        escenas_dict[obj] = escenas

    # Obtener todas las patologías registradas en el sistema (se asume que hay 12)
    todas_patologias = list(Patologia.objects.all())
    registros = []
    for _ in range(cantidad):
        # Seleccionar un objetivo al azar.
        objetivo = random.choice(objetivos)
        escenas = escenas_dict[objetivo]
        
        # Decidir el tipo de valoración.
        # Se usa random.choices para que, en promedio, 1/3 de los registros tenga buena valoración.
        tipo = random.choices(['buena', 'mala', 'mala'], k=1)[0]
        
        if tipo == 'buena':
            # Se fuerza que la escena sea la primera (la de muy buena valoración).
            escena = escenas[0]
        else:
            # Se elige aleatoriamente entre las otras dos escenas.
            escena = random.choice(escenas[1:])
        
        edad = random.randint(5, 90)  # Edad aleatoria entre 5 y 90 años

        # Generar el resultado de la evaluación según el tipo.
        resultado = generar_resultado(edad, escena, tipo)

        # Seleccionar de forma aleatoria un subconjunto de patologías (al menos 1, y hasta las 12)
        num_patologias = random.randint(1, len(todas_patologias))
        patologias_asignadas = random.sample(todas_patologias, num_patologias)

        # Crear y almacenar el registro de evaluación.
        registro = RegistroEvaluacion(
            objetivo=objetivo,
            paciente=paciente,
            edad=edad,
            patologias=[patologia.id for patologia in patologias_asignadas],  # Asignar el subconjunto aleatorio de patologías
            escena=escena,
            complejidad=escena.complejidad,  # Se asume que Escena tiene la propiedad 'complejidad'
            resultado=resultado
        )
        registros.append(registro)

    # Insertar todos los registros en la base de datos en una sola operación.
    RegistroEvaluacion.objects.bulk_create(registros)
    print(f"✅ Se insertaron {cantidad} registros en la base de datos.")

# Ejecutar la función
poblar_registros(100)
