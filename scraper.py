import sys
import json
import requests
from bs4 import BeautifulSoup
import logging

logging.basicConfig(level=logging.DEBUG, filename='scraper.log', filemode='w')

def scrape_website(url, keywords):
    try:
        logging.debug(f"Scraping URL: {url} with keywords: {keywords}")
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        matching_resources = []
        
        for element in soup.find_all(['a', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
            text = element.get_text().strip()
            if text and any(keyword.lower() in text.lower() for keyword in keywords):
                logging.debug(f"Found matching text: {text}")
                link = element.get('href') if element.name == 'a' else None
                resource_url = link if link and link.startswith('http') else url
                matching_resources.append({
                    'url': resource_url,
                    'title': text[:100]  # Limit title to 100 characters
                })
        
        logging.debug(f"Found {len(matching_resources)} matching resources")
        return matching_resources
    except Exception as e:
        logging.error(f"Error scraping {url}: {str(e)}")
        return []

if __name__ == "__main__":
    logging.debug("Script started")
    input_data = json.loads(sys.stdin.read())
    url = input_data['url']
    keywords = input_data['keywords']
    
    results = scrape_website(url, keywords)
    print(json.dumps(results))
    logging.debug("Script finished")