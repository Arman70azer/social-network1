package middleware

import (
	structures "back-end/middleware/struct"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"regexp"

	"golang.org/x/crypto/bcrypt"
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

func ContainsID(id int, array []structures.PrivatesViewer) bool {
	for i := 0; i < len(array); i++ {
		if array[i].Viewer == id || array[i].Author == id {
			return true
		}
	}
	return false
}

// Retourne si les valeurs de follox et nofollow de l'user sur cette event
func FollowEvent(id int, privatesViewers []structures.PrivatesViewer) (bool, bool) {
	for i := 0; i < len(privatesViewers); i++ {
		if privatesViewers[i].Viewer == id {
			return privatesViewers[i].Follow, privatesViewers[i].NoFollow
		}
	}
	fmt.Println("Erreur: utils.FollowEvent")
	return true, true
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

func IsValidEmail(email string) bool {
	// Expression régulière pour vérifier si une chaîne est un email valide
	const emailRegex = `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
	re := regexp.MustCompile(emailRegex)
	return re.MatchString(email)
}

func ReturnWithW(w http.ResponseWriter, data interface{}) {
	// Convertissez les données en JSON
	jsonData, err := json.Marshal(data)
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

func HashedPassword(password string) string {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		fmt.Println("Erreur lors du hachage du mot de passe :", err)
		return ""
	}
	return string(hashedPassword)
}

func StockeImage(w http.ResponseWriter, r *http.Request, author structures.User) string {
	var fileName string
	// Récupérer le fichier image
	file, handler, err := r.FormFile("file")
	if err != nil {
		fileName = "nothing"
		fmt.Println("gggg")
	} else {
		defer file.Close()
		// Stocker le fichier sur le serveur
		fileName = handler.Filename
		_, err1 := os.Stat(`./db/images/` + fileName)

		if os.IsNotExist(err1) {
			out, err := os.Create("./db/images/" + fileName)
			if err != nil {
				http.Error(w, "Erreur lors de la création du fichier sur le serveur", http.StatusInternalServerError)
				fmt.Println("1 erreur lors de la création du fichier pour le post de " + author.Nickname)
				return fileName
			}
			defer out.Close()

			_, err = io.Copy(out, file)
			if err != nil {
				http.Error(w, "Erreur lors de la copie du fichier sur le serveur", http.StatusInternalServerError)
				fmt.Println("2 erreur lors de la création du fichier pour le post de " + author.Nickname)
				return fileName
			}
		}

	}
	return fileName
}