

FROM node:18-alpine

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar toda la aplicación
COPY frontapp/package*.json ./

# Instalar dependencias
RUN npm install

# Copiar toda la aplicación
COPY frontapp .

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar el servidor
CMD ["sh", "-c", "npm install && npm run dev"]
