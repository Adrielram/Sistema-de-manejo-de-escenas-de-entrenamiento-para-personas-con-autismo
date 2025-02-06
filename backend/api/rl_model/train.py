# api/rl_model/train.py
import os
import shutil
import ray
from ray.rllib.algorithms.ppo import PPOConfig, PPO
from .env import RecommenderEnv
from api.rl_model.rl_model_manager import RLModelManager
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
        .training(
            train_batch_size=256,  # Reducido para evitar sobreajuste            
            num_sgd_iter=10,  # Iteraciones en cada batch (menor es más estable)
            gamma=0.95,  # Descuento para evitar sesgo en recompensas a largo plazo
            lambda_=0.95,  # Parámetro de ventaja generalizada (GAE)
            lr=5e-4,  # Aprendizaje moderado (antes de probar tuning)
            entropy_coeff=0.01,  # Aumentar para evitar convergencia temprana
            clip_param=0.2,  # PPO clipping estándar
            vf_loss_coeff=1.0,  # Equilibrar política y función de valor
        )
        .resources(num_gpus=0)
    )

    # Cargar el último checkpoint si existe
    trainer = config.build()
    if os.path.exists(CHECKPOINT_DIR):
        print(f"Cargando el checkpoint desde {CHECKPOINT_DIR}")
        trainer.restore(CHECKPOINT_DIR)  # Ahora con ruta absoluta

    # Entrenar el modelo
    # Prueba con 500 iteraciones primero
    for i in range(100):  
        result = trainer.train()
        episode_reward_mean = result['env_runners'].get('episode_reward_mean', None)
        total_loss = result['info']['learner']['default_policy']['learner_stats']['total_loss']
        print(f"Iteración: {result['training_iteration']}, Recompensa media: {episode_reward_mean}, Total Loss: {total_loss}")
     

        '''# Condición de parada anticipada si la recompensa se estabiliza
        if i > 50 and abs(episode_reward_mean - prev_reward) < 0.01:
            print("La recompensa se ha estabilizado, deteniendo el entrenamiento.")
            break
        
        prev_reward = episode_reward_mean'''


    # Borrar el checkpoint anterior si existe
    if os.path.exists(CHECKPOINT_DIR):
        shutil.rmtree(CHECKPOINT_DIR)    
    
    trainer.save(CHECKPOINT_DIR)       

    # Actualizar el modelo global con el nuevo checkpoint
    rl_manager = RLModelManager()
    rl_manager.update_model()
    print("Modelo actualizado en memoria.")

    return CHECKPOINT_DIR