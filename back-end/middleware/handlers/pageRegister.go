package handlers

import (
	"back-end/middleware/dbFunc"
	s "back-end/middleware/struct"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	// Parse the form data
	err := r.ParseMultipartForm(10 << 20) // 10 MB limit for file upload
	if err != nil {
		http.Error(w, "Unable to parse form", http.StatusBadRequest)
		return
	}
	user := s.User{
		Nickname:  r.FormValue("nickname"),
		FirstName: r.FormValue("firstname"),
		LastName:  r.FormValue("lastname"),
		Birthday:  r.FormValue("birthday"),
		ImageName: r.FormValue("imagename"),
		AboutMe:   r.FormValue("aboutme"),
		Email:     r.FormValue("email"),
		Password:  r.FormValue("password"),
	}
	if user.Nickname == "" {
		user.Nickname = user.FirstName + user.LastName
	}
	// Connect to the SQLite database
	db := dbFunc.Open_db()
	defer db.Close()
	var response s.Request
	// Check if the nickname already exists
	if !dbFunc.CheckUserExists_db(user.Nickname, db) {
		// Handle file upload
		file, handler, err := r.FormFile("imagename")
		if err != nil {
			if err == http.ErrMissingFile {
				// If no file was uploaded, set the default image name
				user.ImageName = "nothing.webp"
			} else {
				http.Error(w, "Error retrieving the file", http.StatusBadRequest)
				return
			}
		} else {
			defer file.Close()
			// Ensure the uploads directory exists
			uploadDir := "uploads"
			if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
				err = os.Mkdir(uploadDir, os.ModePerm)
				if err != nil {
					http.Error(w, "Unable to create uploads directory", http.StatusInternalServerError)
					return
				}
			}
			// Save the file to the server
			filePath := filepath.Join(uploadDir, handler.Filename)
			outFile, err := os.Create(filePath)
			if err != nil {
				http.Error(w, "Unable to create the file on the server", http.StatusInternalServerError)
				return
			}
			defer outFile.Close()
			_, err = io.Copy(outFile, file)
			if err != nil {
				http.Error(w, "Unable to save the file on the server", http.StatusInternalServerError)
				return
			}
			user.ImageName = handler.Filename
		}
		if calculateAge(user.Birthday) > 17 {
			user.Age = calculateAge(user.Birthday)
			// Save the user to the database
			dbFunc.PushUser_db(user, db)
			fmt.Fprintln(w, "Inscription réussie!")
			response.Accept = true
			response.Nature = "c'est bon"
		} else {
			response.Accept = false
			response.Nature = "user too young"
		}
	} else {
		response.Accept = false
		response.Nature = "user already registered"
	}
	// Convertissez les données en JSON
	jsonData, err := json.Marshal(response)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	// Définissez le type de contenu de la réponse comme JSON
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	// Renvoyez les données JSON en réponse
	w.Write(jsonData)
}

// Function to calculate age
func calculateAge(birthday string) int {
	layout := "2006-01-02"
	birthDate, err := time.Parse(layout, birthday)
	if err != nil {
		return 0
	}
	today := time.Now()
	age := today.Year() - birthDate.Year()
	if today.YearDay() < birthDate.YearDay() {
		age--
	}
	return age
}
