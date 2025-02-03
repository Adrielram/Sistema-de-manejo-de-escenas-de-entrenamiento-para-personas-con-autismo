FROM python:3.11

# Establecer el directorio de trabajo y copiar el código
WORKDIR /app
COPY . .

# Instalar dependencias del sistema y limpiar
RUN apt-get update && apt-get install -y \
    pkg-config \
    libmariadb-dev \
    gcc \
    wget \
    && apt-get clean

# Descargar wait-for-it para esperar a que MySQL esté listo
RUN wget -O /usr/local/bin/wait-for-it https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh \
    && chmod +x /usr/local/bin/wait-for-it

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Exponer el puerto
EXPOSE 8000

CMD ["wait-for-it", "db:3306", "--", "daphne", "-b", "0.0.0.0", "-p", "8000", "backendapp.asgi:application"]
