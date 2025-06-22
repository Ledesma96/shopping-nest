# Imagen base con Node.js
FROM node:20

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de la app
COPY . .

# Compila la app (asumiendo que usas TypeScript)
RUN npm run build

# Expone el puerto en el que corre tu API (cambia si es otro)
EXPOSE 3000

# Comando por defecto para arrancar el backend
CMD ["npm", "run", "start:prod"]
