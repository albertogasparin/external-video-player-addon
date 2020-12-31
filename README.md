# External video player addon

Open any video with your favorite Android video player! Thanks to this extension you will be able to open online videos with any native video player like VLC, MxPlayer, etc.

**Addon for Firefox for Android v56+**    
[Get it from the Addon marketplace](https://addons.mozilla.org/en-US/android/addon/external-video-player/)

Note that currently (v84) Firefox for Android does not allow installing many 3rd party addons. I you want to use this extension you need Firefox for Android Nightly and you have to enable developer mode with a custom Addons collection. Follow the instructions in the marketplace page.


## Developing

Use web-ext cli tool:

```
npm install --global web-ext
```

Then:

```
web-ext run --target=firefox-android
```

