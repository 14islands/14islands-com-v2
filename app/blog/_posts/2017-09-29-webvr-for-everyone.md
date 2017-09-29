---
layout: post
title:  "WebVR is for everyone. This is how to design and develop an experience."
description: Anyone with little coding experience can design and develop beautiful scenes in 3D.
og_image: /images/blog/2017-09-18-webvr-is-for-everyone/flamingo-sunset.jpg
---

# WebVR is for everyone - This is how to design and develop an experience.

The development of WebVR is well under way as browsers catch up with support and users get engaged in building new tools and libraries. 

Creating immersive WebVR experiences is no longer exclusive for professional developers or 3D modelers. New tools such as [Google Blocks](https://vr.google.com/blocks/) and [A-Frame](https://aframe.io/) mean anyone with little coding experience can design and develop beautiful scenes in 3D.

In this post we’ll show you how.
 
[Get the code](https://glitch.com/edit/#!/flamingo-sunset)
{% include iframe-embed.html src="https://flamingo-sunset.glitch.me/" title="Sunset scene with A-Frame" height="400" %}

## Find your inner 3D artist

Let your imagination go wild and design anything you want with [Google Blocks](https://vr.google.com/blocks/), an app that will turn any geek into a creative artist. Modeling with Blocks is much more intuitive than trying to create a model on a 2D screen. You get to see and experience your creative actions in real time within the virtual world itself instead of having to imagine what the finished model will look like in VR.
 
Be patient even if your first masterpiece looks dreadful at first. It goes quickly to get the hang of it.
{% include post-image.html alt="Our first vs. second try at making a model" caption="true" src="/images/blog/2017-09-18-webvr-is-for-everyone/blocks-models.jpg" margin="both" ratio="16_9" %}
When the model is finished, simply hit publish and it will be available for export as OBJ straight away. Download the files and the model is ready to be used in our WebVR app.

 _Note: Google Blocks runs on HTC Vive and Oculus Rift. If you don’t have access to a VR headset, the [Google Blocks gallery](https://vr.google.com/objects) is full of amazing models you can use._

## Project setup

[Glitch](https://glitch.com/) provides a simple way to setup, edit and share your coding projects. By letting you remix already existing examples, it’s very designer friendly and avoids the confusion of setting up a project with long lines of code. Copying the [starter example of A-Frame](https://glitch.com/~aframe), you can jump start your project and get straight to adding the content you want. 

## Importing models

The blocks models are exported as two different file formats. The .OBJ defines the 3D geometries, while the .MTL contains material information such as colors and textures. 

To import the model with A-Frame simply specify the paths to both files in asset items. Then point to them from the [obj-model](https://aframe.io/docs/0.6.0/components/obj-model.html) component which loads the 3D model and materials for us.
{% highlight HTML %}
<a-assets>
  <a-asset-item id="your-obj" src="model.obj"></a-asset-item>
  <a-asset-item id="your-mtl" src="model.mtl"></a-asset-item>
</a-assets>
<a-entity obj-model="obj: #your-obj; mtl: #your-mtl"></a-entity>
{% endhighlight %}

If you can’t see your model but get no errors in the console, try scaling it down, or up.
{% highlight HTML %}
<a-entity obj-model="obj: #your-obj; mtl: #your-mtl" scale="0.1 0.1 0.1"></a-entity>
{% endhighlight %}

## Changing colors

If you’re picky about your colors and outraged by the limited colors palette that Google Blocks has to offer, there is a way around it. 
You can import your model into [Blender](https://www.blender.org/), a free 3D software, change the colors and re-export as .obj. 

{% include blog-vimeo.html ratio="16_9" vimeoId="233836298" %}

Mind the Blender settings, which might automatically apply specular light to your material.
{% include post-image.html alt="Blender settings" src="/images/blog/2017-09-18-webvr-is-for-everyone/blender-materials.png" margin="both" ratio="16_9" %}
Change the specular light's intensity back to 0, otherwise the model will appear more glossy when rendered. 

## Enhancing the visuals

Sometimes, when importing a model into the scene, the vision of your masterpiece might get crushed after it’s loaded.
{% include iframe-embed.html src="https://plain-gem-stones.glitch.me/" title="Flamingo model" height="400" %}
Don't flip the table though, we have a couple of tips for making it look much better.
{% include iframe-embed.html src="https://magic-gem-stones.glitch.me/" title="Flamingo model" height="400" %}

### 1. Play with the lights

A-Frame automatically injects a default lighting, which is disabled as soon as we add any [lights](https://aframe.io/docs/0.6.0/components/light.html) ourselves. In 3D, the lights can do much more than just illuminate the scene.

The materials absorb the light’s colors so placing them around the model might be a great way of changing its look. By playing with the lights you can set the mood of your scene, create illusions and visual interests. 
In the examples above, the only difference is the amount, intensity and colors of lights in the scene.

 _Note: You should always try to keep the amount of lights to the minimum as it’s computationally expensive to render them._

### 2. Apply fog

Adding fog to the scene can make a big difference and create a sense of scale or add a mystical feeling. 

### 3. Add a particle system

Apart from creating elemental effects like rain, snow or fire, the particles can be used to simply generate some motion and enhance the scene.

### 4. Touch it up

If you’ve spent hours tweaking your lights and composition, but still not satisfied with the final render, it's worth trying some [post processing effects](https://github.com/wizgrav/aframe-effects). We have added some noise to the sunset scene to achieve a more retro look, but there are a lot more filters to play with. 

{% include iframe-embed.html src="https://flamingo-sunset-cartoon.glitch.me" title="Flamingo model" height="400" caption="Sunset scene with a cartoonish look"%}

{% include iframe-embed.html src="https://flamingo-sunset-glitch.glitch.me" title="Flamingo model" height="400" caption="Glitch effect"%}

## Sharing is caring

A great thing about A-Frame is its thriving community of creatives. Often times new experiments and components are shared out freely for all to learn from. Thanks to A-Frame’s [ECS architecture](https://aframe.io/docs/0.6.0/introduction/entity-component-system.html) (Entity-Component-System), it’s easy to extend and share new features. This benefits both developers, who save time by reusing components instead of building them from scratch, and coding beginners as they can easily attach otherwise complex elements to their projects.

The [A-Frame Registry](https://aframe.io/aframe-registry/), [Awesome A-Frame](https://github.com/aframevr/awesome-aframe) and the [blog](https://aframe.io/blog/) are the places to check out, if you want to find some useful and inspiring add-ons to enhance your VR project.

## Slightly more advanced: animated models

The flamingo we used in the sunset scene comes from [Rome, Three Dreams of Black](http://www.ro.me/tech/). The file for this model and all the other animal models can be found on the project’s [GitHub page](https://github.com/dataarts/3-dreams-of-black/tree/master/deploy/asset_viewer/files/models/animals). They come in JSON formats (with .js or .json extensions) and store all the necessary information about the model's geometries, materials and animations. The JSON files cannot be loaded through the obj-model component like we did with OBJ files. They require a [JSON loader](https://github.com/donmccurdy/aframe-extras/tree/master/src/loaders) which isn’t built into the framework but comes with [A-Frame Extras](https://github.com/donmccurdy/aframe-extras), a collection of various add-ons. 

Embed the library in your project and the json-model component (as well as many others) will be automatically registered and ready to use. The models often need to be scaled down. 

{% highlight HTML %}
<script src="//cdn.rawgit.com/donmccurdy/aframe-extras/v3.8.3/dist/aframe-extras.min.js"></script>
<a-entity scale="0.05 0.05 0.05" json-model="src: url(your-model.js);"></a-entity>
{% endhighlight %}

{% include iframe-embed.html src="https://flamingo.glitch.me/" title="Flamingo model" height="400" %}

If you’re using a JSON model, but it’s not showing and the console throws an error, your JSON model probably includes an entire scene, or multiple meshes. In this case you’ll need to use the object-model component instead.

{% highlight HTML %}
<a-entity object-model="src: url(your-scene.js);"></a-entity>
{% endhighlight %}

In order to play the model’s built in animation, we attach the [animation-mixer](https://github.com/donmccurdy/aframe-extras/tree/master/src/loaders) component, also part of the A-Frame Extras. The duration and repetition can be tweaked by accessing the component’s properties.

{% highlight HTML %}
<a-entity animation-mixer="duration: .6s;" json-model="src: url(your-model.js);"></a-entity>
{% endhighlight %}

[See the code.](https://glitch.com/edit/#!/flamingo)

## Alternatives

For those who really shy away from code, but still want to experiment with their 3D models, [Hologram](https://hologram.cool/) is a tool worth checking out. It's an A-Frame based app on your desktop for making VR prototypes. No coding required. 

There’s also the slightly more advanced [Three.js editor](https://threejs.org/editor/), which lets you import models (even entire Blocks .zip folders, without having to unpack them) play around with them and export objects, the scene or the entire project. 


## Share your creations with us! 

We will happily answer your questions and would love to view your projects. Ping us on [Twitter](https://twitter.com/14islands)!  



{% include blog-author-natalia.html %}
