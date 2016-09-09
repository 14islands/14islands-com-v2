---
layout: post
title:  "The web is catching up on mobile"
description: Progressive Web Apps to improve experience on mobile, similar to native apps.
og_image: /images/blog/progressive-web-apps/open-graph-image.jpg
---

# The web is catching up on mobile

*Watching the web talks from [GoogleIO last week](https://events.google.com/io2016/) and it made me want to* 👏👏👏

The big story are new capabilities, making it possible to build web apps with similar user experience on mobile as native apps.

Here are some of these new capabilities:

* **Available offline**: *Service Workers* make offline usage possible by caching web app layout and data. It will also speed up loading on returning visits.
* **Push notifications**: Like on native apps, working outside the browser.
* **Add to Home screen**: Browsers will suggest adding capable web apps to users home screen when used frequently. Great for continued engagement.
* **Background Sync**: Post updates while offline that will be processed as soon there is an internet connection.
* **Splash Screen**: To give instant feedback when opening web apps from home screen.
* **Custom Browser Colors**: To make browsers bars fit the styling of the app.
* **Web Payments API**: Pay with credit cards, GooglePay and other methods without any input, when shopping on the web.
* **Hardware Apis**: Give access to the camera, microphone, accelerometer, VR capabilities and more. 

These features are made available in Chrome and Firefox, currently mostly on Android. The big question is IF and WHEN Apple will offer these features on iOS. Google pushing the web forward on Android will hopefully motivate Apple to do the same.
 
## Progressive Web Apps

The umbrella term for apps using features above is **Progressive Web Apps** (PWA). It was coined by [Alex Russel](https://twitter.com/slightlylate) and [his original post](https://infrequently.org/2015/06/progressive-apps-escaping-tabs-without-losing-our-soul/) explains the common traits of these apps.

The word **Progressive** has two meanings here:

1. These apps become progressively better by using them, as caching, add to homescreen and other features are unlocked. 

2. These apps use progressive enhancement as a principle. Features are only enabled on capable devices.

At the start I found the term a bit confusing as some PWA examples are single page applications (SPA) controlled by JavaScript. These apps are not strictly using progressive enhancement where JavaScript is added on top to enhance the experience.

The term also begs the question; what is the difference between websites and apps? It seems many of the new capabilities fit well for any dynamic website, not just *apps*.

Anyhow. It's good to have an umbrella term to talk about these things.

## Getting started

As a developer I'm looking forward to get my hands wet and build using these features. To learn more I recommend watching [Jake Archibald](https://twitter.com/jaffathecake) epic [talk at GoogleIO about offline-first](https://www.youtube.com/watch?v=cmGr0RszHc8) and reading [Addy Osmani's](https://twitter.com/addyosmani) [post about getting started using the Shell Architecture](https://addyosmani.com/blog/getting-started-with-progressive-web-apps/) to build Progressive Web Apps. 

There is also a [tool called Lighthouse](https://github.com/googlechrome/lighthouse) to audit and perfomance check your Progressive Web App, pointed out by our good friend [Paul Lewis](https://aerotwist.com/).

## On the business side

As a business person I would consider how this could help my business going forward. 

Building native apps for different platforms is expensive and hard, and distribution through app stores is challenging. [Research shows](http://techcrunch.com/2015/06/22/consumers-spend-85-of-time-on-smartphones-in-apps-but-only-5-apps-see-heavy-use/) that the average person mainly uses 5 native apps on their phone.

On desktop back in the days, we mostly used native email clients such as Outlook. Today, most people use web apps like Gmail or Inbox for email on Desktop. Maybe the same evolution is about take place on mobile.

There will always be cases for native apps. It will also take time to build and educate users that web apps can do similar things as native apps on mobile. 

However; When Progressive Web Apps have become the standard quote and Apple gets on board - the web might become the primary way forward on mobile. 

{% include blog-author-hjortur.html %}
