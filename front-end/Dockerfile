# Utilisation de l'image officielle de Node.js
FROM node:latest

# Créer et définir le répertoire de travail de l'application
WORKDIR /app

# Copier les fichiers de package.json et package-lock.json (ou yarn.lock)
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source de l'application
COPY . .

# Exposer le port utilisé par l'application
EXPOSE 3000

# Commande pour démarrer l'application Next.js en mode développement
CMD ["npm", "run", "dev"]
