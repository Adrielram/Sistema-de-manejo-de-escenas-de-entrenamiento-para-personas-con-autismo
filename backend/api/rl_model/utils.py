# api/rl_model/utils.py
def safe_eval(value):
    import ast
    if isinstance(value, str):
        try:
            return ast.literal_eval(value)
        except (SyntaxError, ValueError):
            return []
    elif isinstance(value, list):
        return value
    else:
        return []
    
import numpy as np
from django.conf import settings

def create_observation(objetivo_id, edad, patologias, num_patologias, max_objetivo_id, num_escenas):
    """
    Crea una observación (estado) para el modelo de recomendación.
    Ajusta los índices de los datos correctamente.
    """   

    objetivo_id = float((objetivo_id - 1) / (max_objetivo_id - 1))
    print("OBJETIVO_ID observacion: ",objetivo_id)
    escenas_vistas = np.zeros(num_escenas)
    # Vector de patologías en formato one-hot
    patologias_one_hot = np.zeros(num_patologias)
    print("patologias lenght ",len(patologias_one_hot))
    for p in patologias:
        p_index = p - 1  # Convertir a índice basado en 0
        if 0 <= p_index < num_patologias:
            patologias_one_hot[p_index] = 1
        else:
            raise ValueError(f"Patología {p} está fuera del rango válido (1-{num_patologias}).")


    # Construir la observación
    observation = np.concatenate([[objetivo_id, edad / 100.0], patologias_one_hot, escenas_vistas])
    return observation.astype(np.float32)

import os
import pandas as pd
from api.rl_model.rl_model_manager import RLModelManager
from django.http import JsonResponse

DATASET_PATH = os.path.abspath("api/rl_model/data/dataset_rl.csv")  # Ajusta según el nombre real

def get_recommendation(objetivo_id, edad, patologias):
    """
    Obtiene una recomendación basada en el modelo de IA almacenado en `settings.modelo_ia`.
    """
    # Definir el número de patologías fijo
    num_patologias = 12

    # Cargar dataset y calcular el número máximo de escenas
    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(f"No se encontró el dataset en {DATASET_PATH}")

    df = pd.read_csv(DATASET_PATH, sep=";")
    
    if "Escena" not in df.columns:
        raise ValueError("La columna 'Escena' no existe en el dataset")
    
    max_objetivo_id = df["Objetivo ID"].max() # Obtener el máximo ID de objetivo
    num_escenas = df["Escena"].max() # Obtener el número máximo de escenas
    # Crear observación
    observation = create_observation(objetivo_id, edad, patologias, num_patologias, max_objetivo_id, num_escenas)
    print("Observación enviada al modelo:", observation)

    rl_manager = RLModelManager.get_instance()

    # 🚨 Agregar depuración
    print(f"🛠 Instancia de RLManager obtenida: {rl_manager}")
    print(f"📊 Modelo cargado en la instancia: {rl_manager.model}")

    if rl_manager.model is None:
        print("El modelo no está cargado. No se puede hacer una recomendación.")
    else:
        result = rl_manager.model.compute_single_action(observation, explore=False, full_fetch=True)
        print("Resultado completo:", result)        
        action = result[0]        
        return int(action) + 1