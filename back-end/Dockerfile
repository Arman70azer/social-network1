# Utilisation de l'image officielle de Golang
FROM golang:latest

# Copier le code source du backend dans le conteneur
ADD . /app

# Définir le répertoire de travail
WORKDIR /app

# Construire l'application Go
RUN go build -o main .

EXPOSE 8000

# Exécuter l'application Go
CMD ["./main"]

