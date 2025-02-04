# api/rl_model/train.py
import os
import shutil
import ray
from ray.rllib.algorithms.ppo import PPOConfig, PPO
from .env import RecommenderEnv

# Convertir a ruta absoluta
CHECKPOINT_DIR = os.path.abspath("api/rl_model/data/checkpoint")

def train_model():
    ray.shutdown()
    ray.init(ignore_reinit_error=True)

    # Configurar el entrenamiento
    config = (
        PPOConfig()
        .environment(RecommenderEnv)
        .framework("torch")
        .training(lr=0.001, train_batch_size=128, gamma=0.99)
        .resources(num_gpus=0)
    )

    # Cargar el último checkpoint si existe
    trainer = config.build()
    if os.path.exists(CHECKPOINT_DIR):
        print(f"Cargando el checkpoint desde {CHECKPOINT_DIR}")
        trainer.restore(CHECKPOINT_DIR)  # Ahora con ruta absoluta

    # Entrenar el modelo
    for i in range(30):
        result = trainer.train()
        print(f"Iteración: {result['training_iteration']}")

    # Borrar el checkpoint anterior si existe
    if os.path.exists(CHECKPOINT_DIR):
        shutil.rmtree(CHECKPOINT_DIR)

    # Guardar el nuevo checkpoint
    checkpoint_path = trainer.save(CHECKPOINT_DIR)
    print(f"Nuevo checkpoint guardado en: {CHECKPOINT_DIR}")

    return CHECKPOINT_DIR
