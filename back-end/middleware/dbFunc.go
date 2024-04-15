package middleware

/*
func SelectAllUserNicknames() ([]structures.User, error) {
	db, _ := OpenDB()
	rows, err := db.Query("SELECT Nickname FROM Users")
	if err != nil {
		return nil, fmt.Errorf("failed to execute query: %v", err)
	}
	defer rows.Close()
	var userConnected []structures.User
	var user structures.User
	for rows.Next() {
		var nickname string
		if err := rows.Scan(&nickname); err != nil {
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}
		user.Nickname = nickname
		user.Connected = false
		userConnected = append(userConnected, user)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("row error: %v", err)
	}
	return userConnected, nil
}
*/
