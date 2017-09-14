---
layout: post
title:  "Designer friendly WebVR"
description: WebVR is the easiest entry point to dive into VR. We created two new, interactive experiments to explore its potential.
og_image: /images/blog/2017-09-18-to-be-named/flamingo-sunset.jpg
---

# Designer friendly WebVR

The development of WebVR is well under way as browsers catch up with support and the number of users engaged in building new tools and libraries increases. Creating immersive WebVR experiences has become a lot less esoteric and it’s no longer exclusive for professional developers or 3D modelers.

New tools such as [Google Blocks](https://vr.google.com/blocks/) and [A-Frame](https://aframe.io/) mean anyone with little coding experience can design and develop beautiful scenes in 3D.

In this post we’ll show you how.

 
[Get the code](https://glitch.com/edit/#!/flamingo-sunset)
{% include iframe-embed.html src="https://flamingo-sunset.glitch.me/" title="Sunset scene with A-Frame" height="400" %}

## Finding your inner 3D artist

Let your imagination go wild and design anything you want with [Google Blocks](https://vr.google.com/blocks/), an app that will turn any geek into a creative artist (access to HTC Vive or Oculus Rift is required). Modeling with Blocks is much more intuitive than trying to create a model on a 2D screen. You get to see and experience your creative actions in real time within the virtual world itself instead of having to imagine what the finished model will look like in VR.
 

Be patient even if your first masterpiece looks dreadful at first. It goes quickly to get the hang of it.
{% include post-image.html alt="Our first vs. second try at making a model" caption="true" src="/images/blog/2017-09-18-to-be-named/blocks-models.jpg" margin="both" ratio="16_9" %}
If you don’t have access to a VR headset, the [Google Blocks gallery](https://vr.google.com/objects) is full of amazing models you can use. 

## Project setup

[Glitch](https://glitch.com/) provides a simple way to setup, edit and share your coding projects. By letting you remix already existing examples, it’s very designer friendly and avoids the confusion of setting up a project with long lines of code. Copying the [starter example of A-Frame](https://glitch.com/~aframe), you can jump start your project and get straight to adding the content you want. 

## Importing models

When publishing and downloading your Blocks model, it comes in two different file formats. The .OBJ defines the 3D geometries, while the .MTL contains material information such as colors and textures. 

To import the model with A-Frame simply specify the paths to both files in asset items. Then point to them from the [obj-model](https://aframe.io/docs/0.6.0/components/obj-model.html) component which loads the 3D model and materials for us.


## Animated models

The flamingo we used in the sunset scene comes from [Rome, Three Dreams of Black](http://www.ro.me/tech/) project. If you're using an animated model like this one, it most likely comes in a [glTF](https://www.khronos.org/gltf) or a JSON format. These formats store all the necessary information about the model including geometries, materials and animations.

{% include iframe-embed.html src="https://flamingo.glitch.me/" title="Flamingo model" height="400" %}

For loading a glTF model, you can use the [A-Frame primitive](https://aframe.io/docs/0.6.0/primitives/a-gltf-model.html). The JSON files require a json loader which isn’t built into the framework but comes with [A-Frame Extras](https://github.com/donmccurdy/aframe-extras). It’s a library of various, cool add-ons. All you need to do is load it in your project and the json-model component (together with lots of oher great ones) will be automatically registered and ready to use.
[See how to use it.](https://glitch.com/edit/#!/flamingo)

If your JSON models includes an entire scene, or multiple meshes, you’ll need to use the object-model component instead. 


## Changing colors

If you’re making a model in Blocks and being outraged by the limited color palette it offers, there is a way around it. 
You can import your model into [Blender](https://www.blender.org/), a free 3D software, change the colors and re-export as .obj.

{% include blog-vimeo.html ratio="16_9" vimeoId="233836298" %}

## Making it pretty

Sometimes, when importing a model into the scene, the vision of your masterpiece might get crushed after it’s loaded.
{% include iframe-embed.html src="https://plain-gem-stones.glitch.me/" title="Flamingo model" height="400" %}
Don't flip the table though, we have a couple of tips for making it look much better.
{% include iframe-embed.html src="https://magic-gem-stones.glitch.me/" title="Flamingo model" height="400" %}

### 1. Play with the lights

A-Frame automatically injects a default lighting, which is disabled as soon as we add any [lights](https://aframe.io/docs/0.6.0/components/light.html) ourselves. In 3D, the lights can do much more than just illuminate the scene.

The materials absorb the light’s colors so placing them around the model might be a great way of changing its look. By playing with the lights you can set the mood of your scene, create illusions and visual interests. 
In the examples above, the only difference is the amount, intensity and colors of lights in the scene.


### 2. Make it foggy

Applying fog to the scene can make a big difference and create a sense of scale or add a mystical feeling. 

[example]

### 3. Add a particle system

Apart from creating elemental effects like rain, snow or fire, the particles can be used to simply generate some motion and enhance the scene.

[example]

### 4. Touch it up

If you’ve spent hours tweaking your lights and composition, but still not satisfied with the final render, it's worth trying some post processing effects. We have added some noise to the sunset scene to achieve a more retro look, but there are a lot more filters to play with. 

{% include iframe-embed.html src="https://flamingo-sunset-cartoon.glitch.me" title="Flamingo model" height="400" caption="Sunset scene with a cartoonish look"%}

{% include iframe-embed.html src="https://flamingo-sunset-glitch.glitch.me" title="Flamingo model" height="400" caption="Glitch effect"%}
## Sharing is caring

A great thing about A-Frame is its thriving community of creative thinkers. Often times new experiments and components are shared out freely for all to learn from. Thanks to A-Frame’s [ECS architecture](https://aframe.io/docs/0.6.0/introduction/entity-component-system.html) (Entity-Component-System), it’s easy to extend and share new features.  This benefits both developers, who save time by reusing components instead of building them from scratch, and coding beginners as they can easily attach otherwise complex elements to their projects.

The [A-Frame Registry](https://aframe.io/aframe-registry/), [Awesome A-Frame](https://github.com/aframevr/awesome-aframe) and the [blog](https://aframe.io/blog/) are the places to check out, if you want to find some useful and inspiring add-ons to enhance your VR project.

## Alternatives

For those who really shy away from code, but still want to experiment with their 3D models, Hologram is a tool worth checking out. It's an A-Frame based app on your desktop for making VR prototypes. No coding required. 

There’s also the slightly more advanced Three.js editor, which lets you import models (even entire Blocks .zip folders, without having to unpack them) play around with them and export objects, the scene or the entire project. 



## Summing up 



{% include blog-author-natalia.html %}
