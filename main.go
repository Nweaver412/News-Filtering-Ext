package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os/exec"
	"strings"

	"github.com/gorilla/mux"
)

type Config struct {
	Websites []string `json:"websites"`
	Keywords []string `json:"keywords"`
}

type SavedLink struct {
	URL   string `json:"url"`
	Title string `json:"title"`
}

var savedLinks []SavedLink

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/scan", scanHandler).Methods("POST")
	r.HandleFunc("/links", linksHandler).Methods("GET")

	http.ListenAndServe(":8080", r)
}

func scanHandler(w http.ResponseWriter, r *http.Request) {
	var data struct {
		URL      string   `json:"url"`
		Keywords []string `json:"keywords"`
	}
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		log.Printf("Error decoding request body: %v", err)
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
	log.Printf("Received scan request for URL: %s with keywords: %v", data.URL, data.Keywords)

	// Prepare input for Python script
	input := map[string]interface{}{
		"url":      data.URL,
		"keywords": data.Keywords,
	}
	inputJSON, _ := json.Marshal(input)

	// Run Python script
	cmd := exec.Command("python", "scraper.py")
	cmd.Stdin = strings.NewReader(string(inputJSON))
	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("Error running Python script: %v", err)
		http.Error(w, "Error running Python script", http.StatusInternalServerError)
		return
	}
	log.Printf("Python script output: %s", string(output))

	// Parse results
	var newLinks []SavedLink
	err = json.Unmarshal(output, &newLinks)
	if err != nil {
		log.Printf("Error unmarshaling Python script output: %v", err)
		http.Error(w, "Error processing script output", http.StatusInternalServerError)
		return
	}

	// Add new links to savedLinks
	savedLinks = append(savedLinks, newLinks...)
	log.Printf("Added %d new links. Total saved links: %d", len(newLinks), len(savedLinks))

	w.WriteHeader(http.StatusOK)
}

func linksHandler(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(savedLinks)
}
