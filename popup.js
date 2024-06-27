document.addEventListener('DOMContentLoaded', () => {
    const websitesTextarea = document.getElementById('websites');
    const keywordsTextarea = document.getElementById('keywords');
    const saveConfigButton = document.getElementById('saveConfig');
    const savedLinksList = document.getElementById('savedLinks');
  
    // Load config
    fetch('http://localhost:8080/config')
      .then(response => response.json())
      .then(config => {
        websitesTextarea.value = config.websites.join('\n');
        keywordsTextarea.value = config.keywords.join('\n');
      });
  
    // Save config
    saveConfigButton.addEventListener('click', () => {
      const config = {
        websites: websitesTextarea.value.split('\n').filter(s => s.trim()),
        keywords: keywordsTextarea.value.split('\n').filter(s => s.trim())
      };
      fetch('http://localhost:8080/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      }).then(() => {
        chrome.storage.local.set({ websites: config.websites });
      });
    });
  
    // Load saved links
    fetch('http://localhost:8080/links')
      .then(response => response.json())
      .then(links => {
        savedLinksList.innerHTML = links.map(link => `<li><a href="${link.url}" target="_blank">${link.title || link.url}</a></li>`).join('');
      });
  });
  
  // content.js
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scanPage") {
      chrome.runtime.sendMessage({
        action: "scanComplete",
        content: document.body.innerHTML
      });
    }
  });