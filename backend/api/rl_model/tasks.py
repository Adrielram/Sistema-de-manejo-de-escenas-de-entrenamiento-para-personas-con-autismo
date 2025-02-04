'''from celery import shared_task
from .train import train_model

def check_new_data():
    from api.models import RegistroEvaluacion
    return RegistroEvaluacion.objects.count()

@shared_task
def train_if_needed():
    if check_new_data() >= 100:
        return train_model()
    return "No hay suficientes datos para entrenar"'''

# api/rl_model/tasks.py

import pandas as pd
from celery import shared_task
from api.models import RegistroEvaluacion

@shared_task
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
    df.to_csv("dataset_rl.csv", sep=";", index=False)

    return "Dataset generado correctamente."