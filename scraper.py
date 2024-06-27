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
        
        matching_links = []
        
        for tag in soup.find_all(['h1', 'h2', 'h3']):
            logging.debug(f"Checking headline: {tag.text}")
            if any(keyword.lower() in tag.text.lower() for keyword in keywords):
                link = tag.find_parent('a')
                if link and 'href' in link.attrs:
                    full_url = link['href'] if link['href'].startswith('http') else url + link['href']
                    matching_links.append({
                        'url': full_url,
                        'title': tag.text.strip()
                    })
                    logging.debug(f"Found matching link: {full_url}")
        
        logging.debug(f"Found {len(matching_links)} matching links")
        return matching_links
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