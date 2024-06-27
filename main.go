// main.go

package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
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

var config Config
var savedLinks []SavedLink

func main() {
	loadConfig()

	r := mux.NewRouter()
	r.HandleFunc("/scan", scanHandler).Methods("POST")
	r.HandleFunc("/config", configHandler).Methods("GET", "POST")
	r.HandleFunc("/links", linksHandler).Methods("GET")

	http.ListenAndServe(":8080", r)
}

func loadConfig() {
	data, err := ioutil.ReadFile("config.json")
	if err != nil {
		fmt.Println("Error reading config file:", err)
		return
	}
	json.Unmarshal(data, &config)
}

func saveConfig() {
	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		fmt.Println("Error marshaling config:", err)
		return
	}
	ioutil.WriteFile("config.json", data, 0644)
}

func scanHandler(w http.ResponseWriter, r *http.Request) {
	var data struct {
		URL     string `json:"url"`
		Content string `json:"content"`
	}
	json.NewDecoder(r.Body).Decode(&data)

	for _, keyword := range config.Keywords {
		if strings.Contains(strings.ToLower(data.Content), strings.ToLower(keyword)) {
			savedLinks = append(savedLinks, SavedLink{URL: data.URL, Title: extractTitle(data.Content)})
			break
		}
	}

	w.WriteHeader(http.StatusOK)
}

func configHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		json.NewEncoder(w).Encode(config)
	} else {
		json.NewDecoder(r.Body).Decode(&config)
		saveConfig()
		w.WriteHeader(http.StatusOK)
	}
}

func linksHandler(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(savedLinks)
}

func extractTitle(content string) string {
	startIndex := strings.Index(content, "<title>")
	endIndex := strings.Index(content, "</title>")
	if startIndex != -1 && endIndex != -1 {
		return content[startIndex+7 : endIndex]
	}
	return ""
}
