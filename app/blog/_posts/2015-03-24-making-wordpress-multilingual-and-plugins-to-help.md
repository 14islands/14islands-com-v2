---
layout: post
title:  "Making WordPress multilingual and plugins to help"
description: "One important feature missing when using WordPress as a CMS is multilingual support. Translations of dynamic content for different languages needs a plugin"
keywords: WordPress, multilingual, multi-lang, multi-languages, internationalisation, Wordpress.org
og_image: /images/blog/wordpress/multilingual/multilingual-hero.png
private: true
---

# Making WordPress multilingual and plugins to help

One important feature missing when using WordPress as a CMS is multilingual support. This means that we are on our own to figure out ways to-do this.

First, lets set the record straight.

1. WordPress does support [translation of static text strings inside PHP using *.po files](http://codex.wordpress.org/Translating_WordPress) in different languages.
2. Also, if you want to show different content for different languages and countries, [a multi-site setup](http://codex.wordpress.org/Create_A_Network) might be the path for you.

However, for translation of dynamic content in different languages within WordPress you need a plugin - assuming you don't wont write this logic yourself.


## The plugins

Enter the WordPress plugin forest. After doing a lot of research we found two multilingual plugins worthy of our attention. These are [Polylang](https://polylang.wordpress.com/) and [WPML](https://wpml.org/). 


## Polylang

Polylang is the newer player and looks very promising already. The user interface is good and the code-base is clearly written and crafted by a professional, so it feels good using it. Polylang is free.

It has limitations. As an example, one common "best practise" is to construct urls for different languages like this:

	/jobs - Default language 
	/es/jobs - Spanish
	/se/jobs - Swedish

These urls are simply not possible in Polylang because ["the slug"](https://wordpress.org/support/topic/whats-a-slug) is used as a unique identity in WordPress. It makes it really hard to work around the issue. Instead Polylang recommends these kind of urls:

	/jobs
	/es-jobs
	/se-jobs

OR, if you're lucky and words are not the same in the different languages:

	/jobs
	/empleos
	/jobb

This is the reason why we looked next into WPML.


## WPML

WPML has been around for a long time, it's widely used and seems to be the most mature option out there. It costs [$195 as a one time purchase](https://wpml.org/purchase/) and includes many features.

WPML makes it possible to change "the slug", making the desired url pattern possible:

	/jobs
	/es/jobs
	/se/jobs

To accomplish this and other features, WPML goes deep into the core functionality of WordPress. It even adds extra tables to the database, and it unfortunately has a reputation of being slow. They do have some [caching recommendations](https://wpml.org/2012/01/can-your-site-run-faster/), but from what we've read: performance is a concern for content heavy websites.

Apart from this caveat, the plugin worked well for our needs. We had no conflicts with other plugins such as [ACF](http://www.advancedcustomfields.com/), another core plugin on the project. 

At the moment WPML is still the best plugin out there for bigger WordPress sites.

 
## The editor process 

As a word of advice, including multilingual plugins in WordPress can make the editorial process quote a lot more complicated. I highly recommend writing easy-to-follow guidelines for editors to prevent them from getting lost. 

If you like, take a look at [one of the guidelines we wrote for one of our clients](https://docs.google.com/document/d/14Aw-igKKskUq4TrRkT1o9IGcy5f1glm23812ybXYnYM/edit?usp=sharing) on writing pages and posts in different languages using WPML. 

This will make the outcome better for everyone.

## Conclusion 

Multilingual support should be a core part of every CMS. 

WordPress is still showing its roots as a blogging platform but lets hope it will evolve fast and multilingual additions will be part of the core sooner than later.

In the meantime, our recommendation is to use Polylang for simple use cases, or when money is a limitation. WPML for bigger sites.

Have questions or feedback? Reply to [our tweet about it](https://twitter.com/14islands).

{% include blog-author-hjortur.html %}
