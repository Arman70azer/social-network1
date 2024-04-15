package handlers

import (
	"fmt"
	"html/template"
	"net/http"
	"regexp"

	structures "back-end/structures"
)

// Permet de charger la page html avec les données voulu(w, nom de la page, data (info user, post et etc....))
func ExecuteHtmlWithData(w http.ResponseWriter, page string, data structures.Data) {
	tmpl, err := template.ParseFiles("../front-end/htmls/page_" + page + ".html")
	if err != nil {
		fmt.Println("Error loading template:", err)
		http.Error(w, "Erreur lors du chargement du modèle", http.StatusInternalServerError)
		return
	}
	err = tmpl.Execute(w, data)
	if err != nil {
		fmt.Println("Error executing template:", err)
		http.Error(w, "Erreur lors de l'exécution du modèle", http.StatusInternalServerError)
		return
	}
}

func RecoverAllFormValues(r *http.Request) structures.AllFormValues {
	var allFormValues structures.AllFormValues

	typeForm := r.FormValue("form")
	emailRegex := regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`) //On vérifie si c'est un mail

	switch typeForm {
	case "register":
		email := r.FormValue("email")
		if emailRegex.MatchString(email) {
			allFormValues.Email = r.FormValue("email")
		}
		allFormValues.Password = r.FormValue("password")
		allFormValues.Firstname = r.FormValue("firstname")
		allFormValues.Lastname = r.FormValue("lastname")
		allFormValues.Birthday = r.FormValue("birthday")
		allFormValues.Nickname = r.FormValue("nickname")
		allFormValues.AboutME = r.FormValue("aboutme")
		file, header, err := r.FormFile("avatar")
		if err != nil {
			allFormValues.ImageFile.FileExist = "Il n'y a pas d'image"
		} else {
			if file == nil {
				allFormValues.ImageFile.FileExist = "Il n'y a pas d'image dans la requête."
			} else {
				defer file.Close()
				allFormValues.ImageFile.File = file
				allFormValues.ImageFile.Header = header
			}
		}
	case "login":
		emailOrUsername := r.FormValue("username")
		if emailRegex.MatchString(emailOrUsername) {
			allFormValues.Email = emailOrUsername
		} else {
			allFormValues.Nickname = emailOrUsername
		}
		allFormValues.Password = r.FormValue("password")
	default:
		fmt.Println("Error aucun form compatible ----> RecoverAllFormValues in utilsHandlers.go")
	}
	return allFormValues
}
