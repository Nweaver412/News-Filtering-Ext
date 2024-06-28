document.addEventListener('DOMContentLoaded', () => {
  const websitesTextarea = document.getElementById('websites');
  const keywordsTextarea = document.getElementById('keywords');
  const saveConfigButton = document.getElementById('saveConfig');
  const scanAllButton = document.getElementById('scanAll');
  const savedLinksList = document.getElementById('savedLinks');
  const clearLinksButton = document.getElementById('clearLinks');
  const statusMessage = document.getElementById('statusMessage');

  chrome.storage.local.get(['websites', 'keywords'], (result) => {
    websitesTextarea.value = (result.websites || []).join('\n');
    keywordsTextarea.value = (result.keywords || []).join('\n');
  });

  saveConfigButton.addEventListener('click', () => {
    const config = {
      websites: websitesTextarea.value.split('\n').filter(s => s.trim()),
      keywords: keywordsTextarea.value.split('\n').filter(s => s.trim())
    };
    chrome.storage.local.set(config, () => {
      console.log('Configuration saved');
      updateStatusMessage('Configuration saved successfully', 'success');
    });
  });

  clearLinksButton.addEventListener('click', () => {
    fetch('http://localhost:8080/clearLinks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Links cleared:', data);
      updateSavedLinksList([]);
      updateStatusMessage('Links cleared successfully', 'success');
    })
    .catch(error => {
      console.error('Error clearing links:', error);
      updateStatusMessage('Error clearing links. Please check the console and try again.', 'error');
    });
  });

  scanAllButton.addEventListener('click', () => {
    chrome.storage.local.get(['websites', 'keywords'], (result) => {
      const websites = result.websites || [];
      const keywords = result.keywords || [];

      fetch('http://localhost:8080/scanAll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: websites, keywords: keywords })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Scan all completed:', data);
        loadSavedLinks();
        updateStatusMessage(`Scan completed. ${data.newLinks} new links found.`, 'success');
      })
      .catch(error => {
        console.error('Error scanning all websites:', error);
        updateStatusMessage('Error scanning websites. Please check the console and try again.', 'error');
      });
    });
  });

  function loadSavedLinks() {
    fetch('http://localhost:8080/links')
    .then(response => response.json())
    .then(links => {
      updateSavedLinksList(links);
    })
    .catch(error => {
      console.error('Error fetching links:', error);
      updateSavedLinksList([]);
      updateStatusMessage('Error loading links. Please try again.', 'error');
    });
  }

  function updateSavedLinksList(links) {
    if (Array.isArray(links) && links.length > 0) {
      savedLinksList.innerHTML = links.map(link => 
        `<li><a href="${link.url}" target="_blank">${link.title || link.url}</a></li>`
      ).join('');
    } else {
      savedLinksList.innerHTML = '<li>No saved links available</li>';
    }
  }

  function updateStatusMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = type;
    statusMessage.style.display = 'block';
    setTimeout(() => {
      statusMessage.style.display = 'none';
    }, 3000);
  }

  loadSavedLinks(); // Load saved links on popup open
});