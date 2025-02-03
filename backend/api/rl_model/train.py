# api/rl_model/train.py
import ray
from ray.rllib.algorithms.ppo import PPOConfig
from .env import RecommenderEnv

def train_model():
    ray.shutdown()
    ray.init(ignore_reinit_error=True)
    config = (
        PPOConfig()
        .environment(RecommenderEnv)
        .framework("torch")
        .training(lr=0.001, train_batch_size=128, gamma=0.99)
        .resources(num_gpus=0)
    )
    trainer = config.build()
    for i in range(100):
        result = trainer.train()
        print(f"Iteración: {result['training_iteration']}")
    checkpoint_path = trainer.save()
    print(f"Modelo guardado en: {checkpoint_path.checkpoint.path}")
    return checkpoint_path.checkpoint.path