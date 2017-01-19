---
layout: post
title:  "We built a PWA from scratch - This is what we learned"
description: Our Progressive Web App journey and what we discovered on the way.
og_image: /images/blog/2017-01-pwa-dev/pwa-blog-cover-image_16_10.jpg
private: true
---

# We built a PWA from scratch - This is what we learned

Progressive Web Apps bring a lot of potential to the web. The new capabilities make it possible to build native-like web apps that integrate closer with people's devices.

To try out these abilities we built a Progressive Web App (PWA) from scratch. We already [had a great idea for an app](https://14islands.com/blog/2016/12/15/vecka-progressive-web-app/).

{% include post-image.html alt="Our Progressive Web App" src="/images/blog/2017-01-pwa-dev/pwa-blog-cover-image_16_10.jpg" margin="both" ratio="16_10" %}

## The plan

On top of making a useful app, these were our goals:

- To use a Service Worker to boost performance and make the app available offline.
- To make sure an “Add to Home Suggestion" would pop-up for users on Android, to access it like a native app.
- To nicely decorate the app outside the viewport, using a Manifest file.
- To get a 100% rating with [Lighthouse](https://github.com/GoogleChrome/lighthouse), to check for all the best PWA practices.
- Open Source [the code on Github](https://github.com/14islands/vecka.14islands.com) and write a blog post about the lessons we learned (you are reading it now)


## Workers at your service

It took a bit of a time to grasp *Service Workers*. It’s not like any other technology we’ve had on the web, until now.

They’re a part of the web-app, yet they’re not able to touch the DOM in any way. Service Workers are a proxy that live between the web-app and the user. They work in a separate thread and can cache assets, hook into requests, and communicate with the website via messages.

Service Workers are *installed* on the user browser after the page has loaded for the first time. After the first `install` event, the worker can start interfering with requests using the `fetch` event. When a new version of the Service Worker is deployed, the browser will automatically detect byte differences and `activate` the worker version on next visit.

A Service Worker Boilerplate:

{% highlight JavaScript %}
self.addEventListener('install', (event) => {
  // Perform install steps
})

self.addEventListener('fetch', (event) => {
 // Handle requests
})

self.addEventListener('activate', (event) => {
  // Clean up old cache versions
})
{% endhighlight %}

We built our Service Worker mostly based on a [Smashing Magazine article about it](https://www.smashingmagazine.com/2016/02/making-a-service-worker/). We found this article to provide the most complete example to fit our needs.

For simple cases, it’s also possible to use a plugin called [sw-precache](https://github.com/GoogleChrome/sw-precache) for caching purposes, but we wanted to get into the grunts of it and craft our own from the ground.


## Caching gotchas

We start by caching all assets when the `install` event fires.

{% highlight JavaScript %}
const urlsToCache = [
    '/',
    '/style.caf603aca47521f652fd678377752dd0.css',
    '/main-compiled.9b0987235e60d1a3d1dc571a586ce603.js',
    '/fonts/swedensans-webfont.woff',
    '/fonts/swedensans-webfont.woff2'
]

// Open cache and store assets
self.addEventListener('install', (event) => {
  // Perform install steps
  event.waitUntil(
    caches.open('vecka-14islands-com-cache-v1')
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  )
})
{% endhighlight %}

The tricky part is that there is more than just one cache. The browser also has its cache and in our case, we use a global CDN for better performance.

Lets take an example, a JavaScript or a CSS files changes, how do we make sure the new version is used by the browser?

A way would be to use a HTTP header with `Cache-Control: no-cache` on these assets to make sure the file is fetched on every request. Problem is, we miss out of all the benefits of browser and CDN catching.

The solution we used is not a new one, to append version numbers to these files that are subject to change.

{% highlight JavaScript %}
'/style.caf603aca47521f652fd678377752dd0.css',
'/main-compiled.9b0987235e60d1a3d1dc571a586ce603.js',
{% endhighlight %}

This way we can keep a long max-age HTTP headers with `Cache-Control: max-age=31536000` and enjoy the benefits of browser/CDN caching.  I recommend [Jake Archibald post](https://jakearchibald.com/2016/caching-best-practices/) about this to dive deeper, he is the biological father of Service Workers.

Make sure to include the same version numbers in the HTML as in the Service Worker:

{% highlight HTML %}
<link rel='stylesheet' href="/style.caf603aca47521f652fd678377752dd0.css" />
<script src="/main-compiled.9b0987235e60d1a3d1dc571a586ce603.js"></script>
{% endhighlight %}

In our app we used a NodeJS module called [Stacify](https://github.com/errorception/staticify) to automatically create new version numbers in all the places when a file is changed.


## Caching strategy

For our caching strategy we had to consider two kinds of content, static assets and a dynamic page HTML.

Our static assets include CSS, JavaScript and Font files. For these we use *a cache first strategy*, this means we’ll fetch first from the cache before requesting the page.

{% highlight JavaScript %}
respondFromCacheThenNetwork (event) {
  // Check cache first, then network
  const request = event.request
  event.respondWith(
    fetchFromCache(event)
      .catch(() => fetch(request))
      .then(response => addToCache(request, response))
      .catch(() => offlineResponse())
    )
}
{% endhighlight %}

Since the dynamic page HTML might change each time you open the app, we used *a network first strategy* for it, checking the network first before the cache.

{% highlight JavaScript %}
respondFromNetworkThenCache (event) {
  // Check network first, then cache
  const request = event.request
  event.respondWith(
    fetch(request)
      .then(response => addToCache(request, response))
      .catch(() => fetchFromCache(event))
      .catch(() => offlineResponse())
  )
}
{% endhighlight %}

The cool thing about Service Workers is, we are able to cache whatever we want at the start. There are [size limits](http://stackoverflow.com/questions/35242869/what-is-the-storage-limit-for-a-service-worker) but we can be smart as developers and prioritise what is most important first.


## Going offline

After the Service Worker has been installed and the user is offline, we show a banner on top of the app to let people know that they are browsing offline. If we have the app in cache because they browsed to that page in the past, they still get the full experience.

{% include post-image.html alt="App when Offline" caption="true" src="/images/blog/2017-01-pwa-dev/nexus_offline_9_16.png" margin="both" ratio="9_16" %}

We use *offline* and *online* events to detect changes in connectivity and display the banner when users go offline.

{% highlight JavaScript %}
bindEvents () {
  window.addEventListener('offline', this.onOfflineStatus)
  window.addEventListener('online', this.onOnlineStatus)
}

onOfflineStatus () {
  this.showOfflineBanner()
}

onOnlineStatus () {
  this.hideOfflineBanner()
}
{% endhighlight %}

To show the banner if users access the app while offline, we add this extra check when loading the app.

{% highlight JavaScript %}
if (navigator.onLine === false) {
  this.showOfflineBanner()
}
{% endhighlight %}

This app is simple, so we are able to cache all assets for the app on the first visit. In more complex situation you might not be able to cache everything. In those cases, it is good to show a special “Offline” page if users access content that is not cached, and [gray out links that are not available offline](https://justmarkup.com/log/2016/08/indicating-offline/#grey-out-things-not-available-offline).


## Word about DevTools

There is a Service Worker view in Chrome DevTools under the “Application” tab.

{% include post-image.html alt="Service Workers in Chrome DevTools" caption="true" src="/images/blog/2017-01-pwa-dev/devtools_16_9.jpg" margin="both" ratio="16_9" %}

This view is essential to test the app when *Offline* and to *Bypass for Network* to test the app without using any Service Worker.

To understand the *Upload on reload* checkbox, remember that Service Worker changes don’t take effect until the page has been closed and opened again on next visit. This check makes sure all changes takes effect on the next page refresh (shortcut: ⌘+R).

This is useful, but I found that sometimes I had to *Unregister* the service worker and load it again for changes to take affect. Hopefully this will improve soon.


## Add to Home suggestion

A superpower of PWAs is that users get prompted to add the app to their home screen when used frequently. It is one of PWAs biggest selling points as it allows app-makers to bypass App Stores and simply share apps via links.

There are [number of criterias](https://developers.google.com/web/updates/2015/03/increasing-engagement-with-app-install-banners-in-chrome-for-android) that apps need to meet for “Add to Home Suggestion” to work properly. To see it in action, the following flag can be set in the Chrome address bar on the mobile device.

{% highlight Bash %}
chrome://flags/#bypass-app-banner-engagement-checks
{% endhighlight %}

You have to *Relaunch the browser* after the flag has been enabled. If everything is correct, this prompt should show up:

{% include post-image.html alt="Add to Home Suggestion" outline="true" caption="true" src="/images/blog/2017-01-pwa-dev/nexus_add_9_16.png" margin="both" ratio="9_16" %}

The app will live on the user home screen onwards:

{% include post-image.html alt="App on Android Home Screen" caption="true" src="/images/blog/2017-01-pwa-dev/nexus_home_9_16.png" margin="both" ratio="9_16" %}

The app will open without any address bar when launched from the home screen:

{% include post-image.html alt="App in Full Screen" caption="true" src="/images/blog/2017-01-pwa-dev/nexus_fullscreen_9_16.png" margin="both" ratio="9_16" %}

We can only hope that Apple will add an “Add to Home Suggestion” to Safari on the iPhone soon, as this ability is currently only on Android devices.


## Splash Screen, App Icons and More.

Time to add decorations to the mix using a Manifest file. The Manifest gives the browser information about the app and how to style it outside the viewport.

The Manifest is included in the <head> of the HTML page:

{% highlight HTML %}
<link rel="manifest" href="/manifest.json">
{% endhighlight %}

This is our current manifest.json file:

{% highlight JavaScript %}
{
  "manifest_version": 1,
  "version": "1.0.0",
  "name": "Vecka App",
  "short_name": "Vecka",
  "description": "När du vill veta vilken vecka det är.",
  "default_locale": "se",
  "icons": [
        {
            "src": "/icons/android-chrome-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "/icons/android-chrome-256x256.png",
            "sizes": "256x256",
            "type": "image/png"
        }
    ],
  "start_url": "/",
  "display": "standalone",
  "background_color": "#121738",
  "theme_color": "#d17c78"
}
{% endhighlight %}

The *name* and *background_color* are combined to create a [Splash Screen](https://developers.google.com/web/updates/2015/10/splashscreen) that will show instantly while the app is loading. This gives a snappy feeling when launcing the app.

{% include post-image.html alt="App Splash-Screen on Android" caption="true" src="/images/blog/2017-01-pwa-dev/nexus_splashscreen_9_16.png" margin="both" ratio="9_16" %}

The *theme_color* is used to style the browser bar in a fitting colour. Sweeet!

{% include post-image.html alt="App browser bar with custom color" caption="true" src="/images/blog/2017-01-pwa-dev/nexus_browserbar_9_16.png" margin="both" ratio="9_16" %}

Additionally, app icons for Android should be included in the manifest file.

{% highlight JavaScript %}
"icons": [
    {
        "src": "/icons/android-chrome-192x192.png",
        "sizes": "192x192",
        "type": "image/png"
    },
    {
        "src": "/icons/android-chrome-256x256.png",
        "sizes": "256x256",
        "type": "image/png"
    }
]
{% endhighlight %}

We still specify icons in the <head> of the HTML page for Apple Safari, the good old way.

{% highlight HTML %}
<!-- icons -->
<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png">
<link rel="icon" type="image/png" href="/icons/favicon-32x32.png" sizes="32x32">
<link rel="icon" type="image/png" href="/icons/favicon-16x16.png" sizes="16x16">
<link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="<%= themeColor %>">
{% endhighlight %}

To generate icons with code, we used the [Real Favicon Generator](http://realfavicongenerator.net/). It provides the ability to customise the look of app icons for different browsers. This generator works really well for modern PWAs to speed up the process.

## Lighthouse guides the ship

There are a lot of quality checks to do when building PWAs, here are some of them:

- App can load on offline/flaky connections and page load performance is fast
- App is built using *Progressive Enhancement* principles
- App is using HTTPS for secure communications
- Users will be prompted to *Add to Home screen*
- Installed web app will launch with *Custom Splash Screen* and address bar will match brand colours

To confirm the above requirements are met, a tool called [Lighthouse](https://github.com/GoogleChrome/lighthouse) is the golden standard. Lighthouse is a [Chrome extension](https://chrome.google.com/webstore/detail/lighthouse/blipmdconlkpinefehnmjammfjpmpbjk?hl=en) that will analyze any site for Progressive Web App best practices. It shouldn’t be taken as gospel (even though we did), but it’s super helpful.

{% include post-image.html alt="App browser bar with custom color" outline="true" src="/images/blog/2017-01-pwa-dev/lighthouse_16_9.jpg" margin="both" ratio="16_9" %}

{% include blog-quote.html quote="Lighthouse analyzes web apps and web pages, collecting modern performance metrics and insights on developer best practices." %}

Lighthouse is great but can be a bit frustrating sometimes as results vary depending on conditions. It’s early days of PWAs and the tools are bound to get better.


## Conclusion

I think every website from now on should use some of the Progressive Web App features. It’s even confusing to call it “Apps” as it applies to all websites and apps.

Additionally, there are countless APIs available that fall under the PWA umbrella that enable us to push the web further. Push Notifications. Painless Web Payments. Access to the camera and other device capabilities. Access to surrounding devices via Web Bluetooth. Web Beacons to give contextual information. Access to VR capabilities. The list goes on and on and on.

Exciting times ahead for the web!

{% include blog-author-hjortur.html %}
