---
layout: post
title:  "How to simplify custom fields for WordPress"
description: "For creating new posts, pages or other post types - WordPress only includes two fields by default, a title and free-form WYSIWYG editor. In reality, there is most often a need for more dynamic content for our sites."
keywords: WordPress, Custom Fields, Advanced Custom Fields, ACF, Meta boxes, Meta data
og_image: /images/blog/wordpress/customfields/customfields-hero.png
private: true
---

# How to simplify custom fields for WordPress

For creating new posts, pages or other post types - WordPress only includes two fields by default, a title and free-form WYSIWYG editor.

![WordPress default fields](/images/blog/wordpress/customfields/wordpress-default-fields.png)

In reality, there is most often a need for more dynamic content for our sites. This could be additional text, numbers, images, galleries, maps, relationships, repeating information and other types of content.

Take the [Tictail](https://tictail.com/) home page as an example, it's a page including lots of different content types. Behind the scenes this content is all editable within WordPress.

{% include post-image.html alt="Tictail Home Page Example" src="/images/blog/wordpress/customfields/tictail-home-page-example.jpg" margin="both" ratio="16_9" %}

How is this possible? The answer is custom fields.


## Native Custom Fields

WordPress has a simple custom fields functionality built into the admin interface. When creating new posts or pages, it's possible to put in additional meta data.

![WordPress Custom Fields User Interface](/images/blog/wordpress/customfields/wordpress-custom-fields-ui.png)

The metadata is stored as key/value pairs in a *wp_postmeta* table in the WordPress database. However, the admin interface only offers simple text fields to edit these values. 

To enhance this experience with different field types, you have to develop your own fields. Smashing Magazine has a good write-up about [the coding process of doing this](http://www.smashingmagazine.com/2011/10/04/create-custom-post-meta-boxes-wordpress/). In a nutshell, it's  a multi-step process that can take a lot of time and the potential for error increases with every custom field type.

We decided to go and look for plugins/libraries to solve this common task to save up development and testing time. The most promising option we have found is Advanced Custom Fields. 


## Advanced Custom Fields 

Advanced Custom Fields (ACF) is a popular plugin by many WordPress developers. It includes a clean admin interface, good documentation and a simple API. It also offers an extensive list of custom field types and a way to make your own fields.

![Custom field types with ACF](/images/blog/wordpress/customfields/acf-custom-field-types.png)

There is both a [free version](http://www.advancedcustomfields.com/) of ACF and a more feature rich [PRO version](http://www.advancedcustomfields.com/pro/) costing $100 AUD (around $77 USD) for unlimited number of sites.

Using ACF speeds up the development process and improves the experience for editors when managing content. 

The main caveat is that ACF stores custom fields in the WordPress database. This potentially slows loading and when fields change it requires syncing of databases instead of keeping the logic in code.

A recent version of ACF PRO includes a new feature called [Local JSON](http://www.advancedcustomfields.com/resources/local-json/) aimed to solve this problem. Local JSON stores field groups in a JSON file instead of database. The file acts as a cache and is automatically updated when making field changes through the admin interface.

The ACF documentation hints that the future of ACF could indeed be database-less. 

> The wp-admin field group edit screen will not load data from local json files. This functionality will hopefully soon make it’s way into the plugin.


## The Future

As with [the multilingual support](/blog/2015/03/26/simplify-custom-fields-for-wordpress/), it's surprising that common field types are not part of WordPress core.

There are individual efforts being made to solve the problem. Apart from ACF there are other interesting developments going on, an example is a library called [wp-papi](http://wp-papi.github.io/). WP-Papi offers an API approach to custom fields and its easy to imagine that something like this might make it into the core some day in the future.

In the meantime, we hope the tips in this article will prove to be useful for you.

Have questions or feedback? Reply to [our tweet about it](https://twitter.com/14islands).

{% include blog-author-hjortur.html %}
