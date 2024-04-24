package middleware

import (
	"io"
	"os"
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
