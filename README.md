# News-Filtering-Ext


## Introduction
This Chrome extension allows users to input a list of URLs and keywords. It scrapes the content from these URLs and returns links containing the specified keywords. This tool is particularly useful for research, SEO analysis, or any scenario where gathering specific link-related data from multiple websites is required.

## Installation

### Prerequisites
Before installing the Chrome extension, ensure you have Go installed on your system. You can download it from [Go's official website](https://golang.org/dl/).

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

