package handlers

import (
	"back-end/structures"
	"fmt"
	"net/http"
)

func HandlerRegister(w http.ResponseWriter, r *http.Request) {

	if r.Method == "POST" {
		allFormValues := RecoverAllFormValues(r)
		fmt.Println(allFormValues)
		if requiredRegisterValuesIsPresent(allFormValues) {
			fmt.Println(allFormValues.Email)
			http.Redirect(w, r, "/login", http.StatusSeeOther)
		}
	}

	var data structures.Data

	data.Requete = "ds"
	ExecuteHtmlWithData(w, "register", data)
}

func requiredRegisterValuesIsPresent(allFormValues structures.AllFormValues) bool {
	if allFormValues.Email != "" && allFormValues.Firstname != "" && allFormValues.Lastname != "" && allFormValues.Birthday != "" && allFormValues.Password != "" {
		return true
	} else {
		return false
	}
}
