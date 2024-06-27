chrome.runtime.sendMessage({
    action: "scanComplete",
    content: document.body.innerHTML
  });