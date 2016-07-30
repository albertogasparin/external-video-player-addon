const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://gre/modules/HelperApps.jsm");
Cu.import("resource://gre/modules/Services.jsm");

function showToast(window, message) {
  window.NativeWindow.toast.show(message, "short");
}


function getRelevantVideos(document) {
  let videos = [].slice.call(document.querySelectorAll('video'));

  let iFrames = [].slice.call(document.querySelectorAll('iframe'));
  iFrames.forEach(function (f) {
    let v =  [].slice.call(f.contentDocument.querySelectorAll('video'));
    videos = videos.concat(v);
  });
  
  if (videos.length < 2) {
    return videos;
  }

  return videos.filter(function (video) {
    return !video.paused;
  });
}


function openExternalPlayer(videoURL) {
  HelperApps.launchUri(Services.io.newURI(videoURL, null, null));
}


function makePlayExternallyFunction(window) {
  return function () {
    let document = window.BrowserApp.selectedBrowser.contentWindow.document;
    let videos = getRelevantVideos(document);
    
    if (!videos.length) {
      showToast(window, "No video elements found");
      return;
    }
    if (videos.length > 1) {
      videos.forEach(function (v) { 
        v.pause(); 
      });
      showToast(window, "Sorry, more than one video found. Start playing one and then try again");
      return;
    }

    let video = videos[0];
    let src = video.src || video.currentSrc;
    video.pause();
    video.src = src;
    video.load();
    openExternalPlayer(src);
  };
}



let menuID = null;


function loadIntoWindow(window) {
  if (!window)
    return;

  menuID = window.NativeWindow.menu.add({
    name: "Play video externally",
    callback: makePlayExternallyFunction(window),
  });
}

function unloadFromWindow(window) {
  if (!window)
    return;
  window.NativeWindow.menu.remove(menuID);
}


/**
 * bootstrap.js API from developer.mozilla.org/en-US/docs/Extensions/Mobile/Initialization_and_Cleanup
 */ 
var windowListener = {
  onOpenWindow: function(aWindow) {
    // Wait for the window to finish loading
    let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
    domWindow.addEventListener("UIReady", function () {
      domWindow.removeEventListener("UIReady", arguments.callee, false);
      loadIntoWindow(domWindow);
    }, false);
  },
  
  onCloseWindow: function(aWindow) {},
  onWindowTitleChange: function(aWindow, aTitle) {}
};


function startup(aData, aReason) {
  // Load into any existing windows
  let windows = Services.wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    loadIntoWindow(domWindow);
  }

  // Load into any new windows
  Services.wm.addListener(windowListener);
}


function shutdown(aData, aReason) {
  // When the application is shutting down we normally don't have to clean
  // up any UI changes made
  if (aReason == APP_SHUTDOWN)
    return;
 
  // Stop listening for new windows
  Services.wm.removeListener(windowListener);

  // Unload from any existing windows
  let windows = Services.wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    unloadFromWindow(domWindow);
  }
}


function install(aData, aReason) {}
function uninstall(aData, aReason) {}
