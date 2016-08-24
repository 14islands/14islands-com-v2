---
layout: post
title:  "Our Website is open source"
description: We built our site using Jekyll with Github for several reasons.
og_image: /images/blog/website-open-source/cat-16_10.jpg
private: true
---

# Our website is open source

[Our website](http://14islands.com/) has been fully [open source](https://github.com/14islands/14islands-com) since we released it around an year ago. We built the site using [Jekyll](https://jekyllrb.com/), a popular static website generator. 

The site is hosted on [Github](https://github.com/). We used Jekyll with Github for several reason:

* It’s fast
* It’s secure
* It’s version controlled
* It’s flexible
* It’s dev friendly
* It has limits

Let us talk about those in more details.

## It’s fast

There is no faster way to store a web pages then as static HTML files. It means the he site is loaded straight from the server without database queries or other speed bumps. 

On top of this we made performance a priority. We optimize images, minify JavaScript/CSS and lazy-load secondary parts on the pages. 

The site [currently ranks 75% on PageSpeed insights on mobile and 89% on desktop](https://developers.google.com/speed/pagespeed/insights/?url=14islands.com). Of course we aim to reach 100% on all devices *☀*{: class="emoji"}

## It’s secure

Content Management Systems (CMS) such as [WordPress](https://wordpress.org/) need to be monitored and kept up to date. This is to prevent attackers from taking down the site if security vulnerabilities come up. 

With static files security updates are not needed to prevent these kinds of attacks. 

The site is also served over  a secure connection (SSL) using [Cloudflare as a CDN](https://cloudflare.com). CloudFlare offers fast global delivery and free SSL out of the box. 

## It’s version controlled

Since the website is all static files, we can use [Github Pages](https://pages.github.com/) for hosting. This is great as we already use use [Git](https://git-scm.com/) with [Github](https://github.com/) for version control on all open source projects.

Github has useful tools for our development process. We can suggest updates to the site by creating new branches and make pull requests to discuss before others approve it.

Github Pages additionally make deployment a breeze. We just push changes to a special *gh-pages* branch and voila! It's live.

## It’s flexible

Content Management Systems limit how to layout content in a flexible way. This is what makes it easy for non-technical people to use these systems without breaking designs.
 
Jekyll is more flexible as content is added within the source code. It requires technical skills so we would still recommend CMS systems for non-technical people.

This approach fits 14islands perfectly as we are all technical people here that care deeply about design. 

[Our blog posts](14islands.com/blog/) are written and stored as Markdown, also big parts of [our case studies](14islands.com/work/). Other parts of the are simply made with good’ol HTML.

## It fits our process

Jekyll allow us to use any tools we like for our front-end process. For the site we used [Gulp](http://gulpjs.com/) as a built tool, [Sass](http://sass-lang.com/) for CSS and [CoffeeScript](http://coffeescript.org/) for JavaScript.

As a fun site note, we have totally revampted our process since year ago. Things move so fast in the technology world. Today we mostly use [NPM for build process](https://www.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/), [Stylus](http://stylus-lang.com/) for CSS and [ES6](https://babeljs.io/docs/learn-es2015/) (Also known as ES2015) for JavaScript.

The good thing is Jekyll is flexible and allows us adjust the process the way we want.

## It has limits

When working on our own site we have endless ideas we can dream up. There is actually good to be constrained by some limits.

...Need few lines here..

{% include post-image.html alt="Home Page of 14islands.com" src="/images/blog/website-open-source/14islands-home-page-16_10.png" margin="both" ratio="16_10" caption=true outline=true %}

{% include post-image.html alt="Work Page of 14islands.com" src="/images/blog/website-open-source/14islands-work-page-16_10.png" margin="both" ratio="16_10" caption=true outline=true %}

{% include post-image.html alt="This cat serves no purpose for this article, other then being cute." src="/images/blog/website-open-source/cat-16_10.jpg" margin="both" ratio="16_10" caption=true %}

{% include post-image.html alt="About Page of 14islands.com" src="/images/blog/website-open-source/14islands-about-page-16_10.png" margin="both" ratio="16_10" caption=true outline=true %}


{% include blog-author-hjortur.html %}
