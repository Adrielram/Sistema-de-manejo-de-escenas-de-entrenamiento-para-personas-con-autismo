from django.apps import AppConfig
from api.rl_model.rl_model_manager import RLModelManager


class ApiConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "api"

    def ready(self):
        import api.signals
        rl_manager = RLModelManager()
        print(f"🛠 Instancia de RLManager obtenida LUEGO DE ESTAR READY LA APP: {rl_manager}")
