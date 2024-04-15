package handlers

import (
	"back-end/structures"
	"fmt"
	"net/http"
)

func HandlerRegister(w http.ResponseWriter, r *http.Request) {

	if r.Method == "POST" {
		fmt.Println("Le formulaire a été soumis avec succès")
		form := r.FormValue("form")
		fmt.Println(form)
	}

	var data structures.Data

	data.Requete = "ds"

	data1 := RecoverAllFormValues(r)
	fmt.Println(data1.ImageFile.Header.Filename)
	ExecuteHtmlWithData(w, "register", data)
}
