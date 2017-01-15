var url_to_tab_id = {};

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (!changeInfo.url) { return; }
    var url = key_maker(changeInfo.url);
    if (url && url.indexOf("chrome:/") == -1) {
        if (!url_to_tab_id[url]) {
            removeTabById(tabId);
            url_to_tab_id[url] = tabId;
        } else if (tabId != url_to_tab_id[url]) {
            focusTab(url_to_tab_id[url]);
            chrome.tabs.remove(tabId);
            if (url != changeInfo.url) {
                chrome.tabs.update(url_to_tab_id[url], {url:changeInfo.url});
            }
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

var populate_tab_map_from_window = function(win) {
    for (let t of win.tabs) {
        if (t.url && t.url.indexOf("chrome:/") == -1) {
            url_to_tab_id[key_maker(t.url)] = t.id;
        }
    }
};

var key_maker = function(url) {
    return url;
    // return url.split('#')[0];
};

chrome.windows.getAll({populate:true, windowTypes:['normal']}, function(windows){
    for (let win of windows) {
        populate_tab_map_from_window(win);
    }
});

chrome.windows.getLastFocused({populate:true, windowTypes:['normal']}, populate_tab_map_from_window);

