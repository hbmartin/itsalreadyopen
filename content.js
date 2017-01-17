// (c) Harold Martin 2017
// harold.martin at gmail

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(request);
        console.log(sender);
        if (request && request.command == "show_overlay") {
            var element = document.createElement('iframe');
            element.id = "happy-tabs-overlay-outer";
            element.src = chrome.extension.getURL("overlay.html") + "?" + encodeURIComponent(window.location.href);
            document.body.appendChild(element);
        }
        else if (request && request.command == "hide_overlay") {
            document.getElementById("happy-tabs-overlay-outer").remove();
        }

        setTimeout(function(){
            document.getElementById("happy-tabs-overlay-outer").remove();
        }, 5000);
    });