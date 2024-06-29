document.addEventListener('DOMContentLoaded', () => {
  const websitesTextarea = document.getElementById('websites');
  const keywordsTextarea = document.getElementById('keywords');
  const saveConfigButton = document.getElementById('saveConfig');
  const scanAllButton = document.getElementById('scanAll');
  const savedLinksContainer = document.getElementById('savedLinks');
  const clearLinksButton = document.getElementById('clearLinks');
  const statusMessage = document.getElementById('statusMessage');
  const settingsToggle = document.getElementById('settingsToggle');
  const settingsPanel = document.getElementById('settingsPanel');
  const themeToggleButton = document.getElementById('themeToggle'); // Ensure this button is in your HTML

  // Load saved configuration
  chrome.storage.local.get(['websites', 'keywords', 'theme'], (result) => {
    websitesTextarea.value = (result.websites || []).join('\n');
    keywordsTextarea.value = (result.keywords || []).join('\n');
    if (result.theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  });

  // Toggle settings panel
  settingsToggle.addEventListener('click', () => {
    settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
  });

  // Theme toggle button
  themeToggleButton.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-theme');
    chrome.storage.local.set({ theme: isDark ? 'dark' : 'light' }, () => {
      console.log('Theme changed to ' + (isDark ? 'dark' : 'light'));
    });
  });

  // Save configuration
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

  // Clear links
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

  // Scan all websites
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
      updateStatusMessage('Error: Please start server', 'error');
    });
  }

  function updateSavedLinksList(links) {
    savedLinksContainer.innerHTML = links.map(link => `
      <div class="link-item">
        ${link.image ? `<img src="${link.image}" alt="Link preview" class="link-image">` : ''}
        <div class="link-content">
          <a href="${link.url}" target="_blank" class="link-title">${link.title || link.url}</a>
          <span class="link-url">${link.url}</span>
        </div>
      </div>
    `).join('');
  }

  function updateStatusMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = type;
    statusMessage.style.display = 'block';
    setTimeout(() => {
      statusMessage.style.display = 'none';
    }, 3000);
  }

  // Load saved links when the popup opens
  loadSavedLinks();
});
