chrome.webRequest.onBeforeRequest.addListener(
  function(info) {
	  console.log(info);
      if (url_to_tab_id[info.url]) {
        focusTab(url_to_tab_id[info.url]);
        chrome.tabs.remove(info.tabId);
        return { cancel: true };
      }
      return { cancel: false };
  },
  {types: ["main_frame"],urls: ["<all_urls>"]},
  ["blocking"]
);

