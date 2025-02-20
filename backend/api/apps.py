from django.apps import AppConfig
from api.rl_model.rl_model_manager import RLModelManager
import os
class ApiConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "api"

    def ready(self):
        import api.signals
        if os.environ.get("RUNNING_CELERY", "0") == "1":
            print("⚠️ Celery está corriendo, no se carga el modelo en Django")
            return  
        print("🛠 Iniciando modelo en Django...")
        rl_manager = RLModelManager()
        print(f"🛠 Instancia de RLManager obtenida LUEGO DE ESTAR READY LA APP: {rl_manager}")
