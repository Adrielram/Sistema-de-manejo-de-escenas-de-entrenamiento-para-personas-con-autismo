import os
import ray
from ray.rllib.algorithms.ppo import PPO

CHECKPOINT_DIR = os.path.abspath("api/rl_model/data/checkpoint")

class RLModelManager:
    """Clase Singleton para manejar el modelo global PPO."""
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RLModelManager, cls).__new__(cls)
            cls._instance.model = None
            cls._instance._initialize_model()
        return cls._instance

    def _initialize_model(self):
        """Carga el modelo desde un checkpoint existente o lo deja como `None` si no existe."""
        if not ray.is_initialized():
            ray.init(ignore_reinit_error=True)
        if os.path.exists(CHECKPOINT_DIR):
            print(f"Cargando modelo desde {CHECKPOINT_DIR}")
            self.model = PPO.from_checkpoint(CHECKPOINT_DIR)
            print("Modelo cargado correctamente.")
        else:
            print("No se encontró un checkpoint. El modelo será inicializado cuando se entrene por primera vez.")

    def load_model(self):
        """Método explícito para cargar el modelo (si fuera necesario)."""
        self._initialize_model()

    def update_model(self):
        """Actualiza el modelo con un nuevo checkpoint."""
        print(f"Actualizando el modelo desde {CHECKPOINT_DIR}")
        self.model = PPO.from_checkpoint(CHECKPOINT_DIR)
        print("Modelo actualizado correctamente.")
