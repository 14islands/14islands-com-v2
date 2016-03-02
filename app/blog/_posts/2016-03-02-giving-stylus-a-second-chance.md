---
layout: post
title: "Giving Stylus a second chance"
description: "Stylus has all the features to expect from a CSS pre-processors and even a few nifty ones we like to tell you about it in this post."
og_image: /images/blog/stylus/open-graph-image.png
private: false
---

# Giving Stylus a second chance

Its been few years since we checked out the CSS pre-processor [Stylus](http://stylus-lang.com/). I just remember in the past, it was missing lots of important features that were included in popular tools such as [Sass](http://sass-lang.com/). Well, not anymore.

We got the chance to use it on a project lately and it was a pleasant surprise. It had all the features to expect and even a few nifty ones we haven't seen before. I like to tell you about it in this post.



## Good foundation

First of all, Stylus has what to expect from a modern CSS Pre-Processors: variables, mixins, extend, imports, functions, plus a good syntax to work with calculations, string interpolation and more.

Stylus is setup by using the popular Node Package Manager (NPM), making it easy for new developers to join the project. Just run *npm install* and be ready to rock.


## The Parent Selector

In our CSS, we like group styles into components under one parent selector and include all states together using the & parent selector. This structure is commonly used with CSS naming convention such as [SUIT](http://suitcss.github.io/) and [BEM](http://getbem.com/).

Example:

{% highlight Sass %}
.MyComponent
  
  &-link
    color: blue     
    &:hover
      color: pink
    &—active &
      color: yellow
    @media(min-width: breakpoint.medium)
      color: hotpink
{% endhighlight %}

The parent selector is part of most other CSS-preprocessors but I like to mention it here as we considered it an essential requirement. 


## Property Lookup

Now to an interesting feature that I hadn’t seen before using Stylus. 

It’s quite common to re-use the same values under one class. Stylus has a nice way of doing this using a feature called Property Lookup.

Example:

{% highlight Sass %}
.overlay
  position: absolute
  top: 50%
  left: 50%
  width: 300px
  height: 150px
  margin-left: -(@width / 2)
  margin-top: -(@height / 2)
{% endhighlight %}

By specifying an **@** in front of any property, the value of that property can be received within the same class. Simple, without creating extra variables to hold these values.


## Hashes

In our projects, we usually have a **Variables file** in that specifies common variables used in multiple areas. The file includes global variables for breakpoints, font size, gutters, z-indexes, gutters, colors etc.

Example from this file:

{% highlight Sass %}
// zIndex variables
zIndexHeader = 100
zIndexOverlay = 200

// Color variables
colorRed = #f93b5f
colorDarkRed = #1d0207
{% endhighlight %} 
    
Stylus offers a helpful feature to organise these variables called Hashes. You can think of it as JSON to structure your CSS.

Example:

{% highlight Sass %}
// zIndex variables
zIndex = {
  header: 100,
  overlay: 200
}  

// Color variables
color = {
  red: #f93b5f,
  darkRed: #1d0207
};
{% endhighlight %} 
   

Usage Example:

{% highlight Sass %}
.myClass
  color: color.red    
  zIndex: zIndex.overlay
{% endhighlight %}
    
This is a good way to organise code and make CSS more readable.

*Note: Sass 3.3 has a feature called **Maps** with the same intended purpose.* 

*Example:*

{% highlight Sass %}
$color: (
  red: #f93b5f,
  darkRed: #1d0207
);
{% endhighlight %}

*Usage Example:*

{% highlight Sass %}
.myClass {
  color: map-get($color, red);
}
{% endhighlight %}

*Personally prefer the Stylus implementation as it's cleaner and nicer to use.*


## The blend function

When working with Photoshop files from designers, it’s common to have areas with opacity were colors are blended with the background behind. This can make it tricky to find the actual color value to put in the code. Stylus has a built-in function called blend to help with this problem.

Example:

{% highlight Sass %}
blend(rgba(color.red, 0.5), color.black)
{% endhighlight %}

The **rgba** function takes in the colour of the area in front with the opacity and the **blend** function mixes it with the background area returning the correct color.

In many cases the input colors are re-usable within the project, so this can help making it possible to use global variables. Stylus has multiple built-in functions.
 

## One syntax to rule them all

Sass has two different syntaxes, one called **SCSS** that looks similar to normal CSS and another more stripped syntax called **Sass**.

This is good as developers might be more comfortable using one above the other. However, it can also cause confusions when working with Sass in general.

Stylus takes a different approach by allowing you to pick the level of granularity using the same syntax. The two examples are both Stylus.

Stylus Example 1:

{% highlight SCSS %}
body {
  font: 12px Helvetica, Arial, sans-serif;
}
{% endhighlight %}

Stylus Example 2:

{% highlight Sass %}
body
  font: 12px Helvetica, Arial, sans-serif
{% endhighlight %}

In my opinion this combines the best of both worlds. Developers have the freedom to pick granularity, with the advantage of using one combined syntax.


## Conclusion

Using stylus on this project turned out great. The code was readable and easy for new developers to join the project. We still love Sass, but mainly wanted to tell about the pleasant experience of trying out Stylus. 

Stylus also got a spanking new responsive website recently and their documentation is good. I encourage you to check it out.

{% include blog-author-hjortur.html %}