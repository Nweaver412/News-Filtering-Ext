chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      chrome.storage.local.get(['websites'], (result) => {
        const websites = result.websites || [];
        if (websites.some(website => tab.url.includes(website))) {
          chrome.tabs.sendMessage(tabId, { action: "scanPage" });
        }
      });
    }
  });
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scanComplete") {
      fetch('http://localhost:8080/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sender.tab.url, content: request.content })
      });
    }
  });