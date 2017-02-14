---
layout: post
title:  "WebVR experiment with three.js"
description: Exploring the magic world of WebGL and the WebVR API.
og_image: /images/blog/2016-11-webvr/aeronaut-north-pole.jpg
---

# WebVR experiment with three.js

Recently we've been exploring the magic world of WebGL and the WebVR API.

{% include post-image.html alt="Aeronaut WebGL WebVR experiment" src="/images/blog/2016-11-webvr/aeronaut-north-pole.jpg" margin="both" ratio="16_10" %}

We used [webvr-boilerplate](https://github.com/borismus/webvr-boilerplate) as a starting point which is a THREE.js base for VR experiences that works in both Google Cardboard and other VR headsets such as the [HTC Vive](https://www.vive.com).

The boilerplate contains a webvr-manager which facilitates the entering and exiting of VR mode. It relies on the [webvr-polyfill](
https://github.com/borismus/webvr-polyfill) to provide VR support if the WebVR API is not implemented.

The great thing about WebVR is that it's quite easy to progressively enhance the experience for VR enabled devices, and at the same time deliver a nice 3D experience for our regular screens.

<figure class="u-margin-both-half">
	<iframe class="instagram-media instagram-media-rendered" id="instagram-embed-0" src="https://www.instagram.com/p/BMZSPUMjHiO/embed/captioned/?v=7" allowtransparency="true" frameborder="0" height="763" data-instgrm-payload-id="instagram-media-payload-0" scrolling="no" style="background: rgb(255, 255, 255); border: 0px; margin: 1px; max-width: 658px; width: calc(100% - 2px); border-radius: 4px; box-shadow: rgba(0, 0, 0, 0.498039) 0px 0px 1px 0px, rgba(0, 0, 0, 0.14902) 0px 1px 10px 0px; display: block; padding: 0px;"></iframe>
</figure>

It was awesome to see how easy it is to access the Vive Controllers, thanks to the THREE.js [ViveController](https://threejs.org/examples/js/vr/ViveController.js) class.

Seems like the future is here to stay!

## Get the code

You can get the code for our [Aeronaut experiment](https://github.com/14islands/aeronaut) on GitHub. For now, you'll need an experimental [WebVR build of Chrome](https://threejs.org/examples/js/vr/ViveController.js) in order to try it in HTC Vive.

_Note: current version is optimized for desktop (using mouse to steer) and HTC Vive (using Vive controller to steer). The mobile Cardboard experience could use a bit more work since there's currently no way to steer the plane._

Feel free to fork our [repo](https://github.com/14islands/aeronaut) and add more aweomeness!


{% include blog-author-david.html %}
