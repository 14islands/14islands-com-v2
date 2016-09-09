---
layout: post
title:  "Better way to use Modernizr with Command Line Config"
description: Modernizr is a useful JavaScript library to detect user browser capabilities on websites. We use it on most of our projects to provide the best user experience for each device.
og_image: /images/blog/modernizr/open-graph-image.png
---

# Better way to use Modernizr with Command Line Config

[Modernizr](https://modernizr.com/) is a useful JavaScript library to detect user browser capabilities on websites. We use it on most of our projects to provide the best experience on different user devices.

Modernizr has 259 built-in feature detections. The minified file with all detections included is 90.65 kB in size. That's quite big, specially considering that the file is added in the <head> of the HTML document.

This is why most developers [hand-pick features as needed from the Modernizr website](https://modernizr.com/download?setclasses) to include in the library. The process is manual and can take time, but now there is a better way.

## Command Line Config

Modernizr has shipped with a feature called [Command Line Config](https://modernizr.com/docs#command-line-config). It helps to automate the process, backed up by a [Modernizr NPM module](https://www.npmjs.com/package/modernizr). This module should be installed globally on the developer’s machine, example:

{% highlight Text %}
npm i -g modernizr
{% endhighlight %}

Next step is to create a config file at the root of the project and call it something like **modernizr-config.json**. Here is an simple example of a config file.

{% highlight Json %}
{
  "options": [
    "setClasses"
  ],
  "feature-detects": [
    "test/svg",
    "css/flexbox",
    "test/touchevents",
    "test/css/animations"
  ]
}
{% endhighlight %}

When you need to add a new feature detections, there is no need to head over to the Modernizr website and manually generate a new file. 

Simply define what you need in the config file. You can look at the [example file with all features included](https://github.com/Modernizr/Modernizr/blob/master/lib/config-all.json) to see what’s possible.

## Generate

The last step of the process is to generate a new **modernizr.js** file to a desired folder in the project. Run the following command.

{% highlight Text %}
modernizr -c modernizr-config.json -d path/to/lib/ -u
{% endhighlight %} 

* *-c* stands for **config**
* *-d* is for the **destination folder**
* *-u* is to **uglify/minify** the output 

Thanks to the Modernizr team to improve our process. 

{% include blog-author-hjortur.html %}
