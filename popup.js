document.addEventListener('DOMContentLoaded', () => {
  const websitesTextarea = document.getElementById('websites');
  const keywordsTextarea = document.getElementById('keywords');
  const saveConfigButton = document.getElementById('saveConfig');
  const savedLinksList = document.getElementById('savedLinks');

  // Load configuration from Chrome storage
  chrome.storage.local.get(['websites', 'keywords'], (result) => {
    websitesTextarea.value = (result.websites || []).join('\n');
    keywordsTextarea.value = (result.keywords || []).join('\n');
  });

  // Save configuration to Chrome storage
  saveConfigButton.addEventListener('click', () => {
    const config = {
      websites: websitesTextarea.value.split('\n').filter(s => s.trim()),
      keywords: keywordsTextarea.value.split('\n').filter(s => s.trim())
    };
    chrome.storage.local.set(config, () => {
      console.log('Configuration saved');
    });
  });

  // Load saved links
  fetch('http://localhost:8080/links')
    .then(response => response.json())
    .then(links => {
      if (Array.isArray(links) && links.length > 0) {
        savedLinksList.innerHTML = links.map(link => `<li><a href="${link.url}" target="_blank">${link.title || link.url}</a></li>`).join('');
      } else {
        savedLinksList.innerHTML = '<li>No saved links available</li>';
      }
    })
    .catch(error => {
      console.error('Error fetching links:', error);
      savedLinksList.innerHTML = '<li>Error loading links</li>';
    });
});