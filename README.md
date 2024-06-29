# Word Catcher

## Introduction
This Chrome extension allows users to input a list of URLs and keywords. It scrapes the content from these URLs and returns links containing the specified keywords. This tool was made for my roommate Rudolf Aleksander Hansen and I hope he uses it to the maximum ability. It is quite useful for research, or just getting relevant information on topics you care about

## Installation

### Dependencies
This project uses the Gorilla Mux package for handling HTTP requests. Install it using the following Go command:

```bash
go get -u github.com/gorilla/mux
```
### Setup
```bash
cd News-Filtering-Ext
go mod init News-Filtering-Ext-Server
go run main.go
```
Once these are run and you can see that the server is running in the terminal:
 * Open chrome and navigate to 'chrome://extensions'
 * Enable Developer Mode
 * Load Unpacked and select 'News-Filtering-Ext'

## Tasks
- [x] Dark mode lol
- [ ] Autonomous updating
- [ ] Improved crawling
- [ ] Updated ranking system

