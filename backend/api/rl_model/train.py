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

    config = (
        PPOConfig()
        .environment(RecommenderEnv)
        .framework("torch")
        .training(
            lr=0.0003,  # Reducir el learning rate para más estabilidad
            train_batch_size=256,  # Batch más grande para estabilidad
            gamma=0.99,  
            entropy_coeff=0.01  # Promueve exploración balanceada
        )
        .resources(num_gpus=0)        
    )

    '''.exploration(exploration_config={ 
            "type": "EpsilonGreedy",
            "initial_epsilon": 1.0,  
            "final_epsilon": 0.05,  
            "epsilon_timesteps": 500  # Exploración más gradual
        })'''

    # Cargar el último checkpoint si existe
    trainer = config.build()
    if os.path.exists(CHECKPOINT_DIR):
        print(f"Cargando el checkpoint desde {CHECKPOINT_DIR}")
        trainer.restore(CHECKPOINT_DIR)  # Ahora con ruta absoluta

    # Entrenar el modelo
    # Prueba con 500 iteraciones primero
    for i in range(10):  
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
    rl_manager = RLModelManager()  # Cargar nueva instancia con el modelo actualizado
    rl_manager.load_model()
    print(f"🛠 Instancia de RLManager obtenida luego de entrenamiento: {rl_manager}")
    print("Modelo en memoria después de entrenar:", rl_manager.model)
    print("Modelo actualizado en memoria.")

    return CHECKPOINT_DIR