chrome.devtools.panels.create(
    "zsn", 
    "img/panel_icon.png",
    "panel.html"
);

var index = 0;
chrome.devtools.network.onRequestFinished.addListener(
    function(request) {
        var headers = request.response.headers; 
        var req_url = request.request.url;
        var resp_size = request.response.bodySize;
        var resp_cl = 0;
        var resp_status = request.response.status;
        var bol_zip = false;
        var bol_ka = false;
        var bol_cache = false;
        for (var i=0; i<headers.length; i++) {
            if (headers[i]["name"] == "Content-Encoding"
                && headers[i]["value"] == "gzip") {
                bol_zip = true;
            } else if (headers[i]["name"] == "Connection"
                && headers[i]["value"] == "keep-alive") {
                bol_ka = true;    
            } else if (headers[i]["name"] == "Cache-Control"
                && (headers[i]["value"] != "no-cache" && headers[i]["value"] != "no-store")) {
                bol_cache = true; 
            } else if (headers[i]["name"] == "Content-Length") {
                resp_cl = headers[i]["value"];
            }
        }
        if (bol_cache == false && resp_status == 304) {
            bol_cache = true;
        }
        index++;
        var content = index + "  ";
        if (bol_zip) {
            content += "YES  ";
        } else {
            content += "NO   ";
        }
        if (bol_ka) {
            content += "YES  ";
        } else {
            content += "NO   ";
        }
        if (bol_cache) {
            content += "YES  ";
        } else {
            content += "NO   ";
        }
        content += (resp_status + "  ");
        if (resp_size > 0) {
            content += (resp_size + "  ");
        } else {
            content += (resp_cl + "  ");
        }
        content += req_url;
        chrome.devtools.inspectedWindow.eval('console.log(unescape("' + escape(content) + '"))');
});

var backgroundPageConnection = chrome.runtime.connect({
    name: "devtools-page"
});

backgroundPageConnection.onMessage.addListener(function (message) {
    // Handle responses from the background page, if any
});

// Relay the tab ID to the background page
chrome.runtime.sendMessage({
    tabId: chrome.devtools.inspectedWindow.tabId,
    scriptToInject: "content_script.js"
});
