var url_to_tab_id = {};

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    var url = changeInfo.url;
    if (url && url.indexOf("chrome:/") == -1) {
        if (!url_to_tab_id[url]) {
			console.log("NEW url @ " + tabId + " : " + url);
            removeTabById(tabId);
            url_to_tab_id[url] = tabId;
        } else {
			console.log("old url @ " + tabId + " : " + url);
			console.log(" -> " + url_to_tab_id[url]);
            focusTab(url_to_tab_id[url]);
            chrome.tabs.remove(tabId);
        }
    }
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    removeTabById(tabId);
});

var focusTab = function(tabId) {
    chrome.tabs.get(tabId, function (tab){
        chrome.windows.update(tab.windowId, {focused: true});
    });
    chrome.tabs.update(tabId, {selected: true});
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

chrome.windows.getAll({populate:true, windowTypes:['normal']}, function(windows){
    for (let win of windows) {
		for (let t of win.tabs) {
			if (t.url && t.url.indexOf("chrome:/") == -1) {
				url_to_tab_id[t.url] = t.id;
			}
		}
    }
});
