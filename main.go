package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os/exec"
	"strings"
	"sync"

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

var (
	mutex      sync.Mutex
	savedLinks []SavedLink
)

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/scan", scanHandler).Methods("POST")
	r.HandleFunc("/scanAll", scanAllHandler).Methods("POST")
	r.HandleFunc("/links", linksHandler).Methods("GET")
	r.HandleFunc("/clearLinks", clearLinksHandler).Methods("POST")

	log.Println("Starting server on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}

func scanHandler(w http.ResponseWriter, r *http.Request) {
	var data struct {
		URL      string   `json:"url"`
		Keywords []string `json:"keywords"`
	}
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		log.Printf("Error decoding request body: %v", err)
		http.Error(w, "Bad request: "+err.Error(), http.StatusBadRequest)
		return
	}

	newLinks, err := scanURL(data.URL, data.Keywords)
	if err != nil {
		log.Printf("Error scanning URL: %v", err)
		http.Error(w, "Error scanning URL: "+err.Error(), http.StatusInternalServerError)
		return
	}

	savedLinks = append(savedLinks, newLinks...)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":  "Scan completed successfully",
		"newLinks": len(newLinks),
	})
}

func scanAllHandler(w http.ResponseWriter, r *http.Request) {
	var data struct {
		URLs     []string `json:"urls"`
		Keywords []string `json:"keywords"`
	}
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		log.Printf("Error decoding request body: %v", err)
		http.Error(w, "Bad request: "+err.Error(), http.StatusBadRequest)
		return
	}

	totalNewLinks := 0
	for _, url := range data.URLs {
		newLinks, err := scanURL(url, data.Keywords)
		if err != nil {
			log.Printf("Error scanning URL %s: %v", url, err)
			continue
		}
		savedLinks = append(savedLinks, newLinks...)
		totalNewLinks += len(newLinks)
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":  "All scans completed",
		"newLinks": totalNewLinks,
	})
	log.Println("All scans completed")
}

func scanURL(url string, keywords []string) ([]SavedLink, error) {
	input := map[string]interface{}{
		"url":      url,
		"keywords": keywords,
	}
	inputJSON, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}

	cmd := exec.Command("python", "scripts/scraper.py")
	cmd.Stdin = strings.NewReader(string(inputJSON))
	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, err
	}

	var newLinks []SavedLink
	err = json.Unmarshal(output, &newLinks)
	if err != nil {
		return nil, err
	}

	return newLinks, nil
}

func linksHandler(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(savedLinks)
}

func clearLinksHandler(w http.ResponseWriter, r *http.Request) {
	mutex.Lock()
	savedLinks = []SavedLink{}
	mutex.Unlock()

	log.Println("All links cleared")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "All saved links have been cleared",
	})
}
