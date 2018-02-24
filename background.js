// Add a context menu action on every image element in the page.
// browser.contextMenus.create({
//   id: 'play-externally',
//   title: 'Play video externally',
//   contexts: ['video'],
// });

let findVideos = `
  Array.from(document.querySelectorAll('video')).map(v => 
    ({ src: v.src || v.currentSrc, paused: v.paused })
  );`;

let pauseVideos = `
  Array.from(document.querySelectorAll('video')).forEach(v => {
    if (v.paused) return;
    let src = v.src || v.currentSrc;
    v.pause();
    v.src = src;
    v.load();
  });`;

function triggerIntent(videoUrl) {
  let [scheme, url] = videoUrl.split('://');
  let intentOpts = [
    'action=android.intent.action.VIEW',
    'scheme=' + scheme,
    'type=video/*',
  ];
  browser.tabs.create({
    url: `intent://${url}#Intent;${intentOpts.join(';')};end`,
  });
}

function triggerPauseAll() {
  return browser.tabs.executeScript({
    allFrames: true,
    code: pauseVideos,
  });
}

browser.browserAction.onClicked.addListener(async tab => {
  try {
    let results = await browser.tabs.executeScript({
      allFrames: true,
      code: findVideos,
    });
    await triggerPauseAll();
    
    let videos = results.reduce((acc, v) => (acc = [...acc, ...v]), []);
    if (videos.length === 1) {
      triggerIntent(videos[0].src);
    } else {
      let playingVideos = videos.filter(v => !v.paused);
      if (playingVideos.length === 1) {
        triggerIntent(playingVideos[0].src);
      }
    }
  } catch (err) {
    console.error(err);
  }
});

// Handle the context menu action click events.
// browser.contextMenus.onClicked.addListener(async info => {
//   await triggerPauseAll();
//   triggerIntent(info.srcUrl);
// });
