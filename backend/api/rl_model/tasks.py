'''from celery import shared_task
from .train import train_model

def check_new_data():
    from api.models import RegistroEvaluacion
    return RegistroEvaluacion.objects.count()

@celery_app.task(name="train_if_needed")
def train_if_needed():
    if check_new_data() >= 100:
        return train_model()
    return "No hay suficientes datos para entrenar"'''

# api/rl_model/tasks.py

import pandas as pd
from backendapp.celery import celery_app
from api.models import RegistroEvaluacion

@celery_app.task(name="generar_dataset")
def generar_dataset():
    """Genera el dataset_rl.csv a partir de la tabla RegistroEvaluacion."""
    registros = RegistroEvaluacion.objects.all()

    # Convertir datos a lista de diccionarios
    data = [
        {
            "Objetivo ID": reg.objetivo.id,
            "Edad": reg.edad,
            "Patologias": reg.patologias,  # Esto es JSON, lo manejamos como lista
            "Escena": reg.escena.id,
            "Complejidad": reg.complejidad,
            "Evaluacion": float(reg.resultado),
        }
        for reg in registros
    ]

    # Crear DataFrame y guardar como CSV
    df = pd.DataFrame(data)
    df.to_csv("api/rl_model/data/dataset_rl.csv", sep=";", index=False)

    return "Dataset generado correctamente."



from api.models import RegistroEvaluacion, EntrenamientoRegistro
from .train import train_model

@celery_app.task(name="train_if_needed")
def train_if_needed():
    # Obtener la última cantidad registrada
    registro, created = EntrenamientoRegistro.objects.get_or_create(id=1)

    # Obtener el conteo actual de tuplas
    cantidad_actual = RegistroEvaluacion.objects.count()

    # Si hay 100 nuevas tuplas, entrenar el modelo
    if cantidad_actual - registro.ultima_cantidad >= 100:
        train_model()
        # Actualizar el registro con el nuevo conteo
        registro.ultima_cantidad = cantidad_actual
        registro.save()
        return "Modelo entrenado con éxito"

    return "No hay suficientes datos nuevos para entrenar"
