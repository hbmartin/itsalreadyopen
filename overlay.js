var url = decodeURIComponent(window.location.href.split('?')[1]);
document.addEventListener("click",  function() { chrome.runtime.sendMessage({"url": url}); });