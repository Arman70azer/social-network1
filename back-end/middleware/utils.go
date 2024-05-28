package middleware

import (
	structures "back-end/middleware/struct"
	"encoding/json"
	"io"
	"log"
	"os"
	"regexp"
)

func SelectImageDatabase(name string) []byte {
	image, err := os.Open("./db/images/" + name)
	if err != nil {
		return nil
	}
	defer image.Close()

	data, err := io.ReadAll(image)
	if err != nil {
		return nil
	}
	return data
}

// Renvoie si l'user est bien enregistrés dans la db
func UserRegister(nickname string, allUser []structures.User) bool {
	for i := 0; i < len(allUser); i++ {
		if allUser[i].Nickname == nickname {
			return true
		}
	}
	return false
}

// Renvoie si l'event est présent dans la db
func EventExist(titre string, allEvent []structures.Post) bool {
	for _, event := range allEvent {
		if event.Titre == titre {
			return true
		}
	}
	return false
}

// Rensigne si la str se trouve dans cette array
func Contains(str string, array []string) bool {
	for _, s := range array {
		if s == str {
			return true
		}
	}
	return false
}

// Vérifie que str ne contient pas de script et n'est pas vide
func RegexSpaceAndScript(str string) bool {
	re := regexp.MustCompile(`^\s|^\s*$|<script.*?>.*?</script.*?>`)

	return !re.MatchString(str)
}

func ConvertToJson(msg any) []byte {
	// Convertir la structure Request en JSON
	jsonMessage, err := json.Marshal(msg)
	if err != nil {
		log.Println("JSON encoding error:", err)
		return jsonMessage
	}

	return jsonMessage
}
