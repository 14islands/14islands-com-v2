---
layout: post
title:  "Ways to build a mobile app without native technologies"
description: We are often asked about the “best” ways to build a native app. It always depends on the needs, but there are few technical possibilities.
og_image: /images/blog/native-app-ways/open-graph-image.png
---

# Ways to build a mobile app without native technologies


Apps are a big part of our lives. They live on our mobile home screen and we use them to socialize, entertain us and use services. 

As a development studio we are often asked about the “best” ways to build a native app. It always depends on the needs, but there are number of technical possibilities. 

The most basic way is to build apps with native technologies on a given platform. This means writing [Swift](https://developer.apple.com/swift/)/[Object-C](https://developer.apple.com/library/content/documentation/Cocoa/Conceptual/ProgrammingWithObjectiveC/Introduction/Introduction.html) on [iOS](http://www.apple.com/ios/) for [iPhone](http://www.apple.com/iphone/), [Java](https://java.com) for [Android](https://developer.android.com/index.html) devices, [.NET](https://www.microsoft.com/net) for [Windows Phone](https://www.microsoft.com/en-us/windows/view-all?col=phones) and so forth.

To build with native technologies gives most control to create smooth user experiences and use specific capabilities on each device. Most of the popluar apps like [Facebook](https://www.facebook.com/), [Twitter](https://twitter.com/), [Instagram](https://www.instagram.com/) and [Uber](https://www.uber.com/) are built native. 

However, it’s also an expensive way to build apps. Companies create and maintain multiple code-bases, manage multiple teams with different types of developers and then keep work in sync between them all. Complexity multiplies with each platform.

Not all companies have resources to build using native technologies. Many companies have other priorities. There are options, popular ones are:

* Web technologies with [Cordova](https://cordova.apache.org/) (PhoneGap)
* [React Native](https://facebook.github.io/react-native/)

I’ll also mention more alternatives at the end of the article.


## Web Technologies with Cordova (PhoneGap)

[PhoneGap](http://phonegap.com/) is a very successful project. The company behind it was bought up by [Adobe](https://www.adobe.com/) and the open source part of it named [Apache Cordova](https://cordova.apache.org/).

Cordova is a native wrapper for web technologies (HTML, CSS, JavaScript). It basically uses native web-view on each platform as a wrapper and provides access to device capabilities through JavaScript APIs. The idea is build once, work everywhere.

iOS, Android, Windows Mobile and other platforms are supported by Cordova. This works great for companies that want apps on many platforms and are able to settle for a modest user experience. I’ve seen really nice apps built with Cordova, we’ve even [built some ourselves](https://14islands.com/blog/2016/03/03/why-we-chose-react-for-hybrid-app/). 

The main downside is not having the ability to use native components  when working inside web views. Cordova also cannot provide 100% access to all platform features. Check out the [plugin directory](https://cordova.apache.org/plugins/) to see what capabilites are available.

An extra benefit of Cordova is being able to use same code both on web and native platforms. Responsive web design principles can make it work on all screen sizes.


## React Native

[React Native](https://facebook.github.io/react-native/) is the new hotness to build native apps for iOS and Android. It’s an open source project started by Facebook. They’ve used it for apps such as [Facebook Groups](http://newsroom.fb.com/news/2014/11/introducing-the-facebook-groups-app/).

React Native was inspired by [React](https://facebook.github.io/react/), a super popular framework for the web, also incarnated by Facebook. React Native and React web apps are built with JavaScript and share the same architecture pattern. The idea is to learn once, use everywhere.

Developers claim they are able to [re-use around 85% of the codebase](http://nerds.airbnb.com/facebook-react-native/) when using React for web and React Native together. 

React Native is a run-time environment inside a native app shell. It runs JavaScript code in a special thread, making it possible to have smooth animations while executing other operations. There are though limits to how much it's possible to optimize performance complex apps within the run-time.

The cool thing is that React Native allows use of native components and access to device capabilities. [Native modules](https://facebook.github.io/react-native/docs/native-modules-ios.html) are created to bridge the gap between native code and React Native code. Most modules exist within the eco-system, but you can build one yourself if needed.

React Native uses inline styles over CSS using a Flexbox approach. I found the ways to style apps a bit limiting. It will hopefully improve over time. 

To see what's possible with React Native it's good to [browse through the showcase apps](https://facebook.github.io/react-native/showcase.html) and see what has already been built. The developer experience is great with React Native, it's easy to get started and hot-reloads update the app on every code change.

It’s still early days for React Native, but it looks very promising.

## Other ways

There are also other ways to build native apps such as [Xamarin](Xamarin), [Titanium](http://www.appcelerator.com/) and [Unity](https://unity3d.com/). Unity is popular for games and highly visual experiences. I’m no expert in these technologies but worth the mention.

Then, some companies might not need a native app at all. In some cases, having an online web app is enough. Web apps are accessible anywhere through a web browser and can be built responsive to work on all devices.

Google, Mozilla, Opera and Microsoft are all working towards a future of [Progressive Web Apps](https://14islands.com/blog/2016/05/29/progressive-web-apps-catching-up-on-mobile/). These are native-like web apps with offline capabilities, push notifications, add-to-homescreen enforcement and [many other features](https://developers.google.com/web/progressive-web-apps/). 

Web apps remove dependece on app stores. It’s still to be seen [if Apple joins companies to push for Progressive Web Apps](https://medium.com/14islands-stories/does-apple-have-the-courage-to-push-the-web-af71812e6372#.9rwjfdjdw) on iOS. 

## Conclusion

There are a number of options to consider for your mobile app strategy. 

It can even be possible to mix some of these together. For example, build an app with native technologies for iOS and go with Progressive Web Apps for other platforms. Or, build an app natively with web-views for specific parts.

In essence, when a smooth experience with heavy graphics and device capabilities are high priority, go with native technologies. For a faster and more cost effective approach on multiple platforms, hyprid technologies can be a better way forward.

{% include blog-author-hjortur.html %}


