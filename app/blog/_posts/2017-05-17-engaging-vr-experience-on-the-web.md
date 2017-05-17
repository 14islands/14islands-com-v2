---
layout: post
title:  "Making an engaging VR experinence on the web"
description: The CSS Grid layout has everything it needs to be considered the most powerful layout system in CSS.
og_image: /images/blog/2017-05-17-interactive-webvr/moose-experiment.jpg
---

# Making an engaging VR experinence on the web

WebVR is a JavaScript API for creating Virtual Reality experiences in the browser. It is the easiest entry point to dive into VR. It’s open for anyone, mobile, cross-platform and it’s just a click away, without the need to download anything.

Inspired by our most recent project which involved lots of 3D, we turned our explorations into a fun project and created two new WebVR experiments. You can try them out on HTC Vive and Google Cardboard or simply view them in 2D if you don't have access to a VR headset. 

[And a dreamy hot air balloon ride](https://14islands.github.io/webvr-balloon-ride/)
{% include post-image.html alt="Hot air balloon Experiment" src="/images/blog/2017-05-17-interactive-webvr/balloon-experiment.jpg" margin="both" ratio="16_9" link="https://14islands.github.io/webvr-balloon-ride/" %}

[A frosty forest encounter with a moose](https://14islands.github.io/webvr-moose-explorer/)
{% include post-image.html alt="Moose Experiment" src="/images/blog/2017-05-17-interactive-webvr/moose-experiment.jpg" margin="both" ratio="16_9" link="https://14islands.github.io/webvr-moose-explorer/" %}


## Project setup

We believe VR is here to stay so we built a [starter kit](https://github.com/14islands/webvr-three-es6-boilerplate) to help us quickly create WebVR projects. The starter kit uses ES6 JavaScript with [Babel](https://babeljs.io/) as the compiler and comes with [HTC Vive](https://www.vive.com/) controllers models. It is based on the [webvr-boilerplate](https://github.com/borismus/webvr-boilerplate), which lets you enter and exit VR mode and works well on all VR headsets. It also works with Room Scale VR, allowing the user to freely walk around in the virtual space. 

To display 3D graphics in the browser we use [THREE.js](https://threejs.org/), a JavaScript library built on top of WebGL.

_Note: The current version of Chrome supports Google Cardboard and Daydream and works best on Android devices. Other browsers and iOS don’t fully support WebVR yet. You still need an experimental desktop version of Chrome in order to access the experience in HTC Vive._


## Exporting 3D models with Blender

We found [Sketchfab](https://sketchfab.com/) to be a great platform with lots of amazing, downloadable 3D models and used this [sky island](https://sketchfab.com/models/ab92d9b324724e18968377264d05774d) by [Leonid Tsvetkov](https://www.artstation.com/artist/ntrtd) as a base for the Balloon Experience.

{% include post-image.html alt="Exporting models from Blender" src="/images/blog/2017-05-17-interactive-webvr/blender.jpg" margin="both" ratio="16_9" %}

The models are imported into the scenes with [Blender](https://www.blender.org/), an open source software for 3D modeling. With the [Blender to THREE.js exporter](https://github.com/mrdoob/three.js/tree/master/utils/exporters/blender), you can export meshes and scenes as JSON files.

## Making it move

We quickly noticed that VR scenes need animations in order to feel more engaging. To bring more life into them, both experiences feature animated animal models, inspired by _[Rome: 3 Dreams of Black](http://www.ro.me/tech/)_ interactive movie. All the creatures featured in the film are open source and can be found [here](https://github.com/dataarts/3-dreams-of-black/tree/master/deploy/asset_viewer/files/models/animals).  

We added motion to the scenes by creating several particle systems. [THREE.Points](https://threejs.org/docs/#api/objects/Points) is great for generating cool, elemental effects like snow or fire. All our particle systems use shaders, a piece of code which runs directly on the GPU, which means you get a lot of graphical power for free. Thanks to the GPU’s parallel architecture, the transformations are applied to a large set of elements at a time, instead of looping through each particle.

It was great to see how straight-forward applying shaders in THREE.js is and how efficiently and smoothly they run.

The snow shader in the Moose Explorer experience
{% include codepen-embed.html slug="bBXZPd" tab="result" height="333" %}
The fire used in in the Balloon Ride
{% include codepen-embed.html slug="LboXYm" tab="result" height="333" %}
The triangles which float around the sky island
{% include codepen-embed.html slug="GmvZJO" tab="result" height="333" %}

## Engaging the users

To make both experiments more playable we incorporated subtle user interactions. 

In the balloon ride, a user can click the rope hanging inside to make it fly higher up. The [THREE.js RayCaster](https://threejs.org/docs/#api/core/Raycaster) class enables features like object picking or clicking. In a 3D scene it’s hard to know where the user is clicking. You have to imagine a line from the camera through the mouse/controller and find which objects are colliding with that line. The ones intersecting with the ray caster, in our case the rope, will be highlighted red to tell the user that the object is interactive. When clicked, the fire expands and the balloon flies higher up.
{% include post-image.html alt="Interacting with the balloon" src="/images/blog/2017-05-17-interactive-webvr/nat-balloon.gif" margin="both" ratio="16_9"%}

The moose experience uses custom hand models instead of HTC Vive controller models which makes the experience feel more immersive. The hands we used were created by the Mozilla VR team and come from the [Puzzle Rain](https://blog.mozvr.com/puzzle-rain/) experiment. 
{% include post-image.html alt="Custom hands models" src="/images/blog/2017-05-17-interactive-webvr/david-hands.gif" margin="both" ratio="16_9"%}


## Exciting times ahead

As for now, WebGL is the main solution for WebVR. We have been seeing an increasing amount of WebGL sites recently and for a good reason. It encourages the most imaginative and abstract ideas and designs. Thus creating some truly amazing and innovative web experiences. 

There are however new cool tools on the block such as A-Frame, which uses a DOM declarative approach. This means that developers can create 3D and WebVR scenes using HTML. The ease of building 3D/VR content this way lets web developers and designers get into the WebVR ecosystem with very little effort. It’s predicted that we will soon be able to build DOM-only virtual reality experiences.

{% include blog-quote-small.html quote="Developers should be able to create compelling VR experiences, or adapt existing sites, without having to use WebGL. HTML and CSS are the languages we have. They may not seem obvious candidates to be great VR design tools, but we believe they will be, with relatively little effort."%}

{% include blog-quote-small.html quote="Adding models should be as easy as adding images. A &lt;model&gt; element with glTF support would trigger an explosion of creative possibilities." author-name="Josh Carpenter, UX Lead for WebXR @ Google" author-link="https://twitter.com/joshcarpenter"%}

{% include post-image.html alt="A slide from WebVR Workshop by Josh Carpenter" caption="true" src="/images/blog/2017-05-17-interactive-webvr/webvr-slide.gif" margin="both" ratio="16_9" link="https://docs.google.com/presentation/d/1CSgOsiyn2PeLGlJCnrmmTYv9FLE_dmCaVKp7fZ-SF2I/edit#slide=id.g186a1bfda4_0_58" %}


## Summing up 

THREE.js has once again turned out to be a great library for creating simple WebVR experiments. Even though it occasionally makes you struggle and reverse engineer one of its many examples to find the functionality you’re looking for. It’s without a doubt one of the best 3D libraries which allows you to explore all the wonders of WebGL. As we dive deeper into it we find it more and more fun to work with. 

{% include blog-author-natalia.html %}
