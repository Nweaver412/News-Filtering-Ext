chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    chrome.storage.local.get(['websites', 'keywords'], (result) => {
      const websites = result.websites || [];
      console.log('Checking URL:', tab.url);
      console.log('Against websites:', websites);
      if (websites.some(website => tab.url.includes(website))) {
        console.log('URL match found');
        chrome.storage.local.get(['keywords'], (result) => {
          const keywords = result.keywords || [];
          console.log('Sending scan request with keywords:', keywords);
          fetch('http://localhost:8080/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              url: tab.url, 
              keywords: keywords
            })
          }).then(response => {
            console.log('Scan request sent, response status:', response.status);
          }).catch(error => {
            console.error('Error sending scan request:', error);
          });
        });
      }
    });
  }
});