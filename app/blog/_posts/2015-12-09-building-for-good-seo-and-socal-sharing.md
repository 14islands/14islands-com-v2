---
layout: post
title: "Building sites for good SEO and sharing on social networks"
description: "We strive to use the most modern practises for search engine optimisation (SEO) and social networks. Here are few to consider for any site."
og_image: /images/blog/seo/open-graph-image.png
---

# Building sites for good SEO and sharing on social networks

Search Engine Optimization (SEO) has gotten a bad reputation for cheap tricks that people use to “game the system” to get ahead in search results. 

However, there are solid practises that we recommend to consider when building any website. Search algorithms have been evolving fast adopting to mobile growth, and with the rise of social networks we should consider the shareability of our sites.

Here are few SEO and social sharing tips we use as developers.


## Responsive

It’s a mobile world where people use all kinds of devices and screen sizes. Google, the most popular search engine in the world, has started to label sites that are mobile friendly in search results when searching from mobile devices.

{% include post-image.html alt="Mobile First" src="/images/blog/seo/google-mobile-friendly-4_1.png" margin="both" ratio="4_1" %}

To make sure your site sites gets the “Mobile-friendly” label, check for your site the [Mobile-Friendly Test offered by Google](https://www.google.com/webmasters/tools/mobile-friendly/?url=http%3A%2F%2F14islands.com){:target="_blank"}.


## Performance

Most search engines have started to use performance as a ranking signal to improve the user experience. This is done because mobile devices are frequently on slower networks, and poorly optimised sites decrease the quality of search results.

> “75% of mobile users will leave the site if takes more then 5 seconds to load.” [Source](http://www.strangeloopnetworks.com/web-performance-infographics/){:target="_blank"}

To make sure your site performs well in the eyes of Google, check out your score in the [Google Speed Test tool](https://developers.google.com/speed/pagespeed/insights/?url=14islands.com){:target="_blank"}. As a rule of thumb; Aim for the mobile score of 75 / 100 at least.


## Google+

Not many people use Google+, but Google Search uses Google+ for additional details in search results. It’s important to setup a solid Google+ profile for companies/products to improve visibility.

{% include post-image.html alt="Google+ profile" src="/images/blog/seo/google_plus_info-2_1.png" margin="both" ratio="2_1" %}

The logo, name, map and other information are extracted from the Google+ profile.

Google Maps is often used by people to search for services in specific areas. The Google+ profile information is also used for the map, so a Google Map search by company is made possible and offers details.

{% include post-image.html alt="Google Maps" src="/images/blog/seo/google_maps_info-2_1.png" margin="both" ratio="2_1" %}

Note: Google+ profile updates can take few days to show up in results.


## Google Web Master Tools

When setting up the Google+ profile, you will be asked to authorise the ownership of your site through the [Google Webmasters tool](https://www.google.com/webmasters){:target="_blank"}.

Google Webmasters feels clunky and is a bit weird to fumble through. However, it offers useful information about how your site is perceived in the eyes of Google.

Example usages:

* Search Analytics
* External links to your site
* Internal links indexed by Google
* [robots.txt](http://14islands.com/robots.txt){:target="_blank"} file tester
* [Sitemaps](http://14islands.com/sitemap.xml){:target="_blank"} file tester
* more…

> “Get data, tools and diagnostics for a healthy, Google-friendly site.” [Google Webmasters](https://www.google.com/webmasters/){:target="_blank"}

## HTTPS

[Google has hinted that they might use SSL as a ranking signal](http://googlewebmastercentral.blogspot.se/2014/08/https-as-ranking-signal.html){:target="_blank"} for security reasons. This is not confirmed yet, but something to consider.

If you don’t know how to implement HTTPS, you can check out services such as CloudFlare CDN that offer a simple [SSL layer](https://www.cloudflare.com/ssl) as part of their [free plan](https://www.cloudflare.com/plans){:target="_blank"}.


## Open Graph

When people share links to our site on social networks, we have lots of control over how that information will show up. This is done by using the [Open Graph protocol](http://ogp.me/){:target="_blank"}.

The Open Graph protocol is supported by a wide range of social platforms. For a given site, consider the target audience and optimise the Open Graph tags to make sure pages have nice previews.

Here are few documentation pages from popular social sites:

* [Facebook Webmaster Docs](https://developers.facebook.com/docs/sharing/webmasters){:target="_blank"}
* [Twitter Cards Docs](https://dev.twitter.com/cards/overview){:target="_blank"}
* [Google+ Developer Docs](https://developers.google.com/+/web/snippet/){:target="_blank"}
* [Pinterest Rich Pins Docs](https://help.pinterest.com/en/articles/enable-rich-pins-your-site){:target="_blank"}

There is a super useful [article on the Moz blog](https://moz.com/blog/meta-data-templates-123){:target="_blank"} on how to combine and test these Open Graph tags when implementing. 

## Mind the basics

Finally, follow good practises for the site.

Use **Progressive Enhancement** principles so your site is always accessible by search engines.

Use solid markup and correct tags for their intended purpose. **Heading 1** (<h1>) for the main heading, **Heading 2** (<h2>) for secondary etc. The [HTML validator tool](https://validator.w3.org/){:target="_blank"} is useful to check and eliminate syntax errors.

The good’ol **title** tag and **description** meta tag are shown in search results and also important for indexing, so craft these with gold. 

In the end, the quality of content on the site is most likely to determine its success.

{% include blog-author-hjortur.html %}