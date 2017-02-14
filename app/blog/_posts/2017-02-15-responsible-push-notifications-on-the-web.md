---
layout: post
title:  "How we implemented push notifications on our website"
description: When used responsibly, push notifications offer a way to form a connection between people and the content they want.
og_image: /images/blog/2017-02-push-notifications/bells_16_9.jpg
private: true
---

# How we implemented push notifications on our website

Too many websites use push notifications irresponsibly. They will prompt users to signup the moment they visit the site, without providing any value to people first.

This not only hurts the user experience, it's also a risky business. If a user denies a site access at the start, that site might not be able to ask for it again, as permission will be blocked (In Chrome).

This is not to say push notifications are a bad technology in itself. When used responsibly, they offer a way to form a connection between people and the content they want.

{% include post-image.html alt="Image taken by Igor Ovsyannykov - Manali, India (unsplash.com)" src="/images/blog/2017-02-push-notifications/bells_16_9.jpg" margin="both" ratio="16_9" %}

## Our Approach

We wanted a responsible way of using push notifications on our website. At the end of each blog post, we show these buttons to allow guests to get notified when new posts arrive.

{% include post-image.html alt="Notifications" src="/images/blog/2017-02-push-notifications/notify-visible.png" margin="both" ratio="16_5" %}

When people click the notification button, the browser will prompt for permissions:

{% include post-image.html alt="Permissions" src="/images/blog/2017-02-push-notifications/permissions_16_9.jpg" margin="both" ratio="16_9" %}

At any time, users have the ability to turn off notifications on the website after signing up.

{% include post-image.html alt="Notifications Turned Off" src="/images/blog/2017-02-push-notifications/notify-turned-off.png" margin="both" ratio="16_5" %}

## Under the hood

There is both front and back-end logic behind the solution. The front-end has a Service Worker to listen to messages when people are not browsing the site. Meanwhile, the back-end stores subscriptions and sends messages to its registered browsers.

Instead of building all this ourselves, we decided to use [OneSignal](https://onesignal.com/) as our push notification provider. OneSignal enables us to easily send messages, manage subscriptions and [more](https://documentation.onesignal.com/docs#section-why-should-i-use-onesignal-).

OneSignal also has support for Safari on Desktop, it uses a non-standard way for push notifications. Here is the complete browser support:

{% include post-image.html alt="Source: OneSignal website" caption="true" src="/images/blog/2017-02-push-notifications/browser-support_16_7.png" margin="both" ratio="16_7" %}

The browser support will broaden further going forward.

## Show me the code!

The [OneSignal documentation](https://documentation.onesignal.com/docs/web-push-setup) is quite good. Howe er, it doesn't include a full example for our approach, so let's go through it in this post.

As a start, we added OneSignal to our site.

{% highlight HTML %}
<script src="https://cdn.onesignal.com/sdks/OneSignalSDK.js" async></script>
<script>
var OneSignal = window.OneSignal || [];
</script>
{% endhighlight %}

Notice the *async* keyword to prevent the script from blocking rendering of the page. All of OneSignal calls are in-fact asynchronous.

## Calling init

The next step is to initialise OneSignal.

{% highlight JavaScript %}
OneSignal.push(() => {
  OneSignal.init({
    appId: "<APP_ID>",
    safari_web_id: '<SAFARI_WEB_ID>',
    autoRegister: false,
    allowLocalhostAsSecureOrigin: true,
    welcomeNotification: {
      title: '14islands',
      message: 'We will keep you posted!'
    },
    promptOptions: {},
    notifyButton: { enable: false }
  })
})
{% endhighlight %}

We got *app_id* and *safari_id* under the *App Settings* in the OneSignal Dashboard after the app has been created in there.

The *allowLocalhostAsSecureOrigin: true* flag will treat **http://localhost** and **http://127.0.0.1** as a secure origin. In production, push notifications require HTTPS to work.

It's important not call the *init* method more than once. Doing so results in an error.


## Progressive enhancement

Push Notifications are not supported by all browsers. For those browsers, we only show the Newsletter signup form on our website. In a true progressive enhancement fashion.

The Newsletter signup form works on all browsers and even without JavaScript enabled.

{% include post-image.html alt="Notifications & Newsletter" src="/images/blog/2017-02-push-notifications/newsletter-visible.png" margin="both" ratio="16_5" %}

Next, we check if there is support and show the notification button in those cases.

{% highlight JavaScript %}
OneSignal.push(() => {
	this.showNotfications = OneSignal.isPushNotificationsSupported()
	if (this.showNotfications) {
		this.$context.addClass('show-notifications')
	}
})
{% endhighlight %}

In the CSS, the *show-notifications* class will switch to the view showing buttons.

{% include post-image.html alt="Notifications" src="/images/blog/2017-02-push-notifications/notify-visible.png" margin="both" ratio="16_5" %}

## Subscribe

When people `click` the "Get Notification" button they will be subscribed.

{% highlight JavaScript %}
OneSignal.push(() => {
	OneSignal.registerForPushNotifications()
	OneSignal.setSubscription(true)
})
{% endhighlight %}

A welcome notification is sent out at this point. It's a nice way to give feedback to people that they are now receiving notifications.

{% include post-image.html alt="Permissions" src="/images/blog/2017-02-push-notifications/welcome-message_16_9.jpg" margin="both" ratio="16_9" %}

In the constructor, we have the following code to detect if the user is subscribed and respond to subscription changes.

{% highlight JavaScript %}
OneSignal.push(() => {
	// Check if subscribed on load
	OneSignal.isPushNotificationsEnabled().then((isSubscribed) => {
		this.$context.toggleClass('is-subscribed-to-push', isSubscribed)
	})
	// Check if user hits the subscribe button
	OneSignal.on('subscriptionChange', (isSubscribed) => {
		this.$context.toggleClass('is-subscribed-to-push', isSubscribed)
	})
})
{% endhighlight %}

In the CSS, the `is-subscribed-to-push` will show the "Turn off Notification" button.

{% include post-image.html alt="Notifications Turned Off" src="/images/blog/2017-02-push-notifications/notify-turned-off.png" margin="both" ratio="16_5" %}

## Turn off notification

People unregister when they `click` the "Turn off" button.

{% highlight JavaScript %}
new window.Notification('14islands', {
	body: 'Notifications are now turned off.',
	icon: '/icons/android-chrome-192x192.png'
})
OneSignal.push(() => {
	OneSignal.setSubscription(false)
})
{% endhighlight %}

We send out a notification using the standard Notification API. This is nice to give the user feedback for unregistering.

{% include post-image.html alt="Permissions" src="/images/blog/2017-02-push-notifications/turnoff-message_16_9.jpg" margin="both" ratio="16_9" %}

## To summarize

> Users should show intent before a site asks for a permission, and allow users easily to turn notifications off.

You can try out our implementation under the comments section below.

{% include blog-author-hjortur.html %}
