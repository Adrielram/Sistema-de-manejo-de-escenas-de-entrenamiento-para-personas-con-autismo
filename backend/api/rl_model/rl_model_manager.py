import os
import ray
from ray.rllib.algorithms.ppo import PPO

CHECKPOINT_DIR = os.path.abspath("api/rl_model/data/checkpoint")

class RLModelManager:
    """Clase Singleton para manejar el modelo global PPO."""
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            print("🛠 Creando nueva instancia de RLModelManager")
            cls._instance = super(RLModelManager, cls).__new__(cls)
            cls._instance.model = None
            cls._instance._initialize_model()
        else:
            print("✅ Usando instancia existente de RLModelManager")
        return cls._instance

    def _initialize_model(self):
        """Carga el modelo desde un checkpoint existente o lo deja como `None` si no existe."""
        print("🔄 Inicializando el modelo de RL...")
        
        if not ray.is_initialized():
            print("🚀 Iniciando Ray...")
            ray.init(ignore_reinit_error=True)
        
        if os.path.exists(CHECKPOINT_DIR):
            print(f"📂 Cargando modelo desde {CHECKPOINT_DIR}")
            self.model = PPO.from_checkpoint(CHECKPOINT_DIR)
            
            if self.model is not None:
                print("✅ Modelo cargado correctamente.")
            else:
                print("❌ El modelo no se pudo cargar (self.model es None)")
        else:
            print("⚠️ No se encontró un checkpoint. El modelo será inicializado cuando se entrene por primera vez.")

    
    def load_model(self):
        """Método explícito para cargar el modelo (si fuera necesario)."""
        self._initialize_model()
    
    @classmethod
    def get_instance(cls):        
        return cls._instance