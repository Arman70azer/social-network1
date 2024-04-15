package handlers

import (
	"back-end/structures"
	"net/http"
)

func HandlerRegister(w http.ResponseWriter, r *http.Request) {

	if r.Method == "POST" {
		allFormValues := RecoverAllFormValues(r)
		if requiredRegisterValuesIsPresent(allFormValues) {
			http.Redirect(w, r, "/login", http.StatusSeeOther)
		}
	}

	var data structures.Data
	ExecuteHtmlWithData(w, "register", data)
}

func requiredRegisterValuesIsPresent(allFormValues structures.AllFormValues) bool {
	if allFormValues.Email != "" && allFormValues.Firstname != "" && allFormValues.Lastname != "" && allFormValues.Birthday != "" && allFormValues.Password != "" {
		return true
	} else {
		return false
	}
}
