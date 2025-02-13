# api/rl_model/train.py
import os
import shutil
from ray import tune, train
from ray.tune.schedulers import ASHAScheduler
import numpy as np
import ray
from ray.rllib.algorithms.ppo import PPOConfig, PPO
from .env import RecommenderEnv
from api.rl_model.rl_model_manager import RLModelManager
# Convertir a ruta absoluta
CHECKPOINT_DIR = os.path.abspath("api/rl_model/data/checkpoint")

def evaluate_model(trainer, env, num_episodes=10):
    rewards = []
    for _ in range(num_episodes):
        state, _ = env.reset()
        done = False
        episode_reward = 0
        while not done:
            action = trainer.compute_single_action(state)
            state, reward, done, _, _ = env.step(action)
            episode_reward += reward
        rewards.append(episode_reward)
    print(f"Recompensas promedio por episodio: {np.mean(rewards)}")

import requests
def train_model():
    ray.shutdown()
    import faulthandler
    faulthandler.disable()
    ray.init(ignore_reinit_error=True)
    config = (
        PPOConfig()
        .environment(RecommenderEnv)
        .framework("torch")
        .training(
            lr=0.00942397,  # Reducir el learning rate para más estabilidad
            train_batch_size=512,  # Batch más grande para estabilidad
            gamma=0.98,  
            entropy_coeff=0.0151845,  # Promueve exploración balanceada
            clip_param=0.269169
        )
        .exploration(exploration_config={ 
            "type": "EpsilonGreedy",
            "initial_epsilon": 1.0,
            "final_epsilon": 0.05,
            "epsilon_timesteps": 500  # Exploración más gradual
        })
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
    for i in range(30):  
        result = trainer.train()
        episode_reward_mean = result['env_runners'].get('episode_reward_mean', None)
        total_loss = result['info']['learner']['default_policy']['learner_stats']['total_loss']
        print(f"Iteración: {result['training_iteration']}, Recompensa media: {episode_reward_mean}, Total Loss: {total_loss}")
     

        '''# Condición de parada anticipada si la recompensa se estabiliza
        if i > 50 and abs(episode_reward_mean - prev_reward) < 0.01:
            print("La recompensa se ha estabilizado, deteniendo el entrenamiento.")
            break
        
        prev_reward = episode_reward_mean
'''
# CODIGO DE TRAIN PERO CON TUNE:





    # Borrar el checkpoint anterior si existe
    if os.path.exists(CHECKPOINT_DIR):
        shutil.rmtree(CHECKPOINT_DIR)    
    
    trainer.save(CHECKPOINT_DIR)     
    '''rl_manager = RLModelManager()  # Cargar nueva instancia con el modelo actualizado
    rl_manager.load_model()
    print(f"🛠 Instancia de RLManager obtenida luego de entrenamiento: {rl_manager}")
    print("Modelo en memoria después de entrenar:", rl_manager.model)
    print("Modelo actualizado en memoria.")'''
    #print("Evaluando el modelo...")
    #env = RecommenderEnv(config={})  # Asegúrate de que el entorno esté inicializado correctamente
    #print("Evaluando el modelo...")
    #evaluate_model(trainer, env, num_episodes=10)

    # Notificar a Django para cargar el modelo en su instancia Singleton
    try:
        response = requests.get("http://backend:8000/api/load_model/")   
        if response.status_code == 200:
            print("✅ Modelo actualizado correctamente en Django")
        else:
            print(f"❌ Error al actualizar modelo en Django: {response.text}")
    except Exception as e:
        print(f"❌ No se pudo conectar al backend: {e}")
    return CHECKPOINT_DIR

def train_tune_model():
    ray.shutdown()
    ray.init(ignore_reinit_error=True, num_gpus=1)  # Habilitar GPU

    # Definir el espacio de búsqueda de hiperparámetros
    search_space = {
        "lr": tune.loguniform(1e-4, 1e-2),
        "gamma": tune.choice([0.95, 0.98, 0.99]),
        "entropy_coeff": tune.uniform(0.001, 0.02),
        "clip_param": tune.uniform(0.1, 0.3),
        "train_batch_size": tune.choice([128, 256, 512]),
    }

    # Definir el scheduler de Tune
    scheduler = ASHAScheduler(
        metric="episode_reward_mean",
        mode="max",
        max_t=500,
        grace_period=50,
        reduction_factor=2
    )

    # Función de entrenamiento con Tune
# Función de entrenamiento con Tune
    def train_fn(config):
        trainer = (
            PPOConfig()
            .environment(RecommenderEnv)
            .framework("torch")
            .training(
                lr=config["lr"],
                gamma=config["gamma"],
                entropy_coeff=config["entropy_coeff"],
                clip_param=config["clip_param"],
                train_batch_size=config["train_batch_size"]
            )
            .reporting(keep_per_episode_custom_metrics=True)
            .build()
        )

        # Restaurar checkpoint si existe
        if os.path.exists(CHECKPOINT_DIR):
            print(f"Cargando el checkpoint desde {CHECKPOINT_DIR}")
            trainer.restore(CHECKPOINT_DIR)
        for i in range(500):  
            result = trainer.train()
            episode_reward_mean = result['env_runners'].get('episode_reward_mean', None)
            total_loss = result['info']['learner']['default_policy']['learner_stats']['total_loss']
            train.report({
                "episode_reward_mean": episode_reward_mean,
                "total_loss": total_loss})
            print(f"Iteración: {result['training_iteration']}, Recompensa media: {episode_reward_mean}, Total Loss: {total_loss}")

        # Guardar el mejor modelo
        if os.path.exists(CHECKPOINT_DIR):
            shutil.rmtree(CHECKPOINT_DIR)
        trainer.save(CHECKPOINT_DIR)

    # Asignación de recursos usando tune.with_resources
    trainable_with_resources = tune.with_resources(
        train_fn,
        tune.PlacementGroupFactory(
            # Bundle para el proceso principal (driver)
            [{"CPU": 4.0, "GPU": 1.0}] 
            # + Bundles para workers (ajusta "N" al número de workers)
            + [{"CPU": 1.0}] * 2  # Ejemplo: 2 workers
        )
    )
        #resources=lambda spec: {"gpu": 1, "cpu": 1}  # 1 GPU y 1 CPU por trial

    # Ejecutar la búsqueda de hiperparámetros
    tuner = tune.Tuner(
        trainable_with_resources,
        param_space=search_space,
        tune_config=tune.TuneConfig(
            scheduler=scheduler,
            num_samples=10,
        ),
    ) 

    results = tuner.fit()
    best_result = results.get_best_result()
    results_df = best_result.get_dataframe()
    results_df[["training_iteration", "mean_accuracy"]]
    print("Mejor configuración encontrada:", best_config)
    # Guardar el mejor modelo
    rl_manager = RLModelManager()
    rl_manager.update_model()
    print("Modelo actualizado en memoria.")

    return CHECKPOINT_DIR