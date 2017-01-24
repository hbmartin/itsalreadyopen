// (c) Harold Martin 2017
// harold.martin at gmail

var url_to_tab_id = {};

var checkUpdateTab = function(tabId, url){
  return function() {
    chrome.tabs.get(tabId, function (tab){
      removeTabById(tabId);
      if (chrome.runtime.lastError) {
        console.log("DANGER!!!!");
        console.log(chrome.runtime.lastError.message);
        return;
      }
      console.log(tab ? tab : "NOTAB");
      if (tab && tab.url && tab.url.indexOf("chrome:/") == -1) {
        url_to_tab_id[url] = tabId;
		console.log(url_to_tab_id);
      }
    });
  };
};

chrome.webRequest.onBeforeRequest.addListener(function(info) {
      console.log(info);
      var url = key_maker(info.url);
      if (url_to_tab_id[url]) {
        focusTab(url_to_tab_id[url]);
        chrome.tabs.remove(info.tabId);
        return { cancel: true };
      }
	  console.log("will check: " + info.tabId + " <- " + url);
      setTimeout(checkUpdateTab(info.tabId, url), 2000);
      return { cancel: false };
  },
  { types: ["main_frame"], urls: ["<all_urls>"] },
  ["blocking"]
);


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	console.log(changeInfo);
    if (!changeInfo.url) { return; }
    var url = key_maker(changeInfo.url);
    if (url && url.indexOf("chrome:/") == -1) {
        if (!url_to_tab_id[url]) {
            removeTabById(tabId);
            url_to_tab_id[url] = tabId;
			console.log("tabs.onUpdated <= PUT");
        } else if (tabId != url_to_tab_id[url]) {
            focusTab(url_to_tab_id[url]);
            chrome.tabs.remove(tabId);
			console.log("tabs.onUpdated <= REMOVE");
        }
    }
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
	console.log("chrome.tabs.onRemoved : " + tabId);
    removeTabById(tabId);
});

var focusTab = function(tabId) {
    chrome.tabs.get(tabId, function (tab){
        chrome.windows.update(tab.windowId, {focused: true});
    });
    chrome.tabs.update(tabId, {selected: true});
    chrome.tabs.sendMessage(tabId, {"command":"show_overlay"}, function(response) { console.log(response); });
};

var removeTabById = function(tabId) {
    var keys = Object.keys(url_to_tab_id);
    for (let k of keys) {
        if (url_to_tab_id[k] == tabId) {
            delete url_to_tab_id[k];
            return;
        }
    }
};

var populate_tab_map_from_window = function(win) {
    for (let t of win.tabs) {
        if (t.url && t.url.indexOf("chrome:/") == -1) {
            url_to_tab_id[key_maker(t.url)] = t.id;
        }
    }
};

var key_maker = function(url) {
    return url;
};

chrome.windows.getAll({populate:true, windowTypes:['normal']}, function(windows){
    for (let win of windows) {
        populate_tab_map_from_window(win);
    }
});

chrome.windows.getLastFocused({populate:true, windowTypes:['normal']}, populate_tab_map_from_window);

chrome.runtime.onMessage.addListener(
  function(request, sender) {
	  console.log(request);
	  if (request && request.url) {
	      chrome.tabs.sendMessage(url_to_tab_id[request.url], {"command":"hide_overlay"}, function(response) { console.log(response); });
		  delete url_to_tab_id[request.url];
	      chrome.windows.create({'url': request.url});
	  }
  }
);
