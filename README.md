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
