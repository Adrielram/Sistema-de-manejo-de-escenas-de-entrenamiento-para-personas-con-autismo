# Usa la imagen ya construida del backend en lugar de reinstalar dependencias
FROM backend:latest
# Define el directorio de trabajo
WORKDIR /app

# Copia solo los archivos necesarios para Celery (sin reinstalar todo)
COPY ../backend /app/

# Comando por defecto (se sobreescribirá en docker-compose)
CMD ["celery", "--help"]
