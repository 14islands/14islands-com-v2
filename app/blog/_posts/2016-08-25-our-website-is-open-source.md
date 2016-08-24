---
layout: post
title:  "Our Website is open source"
description: We built our site using Jekyll with Github for several reasons.
og_image: /images/blog/website-open-source/cat-16_10.jpg
private: true
---

# Our website is open source

[Our website](http://14islands.com/) has been fully [open source](https://github.com/14islands/14islands-com) since we released it around two years ago. We built the site using [Jekyll](https://jekyllrb.com/), a popular static website generator. 

The site is hosted on [Github](https://github.com/). We used Jekyll with Github for several reason:

* It’s fast
* It’s secure
* It’s version controlled
* It’s flexible
* It’s dev friendly
* It's limited

Let us talk about those in more details.

## It’s fast

There is no faster way to store a web pages then as static HTML files. It means the he site is loaded straight from the server without database queries or other speed bumps. 

On top of this we made performance a priority. We optimize images, minify JavaScript/CSS and lazy-load secondary parts on the pages. 

The site [currently ranks 75% on PageSpeed insights on mobile and 89% on desktop](https://developers.google.com/speed/pagespeed/insights/?url=14islands.com). Of course we aim to reach 100% on all devices *👊*{: class="emoji"}

## It’s secure

Content Management Systems (CMS) such as [WordPress](https://wordpress.org/) need to be monitored and kept up to date. This is to prevent attackers from taking down the site if security vulnerabilities come up. 

With static files security updates are not needed to prevent these kinds of attacks. 

The site is also served over  a secure connection (SSL) using [Cloudflare as a CDN](https://cloudflare.com). CloudFlare offers fast global delivery with SSL out of the box. 

## It’s version controlled

Since the website is all static files, we can use [Github Pages](https://pages.github.com/) for hosting. This is great as we already use [Git](https://git-scm.com/) with [Github](https://github.com/) for version control on all open source projects.

Github has useful tools for our development process. We can suggest improvements and ideas to the site by creating a *branch* and make a *pull request* to discuss before others can approve it.

Github Pages make deployment a breeze. We just push changes to a special *gh-pages* branch and voila! It's live.

## It’s flexible

Content Management Systems limit ability to layout content in a flexible way. This is what makes it easy for non-technical people to use these systems without breaking designs.
 
Jekyll is more flexible as content is added within the source code. It requires technical skills so we would still recommend CMS systems where non-technical people edit the content.

This approach fits 14islands perfectly as we are all technical people here that care deeply about design. 

[Our blog posts](14islands.com/blog/) are written and stored as Markdown, also big parts of [our case studies](14islands.com/work/). Other parts of the are simply made with good’ol HTML.

## It’s dev friendly

Jekyll allow us to use any tools we like for our front-end process. 

For the site we used [Gulp](http://gulpjs.com/) as a built tool, [Sass](http://sass-lang.com/) for CSS, [CoffeeScript](http://coffeescript.org/) for JavaScript, [Bower](https://bower.io/) as a front-end package manager and [NPM](https://www.npmjs.com/) for packages in [NodeJS](https://nodejs.org/en/).

As a fun site note, we have totally revampted our process since two years ago. Things move so fast in the technology world. Today we use [Stylus](http://stylus-lang.com/) for CSS and [ES6](https://babeljs.io/docs/learn-es2015/) (Also known as ES2015) for JavaScript. Then we use NPM as a manager for all packages and [as a build tool](https://www.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/). 

The good thing is Jekyll is flexible and allows us adjust the process the way we want.

## It's limited

We have endless ideas we dream up when working on our own website. It can actually be helpful to have constraints put on our creativity. 

With Jekyll, there is no dynamic back-end technologies. It forced us to focus on the front-end side to enhance the experience. We still use JavaScript APIs to talk to services for dynamic content such as Google Maps. Overall, this was a good limit for us. Helped us ship our own site on time.

## Conclusion

The site was a great milestone for us as a company. We been adding new case studies, blog posts and features to it constantly since we shipped it. 

However, to be honest. We are already thinking of new directions to take our website going forward.

{% include post-image.html alt="Home Page of 14islands.com" src="/images/blog/website-open-source/14islands-home-page-16_10.png" margin="both" ratio="16_10" caption=true outline=true %}

{% include post-image.html alt="Work Page of 14islands.com" src="/images/blog/website-open-source/14islands-work-page-16_10.png" margin="both" ratio="16_10" caption=true outline=true %}

{% include post-image.html alt="This cat serves no purpose for this article, apart from being cute." src="/images/blog/website-open-source/cat-16_10.jpg" margin="both" ratio="16_10" caption=true %}

{% include post-image.html alt="About Page of 14islands.com" src="/images/blog/website-open-source/14islands-about-page-16_10.png" margin="both" ratio="16_10" caption=true outline=true %}


{% include blog-author-hjortur.html %}
