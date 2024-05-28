# Utilisation de l'image officielle de Node.js
FROM node:latest

# Copier le code source du frontend dans le conteneur
COPY . /app

# Définir le répertoire de travail
WORKDIR /app

# Installer les dépendances et exécuter l'application Next.js en mode développement
CMD ["npm", "run", "dev"]
