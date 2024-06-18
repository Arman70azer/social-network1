package handlers

import (
    "back-end/middleware/dbFunc"
    "encoding/json"
    "fmt"
    "net/http"
    "strconv"
)

func GetNotifications(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
    w.Header().Set("Content-Type", "application/json")

    if r.Method == http.MethodGet {
        db := dbFunc.Open_db()
        defer db.Close()

        userID, err := strconv.Atoi(r.URL.Query().Get("userID"))
        if err != nil {
            http.Error(w, "Invalid userID", http.StatusBadRequest)
            return
        }

        notifications, err := dbFunc.GetNotifications(db, userID)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }

        fmt.Println("Sending notifications to client:", notifications)
        json.NewEncoder(w).Encode(notifications)
    }
}
