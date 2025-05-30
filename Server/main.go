package main

import (
	"fmt"
	"net/http"

	"os"

	"github.com/joho/godotenv"
)

type apiConfig struct {
	frontOrigin string
	port        string
}

func main() {
	godotenv.Load(".env")
	origin := os.Getenv("FRONTEND_ORIGIN")
	port := os.Getenv("PORT")
	if origin == "" {
		origin = "localhost:3000"
	}
	if port == "" {
		port = "3500"
	}
	cfg := apiConfig{
		frontOrigin: origin,
		port:        port,
	}
	mux := http.NewServeMux()
	mux.HandleFunc("/", cfg.handlerHelloWorld)
	mux.HandleFunc("POST /shorten", cfg.handlerShorten)
	mux.HandleFunc("/urls", cfg.handlerURL)
	mux.HandleFunc("/analytics/{urlID}", cfg.handlerURLAnalytics)
	mux.HandleFunc("PUT /urls/{ID}", cfg.handlerURLUpdate)
	mux.HandleFunc("DELETE /urls/{ID}", cfg.handlerURLDelete)
	mux.HandleFunc("PATCH /urls/{ID}/toggle", cfg.handlerURLToggle)
	mux.HandleFunc("POST /redirect/{shortId}", cfg.handlerURLRedirect)

	corsMux := cfg.withCORS(mux)

	srv := &http.Server{
		Addr:    ":" + cfg.port,
		Handler: corsMux,
	}
	err := srv.ListenAndServe()
	if err != nil {
		fmt.Println("Problem detected in starting the server")
	}
}
