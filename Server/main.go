package main

import (
	"fmt"
	"net/http"

	"database/sql"
	"os"

	"github.com/HarmanPreet-Singh-XYT/internal/database"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

type apiConfig struct {
	dbQueries   *database.Queries
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
	connStr := os.Getenv("DATABASE")
	db, errDb := sql.Open("postgres", connStr)
	if errDb != nil {
		fmt.Println("DB Connection Failed")
	}

	dbQ := database.New(db)

	cfg := apiConfig{
		dbQueries:   dbQ,
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
