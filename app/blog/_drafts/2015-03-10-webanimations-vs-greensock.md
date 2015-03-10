---
layout: post
title:  "WA vs GreenSock"
description: To be described.
og_image: /images/blog/awwwards/awwwards-day-one.jpg
---

# Web Animations vs GreenSock GSAP

**We recently got a chance to work with the new Web Animations specification when building this year's [Google Santa Tracker](/work/google-santa-tracker/). We normally use GreenSock GSAP for complex animation sequences and it was interesting to see that the standards are catching up.**

This is not meant as a head-to-head comparison of the two technologies, this is simply a documentation of our experiences switching from GreenSock GSAP to Web Animations. 

**Please note** *that the [Web Animations specification](http://w3c.github.io/web-animations/) is very much a [work in progress](https://github.com/w3c/web-animations/commits/master) so things may have changed since this post was written.*


{% comment %}
{% include post-image.html alt="Awwwards Conference 2015" src="/images/blog/awwwards/awwwards-day-one.jpg" margin="both" ratio="16_10" %}
{% endcomment %}


## Background 
There are many [reasons to use GSAP](http://greensock.com/why-gsap/) and even [Google recommends it](https://developers.google.com/web/fundamentals/look-and-feel/animations/css-vs-javascript). Imagine how surprised we were to learn that this year Google wanted to use Web Animations for Google Santa Tracker. 

There are good [reasons for a new animation specification](https://www.polymer-project.org/0.5/platform/web-animations.html#why-web-animations) too. For complex scenarios, we need to be able to create animations purely in JavaScript and have it run as efficiently as any CSS Animation or Transition. Google is pushing hard for this technology, and at the time of writing only Chrome and Opera has native support. There's an [official polyfill](https://github.com/web-animations/web-animations-js) which works on modern versions of all major browsers.


## Tweening
One of the most basic and common tweens is to move an object from state A to state B as performant as possible.

### Basic GSAP tween
GSAP let's you tween any values, but uses a plugin architecture so you can load only the parts of the framework that you need. GSAP [CSS plugin](http://greensock.com/docs/#/HTML5/GSAP/Plugins/CSSPlugin/) automatically uses `matrix()` or `translate()` transforms to animate the x-property.

<p data-height="200" data-theme-id="6678" data-slug-hash="xbybpZ" data-default-tab="js" data-user="14islands" class='codepen'>See the Pen <a href='http://codepen.io/14islands/pen/xbybpZ/'>Basic GSAP Tween</a> by 14islands (<a href='http://codepen.io/14islands'>@14islands</a>) on <a href='http://codepen.io'>CodePen</a>.</p>
<script async src="//assets.codepen.io/assets/embed/ei.js"></script>

GSAP has many of the most popular easing functions built in. You can force `matrix3d()` or `translate3d()` using the force3D flag (watch out for GPU thrashing). 

*GSAP even let you define properties that are not generally tweenable and will apply the property for you like position:"absolute" and display:"none".*

### Basic Web Animations tween
Web Animations is similar but you need to specify values for both the start keyframe and the end keyframe. You can provide custom easings using bezier curves (same as CSS easing).

<p data-height="310" data-theme-id="6678" data-slug-hash="RNeNoV" data-default-tab="js" data-user="14islands" class='codepen'>See the Pen <a href='http://codepen.io/14islands/pen/RNeNoV/'>Basic Web Animations Tween</a> by 14islands (<a href='http://codepen.io/14islands'>@14islands</a>) on <a href='http://codepen.io'>CodePen</a>.</p>
<script async src="//assets.codepen.io/assets/embed/ei.js"></script>

One thing to watch out for is the fill mode. By deafault, Web Animations fill mode is set to `none` which means the element resets to whatever state it had before the animation. Setting it to `forwards` makes it keep the last keyframe state. Again, this behaves just like CSS3 Animations.

## Timeline controls
Both GSAP and Web Animations have timeline abstractions. You can queue tweens on the timline in sequence, in parallel groups and overlapping. You can also pause, seek and adjust the playback rate of the entire timeline animation.

### GSAP timeline
The GSAP Timeline let's you add tweens, callbacks and labels with exact control of the timing offset between them. By default, tweens are added to the timeline in sequential order.

<p data-height="333" data-theme-id="6678" data-slug-hash="MYPwww" data-default-tab="js" data-user="14islands" class='codepen'>See the Pen <a href='http://codepen.io/14islands/pen/MYPwww/'>Basic GSAP TimeLine</a> by 14islands (<a href='http://codepen.io/14islands'>@14islands</a>) on <a href='http://codepen.io'>CodePen</a>.</p>
<script async src="//assets.codepen.io/assets/embed/ei.js"></script>

The timline instance can be used to control all tweens by pausing, reversing, seeking and changing playback rate.

### Web Animations timeline
Web Animations lets you create AnimationSequences and AnimationGroups to synchronize the timing of individual tweens. They can be nested inside each other to create complex animations. A player must be created to play the outermost sequence/group.

<p data-height="555" data-theme-id="6678" data-slug-hash="vEVOXr" data-default-tab="js" data-user="14islands" class='codepen'>See the Pen <a href='http://codepen.io/14islands/pen/vEVOXr/'>Basic Web Animations TimeLine</a> by 14islands (<a href='http://codepen.io/14islands'>@14islands</a>) on <a href='http://codepen.io'>CodePen</a>.</p>
<script async src="//assets.codepen.io/assets/embed/ei.js"></script>

The Web Animations player also supports pausing, reversing, seeking and changing playback rate.


## Scheduling callbacks

### GSAP callbacks

### Web Animations callbacks

You can schedule on start and finish events.

To schedule callbacks at a specific time during an animation, you need to manually [wrap your callback in an animation](https://github.com/web-animations/web-animations-js/issues/20):

{% highlight JavaScript %}
var myCallback = new Animation(elem, function(tf) {
  if (tf == null) return;
  console.log('Run callback here!');
}, { duration: 0, fill: 'forwards' });
{% endhighlight %}

There's also an [AnimationCallback class](https://github.com/samthor/animation-callback) from [Sam Thorogood](https://github.com/samthor) that can help.


## Conclusion

It turns out that Web Animations was a pretty good fit for the project, and we had a lot of fun working with it. 

Things to watch out for:

* The Web Animations syntax is very verbose - compare to GSAP shorthand [TimeLineMax.add()](http://greensock.com/docs/#/HTML5/GSAP/TimelineMax/add/)
* It's not clear if Web Animations players are cheap to create or if we should be recycling them
* Hard, but not impossible to register JavaScript callbacks at specific times with Web Animations
* Confusing with [3 versions of the polyfill](https://github.com/web-animations/web-animations-js#different-build-targets)
	* We ran into different bugs using different polyfill versions.
	* Can be hard to know which polyfill version is being used on your project. [Polymer is shipped](https://github.com/Polymer/core-animation/commit/ff06630b1b280fa1245b9f4f366a76c92c8d325a) with the *next-lite* polyfill.
* Web Animations gives you fine-grained control of the animation fill-mode. This is powerful but can get complicated as [this example illustrates](https://www.polymer-project.org/0.5/platform/web-animations.html#controlling-the-animation-timing).

Normally, we would not recommend using cutting-edge, unproven technology for a high profile project on a non-flexible deadline. In this case, the client asked for it and we made sure they understood the risk.

### Resources:

* [Web Animations Specification Draft](http://w3c.github.io/web-animations/)
* [Official Web Animations Polyfill](https://github.com/web-animations/web-animations-js)
* [Polymer Web Animations documentation](https://www.polymer-project.org/0.5/platform/web-animations.html)
* [AnimationCallback util for triggering JavaScript callbacks at given intervals with Web Animations](https://github.com/samthor/animation-callback)
