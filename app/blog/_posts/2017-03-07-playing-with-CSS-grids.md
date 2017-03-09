---
layout: post
title:  "Playing with CSS Grids"
description: The CSS Grid layout has everything it needs to be considered the most powerful layout system in CSS.
og_image: /images/blog/2017-03-07-playing-with-CSS-grids/typography-02.png
private: true
---

# Playing with CSS Grids

There is a new CSS3 feature getting hotter at the moment and it’s for a good reason. That is the new [CSS Grid Layout](https://www.w3.org/TR/css3-grid-layout/).

The [CSS Grid Layout](https://www.w3.org/TR/css3-grid-layout/) has everything it needs to be considered the most powerful layout system in CSS. It is the first CSS module to feature a 2-dimensional system (rows and columns).

First things first, at the time of this writting you most probably have to [enable CSS Grids](http://caniuse.com/#feat=css-grid) to play with it. Thankfully, it is [not too difficult to do so](https://developers.google.com/web/updates/2014/03/Get-on-the-CSS-Grid#try_it_out).

_Note: CSS Grid is going to become supported-by-default in Chrome and Firefox in March of 2017.  Specifically, Mozilla will ship it in Firefox 52, scheduled for March 7th.  Due to the timing of their making Grid enabled-by-default in Chrome Canary, it appears Google will ship it in Chrome 57, scheduled for March 14th._ [(Source)](http://meyerweb.com/eric/thoughts/2016/12/05/css-grid/)

To give you an idea of why this is feature is exciting, take a [look at this](http://codepen.io/14islands/pen/2a76b95ce3a00f7c96805a47f95e8f5b):

{% include post-image.html alt="Codepen Screenshot" src="/images/blog/2017-03-07-playing-with-CSS-grids/screenshot-before.png" margin="both" ratio="16_10" link="http://codepen.io/14islands/full/BprPvM/" %}

Do you see those boxes? They can be moved around wherever you want, like a deck of cards on a table. Before CSS Grids, you’d have to make sure what you see in the screen follows a proper DOM order. Otherwise things could get a little trickier to build to achieve a similar result. To be fair, you could use the `order` [property on Flexbox](https://developer.mozilla.org/en/docs/Web/CSS/order) to change it's order but it still limits you to a 1 dimensional system (row _or_ column, not both).

Also note how a column/row can span into it’s “neighbors”. Like a beautiful spreadsheet without any old school CSS table syntax.

Let’s break this down a little bit.

## Designing for the content

Imagine you have a grid with *columns* and forget about the *rows* for a little bit - just to simplify ;).

Let’s use [this design](https://dribbble.com/shots/3257702-Editorial-Layout-1) as an example, from our good friend [Dennys Hess](http://dennyshess.ch/). This is what we will try to build with the new CSS Grid module.

{% include post-image.html alt="Editorial Layout" src="/images/blog/2017-03-07-playing-with-CSS-grids/typography-02.png" margin="both" ratio="4_3" link="https://dribbble.com/shots/3257702-Editorial-Layout-1" %}

Figure out how many columns it has:

{% include post-image.html alt="Editorial Layout" src="/images/blog/2017-03-07-playing-with-CSS-grids/columns.png" margin="both" ratio="16_9" %}

Now let’s go back to our first pen. Compare with the final design and you’ll see that [this is how I divided the content](http://codepen.io/14islands/pen/2a76b95ce3a00f7c96805a47f95e8f5b). The numbers follow a chronological order.

{% include post-image.html alt="Codepen Screenshot" src="/images/blog/2017-03-07-playing-with-CSS-grids/screenshot-before.png" margin="both" ratio="16_10" link="http://codepen.io/14islands/full/BprPvM/" %}

If I’d be reading a magazine, that’s the order that I would follow. I also interpreted the figures to be there for presentation purposes only, not affecting the flow of the text. 

That means that moving them anywhere would not affect what I’m currently reading. They are quite literally a HTML5 `<figure>`.

Usually a figure is an image, illustration, diagram, code snippet, etc., that is referenced in the main flow of a document, but that can be moved to another part of the document or to an appendix without affecting the main flow.

With this decided, we can figure out our `grid-template-columns`. The width of each column should be between the minimum that I have specified (300px) or a maximum of 1 "fraction" of the grid. We can use the `minmax()` function for that logic.

> 1fr is one "fractional unit", which is a way of saying "the remaining space in the element".
- [(MSDN)](http://social.msdn.microsoft.com/Forums/en-US/winappswithhtml5/thread/95fddeb2-04bc-4f2b-bfb6-ffecffe5e8d5/)

The syntax is simple, each space separated value corresponds to a column. Add more values to get more columns.

{% highlight CSS %}
grid-template-columns: minmax(300px, 1fr) minmax(300px, 1fr) minmax(300px, 1fr) minmax(300px, 1fr)
{% endhighlight %}

Some media queries and `grid-template-rows` later, we end up with this result [following result](http://codepen.io/14islands/full/ggeJrP/):

{% include post-image.html alt="Codepen Screenshot with result" src="/images/blog/2017-03-07-playing-with-CSS-grids/screenshot-codepen.png" margin="both" ratio="16_10" link="http://codepen.io/14islands/full/ggeJrP/" %}

With a few tweaks, we can also re-use the grid for different [layout alternatives](http://codepen.io/14islands/full/vgwxQQ/).


## More on the syntax

The main ingredients of a CSS grid are:

- `display: grid` to enable the grid.
- `grid-template-column` and/or `grid-template-rows` to specify how your layout looks like.
- `grid-column` and/or `grid-row` to put the elements in the grid that you just specified the layout above.

If you’re familiar with `Flexbox`, you probably guessed that `display: grid` and `grid-template-*` goes in a “parent” element. Where as `grid-<column/row>` goes into individual elements.

There are also a few properties worth mentioning, like `grid-gap` in particular. I decided not to use it here because I appreciate the flexibility of utility classes. This way one can have a gap only on the left/right while in other places you can have in both directions and so on. 

I’ll let you [explore the other properties that are not covered here](https://css-tricks.com/snippets/css/complete-guide-grid/) :)

The alignments of items and are actually the same syntax as `Flexbox`: 

- `align-items` will align its items in a row axis
-  `justify-items` will align its items in a column axis

Not too bad, huh? Nice that it re-uses some of the `Flexbox` syntax.

The syntax to position the element in a different grid row/column position is also pretty simple:

{% highlight CSS %}
grid-row: 2 / span 2 /* at row 2, spanning 2 rows from it */
grid-column: 4 /* simply at column 4 */
{% endhighlight %}

The values accepted for the properties are also worth mentioning, they can be:

- length unit (like `px`, `em`, percentages or `fr` for "fractions")
- `auto` (or `fit-content`)
- `mincontent()`, `maxcontent()`, and `minmax()`, or the `repeat()` function.

These new functions specifically make the grid smarter to calculate the row/column sizes.


## Conclusion

> Front-end design is finally making print-like design easier to achieve.

The flexibility is the beauty of CSS Grids. It is not just “easier” to build a layout like the one showed here. It’s not just about saving time. It’s about building how it’s supposed to be built. Now you can use a hammer to actually hit a nail instead of using some duck tape.

We are finally reaching an era where web design gives you the **proper** capabilities to achieve more flexible design layouts. 

## References:
- [A Complete Guide to Grid](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)

{% include blog-author-marco.html %}
