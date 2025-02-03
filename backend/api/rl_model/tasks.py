'''from celery import shared_task
from .train import train_model

def check_new_data():
    from api.models import RegistroEvaluacion
    return RegistroEvaluacion.objects.count()

@shared_task
def train_if_needed():
    if check_new_data() >= 100:
        return train_model()
    return "No hay suficientes datos para entrenar"'''