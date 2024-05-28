package handlers

import (
	"database/sql"
	"fmt"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

// User représente la structure d'un utilisateur
type User struct {
	Nickname  string
	Firstname string
	Lastname  string
	Birthday  string
	Age       int
	Imagename string
	Aboutme   string
	Email     string
	Password  string
}

// registerHandler gère les inscriptions des utilisateurs
func registerHandler(w http.ResponseWriter, r *http.Request) {
	// Vérifie si la méthode HTTP est POST
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	// Analyse le formulaire multipart
	err := r.ParseMultipartForm(10 << 20) // 10 MB
	if err != nil {
		http.Error(w, "Erreur lors de l'analyse du formulaire", http.StatusInternalServerError)
		return
	}

	// Extrait les valeurs du formulaire
	user := User{
		Nickname:  r.FormValue("nickname"),
		Firstname: r.FormValue("firstname"),
		Lastname:  r.FormValue("lastname"),
		Birthday:  r.FormValue("birthday"),
		Aboutme:   r.FormValue("aboutme"),
		Email:     r.FormValue("email"),
		Password:  r.FormValue("password"),
	}

	// Extrait et sauvegarde le fichier image
	file, handler, err := r.FormFile("imagename")
	if err != nil {
		http.Error(w, "Erreur lors de l'extraction du fichier", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Sauvegarde le fichier localement
	filePath := filepath.Join("uploads", fmt.Sprintf("%d-%s", time.Now().Unix(), handler.Filename))
	out, err := os.Create(filePath)
	if err != nil {
		http.Error(w, "Erreur lors de la sauvegarde du fichier", http.StatusInternalServerError)
		return
	}
	defer out.Close()

	_, err = out.ReadFrom(file)
	if err != nil {
		http.Error(w, "Erreur lors de l'écriture du fichier", http.StatusInternalServerError)
		return
	}
	user.Imagename = filePath

	// Affiche les informations de l'image dans la console
	file.Seek(0, 0) // Rewind the file reader
	img, format, err := image.Decode(file)
	if err != nil {
		http.Error(w, "Erreur lors du décodage de l'image", http.StatusInternalServerError)
		return
	}
	fmt.Printf("Image format: %s\n", format)
	fmt.Printf("Image dimensions: %dx%d\n", img.Bounds().Dx(), img.Bounds().Dy())

	// Convertit l'âge en entier
	user.Age, err = strconv.Atoi(r.FormValue("age"))
	if err != nil {
		http.Error(w, "L'âge doit être un nombre", http.StatusBadRequest)
		return
	}

	// Insère l'utilisateur dans la base de données
	db, err := sql.Open("sqlite3", "./mydb.sqlite")
	if err != nil {
		http.Error(w, "Erreur lors de la connexion à la base de données", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	_, err = db.Exec(`INSERT INTO users (nickname, firstname, lastname, birthday, age, imagename, aboutme, email, password) 
	                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		user.Nickname, user.Firstname, user.Lastname, user.Birthday, user.Age, user.Imagename, user.Aboutme, user.Email, user.Password)
	if err != nil {
		http.Error(w, "Erreur lors de l'insertion dans la base de données", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Inscription réussie!"))
}
