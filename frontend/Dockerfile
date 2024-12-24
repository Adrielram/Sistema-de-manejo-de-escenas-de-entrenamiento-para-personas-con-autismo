
FROM node:18-alpine

# Establecer el directorio de trabajo, copiar archivos y construir
WORKDIR /app


#COPY ./frontapp/package*.json ./ 
COPY ./package*.json ./

COPY ./frontapp ./

RUN npm install

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar el servidor
CMD ["npm", "run", "dev"]