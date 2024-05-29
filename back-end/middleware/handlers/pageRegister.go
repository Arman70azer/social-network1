package handlers

import (
	s "back-end/middleware/struct"
	"database/sql"
	"fmt"
	"io"

	"net/http"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)


func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type") // Autoriser l'en-tête Content-Type
    w.Header().Set("Content-Type", "application/json")

    if r.Method != "POST" {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    } else {
		if r.Method == "POST" {
			fmt.Println("nickname: ", r.FormValue("nickname"))
			fmt.Println("firstname: ", r.FormValue("firstname"))
			fmt.Println("lastname: ", r.FormValue("lastname"))
			fmt.Println("birthday: ", r.FormValue("birthday"))
			fmt.Println("imagename: ", r.FormValue("imagename"))
			fmt.Println("aboutme: ", r.FormValue("aboutme"))
			fmt.Println("email: ", r.FormValue("email"))
			fmt.Println("password: ", r.FormValue("password"))
		}
	}

    // Parse the form data
    err := r.ParseMultipartForm(10 << 20) // 10 MB limit for file upload
    if err != nil {
        http.Error(w, "Unable to parse form", http.StatusBadRequest)
        return
    }

    // Extract the form values
	
    user := s.User{
        Nickname:  r.FormValue("nickname"),
        FirstName: r.FormValue("firstname"),
        LastName:  r.FormValue("lastname"),
        Birthday:  r.FormValue("birthday"),
        AboutMe:   r.FormValue("aboutme"),
        Email:     r.FormValue("email"),
        Password:  r.FormValue("password"),
    }

    // Handle file upload
    file, handler, err := r.FormFile("imagename")
    if err != nil {
        http.Error(w, "Error retrieving the file", http.StatusBadRequest)
        return
    }
    defer file.Close()

    // Save the file to the server
    filePath := filepath.Join("uploads", handler.Filename)
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

    // Connect to the SQLite database
    db, err := sql.Open("sqlite3", "./users.db")
    if err != nil {
        http.Error(w, "Unable to connect to the database", http.StatusInternalServerError)
        return
    }
    defer db.Close()

    // Insert the user into the database
    query := `INSERT INTO users (nickname, firstname, lastname, birthday, age, imagename, aboutme, email, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    _, err = db.Exec(query, user.Nickname, user.FirstName, user.LastName, user.Birthday, user.Age, user.ImageName, user.AboutMe, user.Email, user.Password)
    if err != nil {
        http.Error(w, "Unable to save the user in the database", http.StatusInternalServerError)
        return
    }

    fmt.Fprintln(w, "Inscription réussie!")
}
