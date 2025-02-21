# Sistema-de-manejo-de-escenas-de-entrenamiento-para-personas-con-autismo
Para buildear el contenedor de docker:
</br>
En el directorio principal, ejecutar:
</br>
docker-compose build
</br>
Para levantar el contenedor:
</br>
docker-compose up
</br>

Una vez corriendo los contenedores, para levantar la BD (y cargar datos de ejemplo)
</br>
docker exec -it django_container bash
</br>
python manage.py load_db
</br>
El código de Spacy se encuentra en archivo 'backend/api/views.py' en clase 'SpacyPatologiasView' (linea 3452) 
</br>
El código de Reinforcement Learning para las recomendaciones se encuentra en 'backend/api/views.py' en metodo 'recommend_scene' (linea 4827) y los métodos siguientes. Llama a metodos que se encuentran en 'backend/api/rl_model/utils.py' y en 'backend/api/rl_model/train.py'