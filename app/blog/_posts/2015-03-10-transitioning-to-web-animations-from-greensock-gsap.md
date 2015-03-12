---
layout: post
title:  "Transitioning to Web Animations from GreenSock GSAP"
description: "We recently got a chance to work with the new Web Animations specification when building this year’s Google Santa Tracker. We normally use GreenSock GSAP for complex animation sequences so we were interested to see if the standards are catching up."
og_image: /images/blog/web-animations-vs-greensock-gsap/web-animations-vs-greensock-gsap.png
private: true
---

{%comment%}
# Web Animations vs GreenSock GSAP
# How to use Web&nbsp;Animations vs. GreenSock GSAP
# Migrating to Web&nbsp;Animations from GreenSock GSAP
# Transitioning to Web&nbsp;Animations from GreenSock GSAP
{%endcomment%}

# Transitioning from GreenSock GSAP to Web&nbsp;Animations

**We recently got a chance to work with the new Web Animations specification when building this year's [Google Santa Tracker](/work/google-santa-tracker/). We normally use GreenSock GSAP for complex animation sequences so we were interested to see if the standards are catching up.**

_**Please note** that the [Web Animations specification](http://w3c.github.io/web-animations/) is very much a [work in progress](https://github.com/w3c/web-animations/commits/master) so things may have changed since this post was written._


## Background 
There are many [reasons to use GSAP](http://greensock.com/why-gsap/) — even [Google recommends](https://developers.google.com/web/fundamentals/look-and-feel/animations/css-vs-javascript) it. For complex scenarios, we need to be able to create animations purely in JavaScript. Preferably, they should run as efficiently as any CSS Animation or CSS Transition, and that’s exactly [why there’s a new animation specification](https://www.polymer-project.org/0.5/platform/web-animations.html#why-web-animations) in town. 

At the time of writing only Chrome and Opera has native support for Web Animations. There's an [official polyfill](https://github.com/web-animations/web-animations-js) which works on modern versions of all major browsers.


## Tweening
Let’s compare some common animation tasks using both frameworks. The most basic animation is to tween an object’s properties from state A to state B. 

*__Tip:__ to get the best performance possible we should [avoid properties](http://csstriggers.com/) that cause a `layout` or `paint`, so that the GPU can carry out the work.*

### Basic GSAP tween
GSAP can tween any CSS property or DOM attribute, and uses a plugin architecture so you can load only the parts of the framework that you need. 

The fastest way to get started is to use the `to()` method which  automatically tweens the property from whatever it happens to be at the time the tween begins.

{% include codepen-embed.html slug="xbybpZ" tab="js" height="160" %}

The `x-`property tells the [CSS plugin](http://greensock.com/docs/#/HTML5/GSAP/Plugins/CSSPlugin/) to move the element using `matrix()` or `translate()` 2D transforms.

GSAP has most common easing functions [built in](http://greensock.com/docs/#/HTML5/GSAP/Easing/) and there are also `from()` and `fromTo()` functions for more control. You can force `matrix3d()` or `translate3d()` using the [force3D](http://greensock.com/docs/#/HTML5/GSAP/Plugins/CSSPlugin/) flag  to make the browser put that element onto its own compositor layer ([use sparingly](http://wesleyhales.com/blog/2013/10/26/Jank-Busting-Apples-Home-Page/)). 

*__Note:__ GSAP even lets you define properties that are not generally tweenable and will apply the property for you like position:"absolute" and display:"none".*


### Basic Web Animations tween
Web Animations also supports tweening any CSS property or DOM attribute, but you need to specify values for both the start keyframe and the end keyframe. You can provide [custom easings](https://github.com/14islands/14islands-com/blob/master/app/_scss/base/_easings.scss) using bezier curves (same as CSS easing).

This example is the most basic way of applying an animation directly on a DOM element.

{% include codepen-embed.html slug="RNeNoV" tab="js" height="310" %}

One thing to watch out for is the `fill` mode. By default, Web Animations fill mode is set to `none` which means the element resets to whatever state it had before the animation. Setting it to `forwards` makes it keep the last keyframe state. Again, this behaves just like the CSS Animations counterpart.


## Synchronizing tweens & Timeline controls
Both GSAP and Web Animations have timeline abstractions to help synchronize tweens. You can queue tweens on the timeline in sequence, in parallel and make them overlap.

### GSAP timeline
The GSAP Timeline lets you add tweens, callbacks and labels with exact control of the timing offset between them. By default, tweens are added to the timeline in sequential order.

{% include codepen-embed.html slug="MYPwww" tab="js" height="333" %}

The `timeline` instance can be used to control all tweens by pausing, reversing, seeking and changing playback rate.

### Web Animations timeline
Web Animations lets you create and combine AnimationSequences and AnimationGroups to synchronize the timing of individual tweens. They can be nested inside each other to create complex animations. A player must be created to play the outermost sequence/group.

{% include codepen-embed.html slug="vEVOXr" tab="js" height="555" %}

The Web Animations player also supports pausing, reversing, seeking and changing playback rate.


## Events and Callbacks
In one of the trickier scenes in this year’s Santa Tracker we had to animate random characters traveling on a conveyor belt.  Half-way through their journey they would enter a magic closet that dressed them in a random color.

### GSAP callback
The GSAP implementation of this use case is pretty straight forward thanks to the `TimelineLite.add()` function which can synchronize JavaScript callbacks alongside tweens.

{% include codepen-embed.html slug="dPgOdK" tab="js" height="550" %}

GSAP also provides handy `onStart`, `onUpdate`, `onComplete` and `onReverseComplete` callbacks on both the Timeline and on individual Tweens.


### Web Animations callback
This is where it gets a bit tricky. Web Animations only gives us a `finish` event on the player instance.

To schedule callbacks at a specific time during an animation, you need to manually [wrap your callback in an animation](https://github.com/web-animations/web-animations-js/issues/20) and make sure it runs only once:

{% highlight JavaScript %}
var myCallback = new Animation(elem, function(tf) {
  if (tf == null) return;
  console.log('Run callback here!');
}, { duration: 0, fill: 'forwards' });
{% endhighlight %}

The equivalent of the above GSAP animation sequence ends up looking like this with Web Animations:

{% include codepen-embed.html slug="pvxRWd" tab="js" height="840" %}

You are probably wondering why we bind the `finish` event like that. The latest version of the [spec.](http://w3c.github.io/web-animations/#promise-objects) mentions that the event has been removed and that it should expose `ready` and `finished` promises instead. There’s an open [issue for the polyfill](https://github.com/web-animations/web-animations-js/issues/17) tracking this.

Until this has been implemented everywhere, we need to do something like this to be future proof:

{% highlight JavaScript %}
function finish(player, fn) {
  if (player.finished) {
    player.finished.then(fn);
  } else {
    player.onfinish = fn;  // or something to concat methods
  }
}
{% endhighlight %}

If you need to do a lot of work with JavaScript callbacks, there’s an [AnimationCallback class](https://github.com/samthor/animation-callback) from [Sam Thorogood](https://github.com/samthor) that is worth checking out.

We would love to see more events and easier scheduling of callbacks added to the spec.


## Summary

It turns out that Web Animations was a pretty good fit for [the project](/work/google-santa-tracker/), and we had a lot of fun working with it. It’s more mature than we thought, but it’s definitely a bit rough around the edges.

**Things to watch out for:**

* The Web Animations syntax is very verbose compared to GSAP.
* The way we found to schedule JavaScript callbacks with Web Animations feels like a hack.
* It’s not clear if Web Animations players are cheap to create, or if we should be recycling them.
* The `finish` event/promise is in flux.
* It’s confusing to have [3 versions of the polyfill](https://github.com/web-animations/web-animations-js#different-build-targets)
	* We ran into different bugs using different polyfill versions.
	* It can be hard to keep track of which polyfill version is being used on your project. [Polymer is currently shipped](https://github.com/Polymer/core-animation/commit/ff06630b1b280fa1245b9f4f366a76c92c8d325a) with the `next-lite` polyfill.
* Web Animations gives you fine-grained control of the animation `fill-mode`. This is powerful but can get complicated as [this example illustrates](https://www.polymer-project.org/0.5/platform/web-animations.html#controlling-the-animation-timing).

*There’s a lot of advanced functionality in GSAP that probably won’t be covered by Web Animations, but at least we will have a native choice going forward. And GSAP should be able to optimize its engine even further by taking animations entirely off the main JavaScript thread.*

### Resources:

* [Web Animations Specification Draft](http://w3c.github.io/web-animations/)
* [Official Web Animations polyfill](https://github.com/web-animations/web-animations-js)
* [Polymer Web Animations documentation](https://www.polymer-project.org/0.5/platform/web-animations.html)
* [AnimationCallback util for triggering JavaScript callbacks at given intervals with Web Animations](https://github.com/samthor/animation-callback)

{% include blog-author.html author="david" %}
