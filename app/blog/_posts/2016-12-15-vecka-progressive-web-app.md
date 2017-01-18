---
layout: post
title:  "Vecka App - Your life in weeks"
description: Always know what the week number it is. Essential when living in Sweden.
og_image: /images/blog/2016-12-vecka-pwa/vecka-cover.png
---

# Vecka App - Your life in weeks

In Sweden, people make plans in weeks instead of months. This might seem weird to newcomers, but once you get used to it, it’s kinda smart. Weeks are short and an agile way to make plans.

{% include post-image.html alt="The Vecka App" src="/images/blog/2016-12-vecka-pwa/vecka-cover.png" margin="both" ratio="16_9" %}

The first step is to align yourself with sentences like “What are you doing in week 52?”, “Let's plan our trip in week 24” or “My goal is to finish the TPS report in week 14”. Most calendars don’t show week numbers by default so what can you do?

Announcing [vecka.14islands.com](https://vecka.14islands.com/) - A simple web app that helps you plan your life in weeks. It helps you know what the current week number is and gives the ability to look into future weeks. Just quickly swipe sideways to scan through week numbers.

The app is quite Swedish at the moment. Swedish language, timezone and the background color changes based on the seasons in Sweden. You can still use the app from anywhere in the *🌎*{: class="emoji"}.


## Progressive Capabilities

The Vecka App started as a *hack* to test out the latest [Progressive Web App (PWA)](https://developers.google.com/web/progressive-web-apps/) capabilities. These capabilities make it possible to build web apps with a better user experience.

Progressive Web Apps bring together the best of two worlds; The openness and accessibility of the web, combined with the user experience of native apps. As an example, the Vecka app is blazing fast as all assets are cached on the device, and the app works well offline.

You don't need to go through any App Store to download the app, it's simply accessed on the web. If you access the Vecka App a few times on an Android phone, a suggestion to add it to your home screen will pop-up. After adding it to the home screen the app will behave just like a native app.

These capabilities will currently only work on phones with the latest Chrome or Firefox browsers on Android. Microsoft is also introducing support on Windows. Unfortunately, Apple doesn’t have support for app-like capabilities yet on the iPhone, but hopefully soon.

We might add more app-like features soon, such as push notifications when a new week starts so you always know the current week number.


## Next step

The code is [open source on Github](https://github.com/14islands/vecka.14islands.com). [Check out the app](https://vecka.14islands.com/), fork the code or [shoot us feedback](https://twitter.com/14islands).

{% include blog-author-hjortur.html %}
