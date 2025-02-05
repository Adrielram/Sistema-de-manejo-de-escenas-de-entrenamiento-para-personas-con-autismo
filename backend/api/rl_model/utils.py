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

def create_observation(objetivo_id, edad, patologias, num_patologias, num_escenas):
    """
    Crea una observación (estado) para el modelo de recomendación.
    """
    patologias_one_hot = np.zeros(num_patologias)
    for p in patologias:
        patologias_one_hot[p] = 1  # Se asume que `p` es un índice válido

    escenas_vistas = np.zeros(num_escenas)  # Inicialmente no ha visto ninguna escena

    observation = np.concatenate([[objetivo_id, edad], patologias_one_hot, escenas_vistas])
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

    num_escenas = df["Escena"].max()  # Obtener el número máximo de escenas
    
    # Crear observación
    observation = create_observation(objetivo_id, edad, patologias, num_patologias, num_escenas)
    print("Observación enviada al modelo:", observation)

    rl_manager = RLModelManager()    
    if rl_manager.model is None:
        raise ValueError("El modelo no esta cargado")
    else:
        result = rl_manager.model.compute_single_action(observation, explore=False, full_fetch=True)
        print("Resultado completo:", result)        
        action = result[0]        
        return int(action)+1  