---
layout: post
title:  "Why we chose React for our latest hybrid app"
description: "We recently had the pleasure of working with Fjord to prototype and build an HTML5 hybrid app for one of their clients."
og_image: /images/blog/why-react/screenshot.jpg
private: true
---

# Why we chose React for our latest hybrid app

**We recently had the pleasure of working with [Fjord](https://www.fjordnet.com/){:target="_blank"} to prototype and build an HTML5 hybrid app for one of their clients.**

{% include post-image.html alt="HTML5 hybrid app using React" src="/images/blog/why-react/screenshot.jpg" margin="both" ratio="custom_35" %}

Hybrid apps provide a way to build an application using web technologies and package it as native apps for multiple mobile platforms.

In this article we share the techniques and challenges we faced while building an app for iOS and Android using [React](https://facebook.github.io/react/){:target="_blank"} &amp; [Cordova](https://cordova.apache.org/){:target="_blank"}.

_**Note:** React Native was announced during 2015, however when this project started, React Native for Android had not been released making it a no-go for us._


## The hybrid challenge
Writing hybrid apps is nothing new and it’s certainly not the right choice for all applications. The challenge is to achieve the premium feeling of a native app with smooth animations and a snappy interface. 

We’ve ventured down this path [many times](http://blog.14islands.com/post/52546836134/case-study-betting-on-a-fully-responsive-web){:target="_blank"} in [the past](http://blog.14islands.com/post/52934733389/racer-a-chrome-experiment){:target="_blank"} using more conventional JavaScript MVC frameworks such as Backbone.js. 

Most hybrid projects start with a fast, responsive UI - until you hit a wall. This usually appears late in the project, after weeks of adding functionality and more and more content has been injected into the DOM. 

The relationship of view components become hard to keep track of, and circular dependencies of event listeners cause too many reads/writes to the DOM.


## Enter React
[React](https://facebook.github.io/react/){:target="_blank"} is a JavaScript library for creating user interfaces and is often described as the *V* in *MVC*. The idea behind React is to build reusable components that automatically manage all UI updates.

React knows when to re-render a component based on its state, and keeps a virtual DOM for efficient re-rendering. This approach is great because it lets us write our code as if we were re-rendering the entire template, and React will make sure to only update the part of the DOM that changed.

### JSX
The big difference from normal frameworks is that JavaScript logic and Markup templates are written in the same file using JSX syntax.

{% highlight HTML %}
class MyTitle extends Component {
  render() {
    return (
      <header>
        <h1>Hello World</h1>
      </header>
    )
  }
}
{% endhighlight %}

It takes a while getting used to but it does wonders for your productivity.


### Mixins vs Composition
We are big fans of modern JavaScript and opted for writing ES2015 syntax using [Babel](https://babeljs.io/){:target="_blank"}.

Mixins cannot be used with ES2015 classes and there are other [good reasons not to use them](https://medium.com/@dan_abramov/mixins-are-dead-long-live-higher-order-components-94a0d2f9e750#.6uq9fmvgn){:target="_blank"}. We used Higher-order-components to compose functionality instead of mixins:

{% highlight JavaScript %}
/**
 * Exports a higher order component wrapping the component to decorate
 * @param ComponentToDecorate the component which will be decorated
 */
export const withDecoratedData = ComponentToDecorate =>
  class extends Component {
    constructor() {
      this.state = { data: null };
    }
    componentDidMount() {
      this.setState({ data: 'Decorated hello!' });
    }
    render() {
      return <ComponentToDecorate {...this.props} data={this.state.data} />;
    }
  }
{% endhighlight %}

Compositions can then be applied using ES2016 Decorators which we chose to enable in Babel:

{% highlight JavaScript %}
import {withDecoratedData} from '...';

// Decorate component using ES7 decorator '@'
@withDecoratedData
class MyComponent extends Component {
  render() {
    return <div>{this.data}</div>;
  }
}
{% endhighlight %}

We used this approach to hook up View components with our Data stores.

## Unidirectional data flow
There's more to an app than just the view layer - and this is where it gets tricky. React can be used in combination with most other frameworks out there to render your existing data model. However, the problems with large scale MVC applications and cyclical dependencies are still there, so Facebook created the Flux design pattern which has a "unidirectional data flow" to make it more predictable.

{% include post-image.html alt="Flux data flow" src="/images/blog/why-react/flux-flow-annotated.png" margin="both" ratio="custom_55" %}

There are endless implementations of Flux and after researching many of them we settled on using [*Alt* ](https://github.com/goatslacker/alt){:target="_blank"}.

## UI styling & animations
In order for an app to feel native it’s super important that the UI has smooth animations at a steady 60 FPS and no flicker. Mobile browsers have noticeably slow JavaScript performance so we made sure to only use pure CSS animations and transitions.

### Inline styles vs CSS
One of the hottest topics in the React world lately is whether to use Inline Styles, i.e. setting styles with an element’s style property instead of CSS.

Let's be honest, we love CSS and are not too fond of this approach. CSS has a clear separation of concerns and we as web developers already know how to efficiently apply Responsive Web Design principles to support different capabilities and screen sizes.

The biggest argument for Inline styles is that "State" is mostly a JavaScript concern, and a lot of times we need to change styles based on dynamic conditions. Though when you think about it, adding and removing modifier classes is a perfect tool for propagating state changes already.

### BEM <3 React
We opted for writing the majority of our styles using Sass and the BEM class naming convention with a slight twist - we tweak the BEM block name to match the CamelCased JavaScript class name so we have a clear coupling of JavaScript and CSS for each component.

{% highlight HTML %}
class MyComponent {
  render() {
    const activeClass = this.props.active ? 'MyComponent--active' : '';
    return (
      <div className={"MyComponent " + activeClass}>
        <h1 className="MyComponent__title">
          My title
        </h1>
      </div>
    );
  }
);
{% endhighlight %}

This can quickly get a bit messy and verbose for a component with many state modifiers, so we created our own [bem-helper](https://github.com/14islands/bem-helper-js){:target="_blank"} to make it easier to work with BEM class names in JSX.

{% highlight HTML %}
import BEM from 'bem-helper-js';

class MyComponent {
  render() {
    return (
      <div className={BEM(this).is('active', this.props.active)}>
        <h1 className={BEM(this).el('title')}>
          My title
        </h1>
      </div>
    );
  }
);
{% endhighlight %}

It automatically takes the block name from the JavaScript class name, and assuming `this.props.active` is `true` the following class names will be rendered:

{% highlight HTML %}
<div class="MyComponent MyComponent--active">
  <h1 class="MyComponent__title">My title</h1>
</div>
{% endhighlight %}

### Animating with React

For someone who is used to adding classes or modifying styles manually this can be a bit uncomfortable. We have to take a step back and let React handle all updates of the DOM.

*Most popular animation libraries will access the DOM directly so be careful with what you chose.*

Luckily the React team has already provided us with the [ReactCSSTransitionGroup](https://facebook.github.io/react/docs/animation.html){:target="_blank"} which solves the most common scenario of applying animation classes and adding/removing animating elements from the DOM. It worked great for handling the page transitions in our app.


## Wrapping it up
We used [Apache Cordova](https://cordova.apache.org/){:target="_blank"} to package the app for iOS and Android. It's fairly straightforward to setup, and it comes with a bunch of useful plugins that expose a JavaScript API to access certain native features. 

As an example, we included the [Statusbar plugin](https://github.com/apache/cordova-plugin-statusbar){:target="_blank"} to change the color of the native statusbar during runtime.

{% include post-image.html alt="Crodova statusbar plugin" src="/images/blog/why-react/statusbar.png" margin="both" ratio="custom_10" %}

Since iOS 8 we finally have access to scroll events during scrolling inertia (the scrolling motion that continues after release of the touch). **This is not the case using the old UIWebView which is still default in Cordova.**

There is an official [cordova plugin for the new WKWebView](https://github.com/apache/cordova-plugin-wkwebview-engine){:target="_blank"} for iOS 9 users. However, it's not possible to use XHR from the file:// protocol without CORS enabled which prevented us from using it.


## Summary
We are super happy with our choice to go with React for this project, but we would keep a few things in mind and make some adjustments for next time.

**The good stuff**

* Improved render performance - React manages updates to the DOM very efficiently
* Easy to write reusable components
* Powerful JSX syntax for combining data and markup templates
* Productivity is high once all architectural decisions have been made and components start being reused
* Protects developers from touching the DOM directly (i.e. less risk to do something that hurts performance)

**The not so good stuff**

* Tricky to implement complex timeline animations using the React State without resorting to manually touching the DOM.
* Not a complete solution - hard for inexperienced developers to get started. Need to pick a Router, a Flux library / data layer, etc.
* New React versions released relatively often and the ecosystem is immature - most plugins change even more often than React and API changes happens all the time. We had breaking API changes during this project in both `react-router` and `Alt`. `Alt` proved to be changing quickly and documentation was out of date. We'll keep our eyes on [*Redux*](https://github.com/reactjs/redux){:target="_blank"} for the next React project.



#### Where to go from here
*React Native is currently gaining momentum and it will be interesting to follow. The key difference is that has a proxy layer between JavaScript and the native SDK. It runs JavaScript code in a separate thread, making it possible to have smooth animations while executing other operations. React Native has also chosen inline styles over CSS using a Flexbox approach. It's estimated that over [85% of the codebase will be shareable](http://nerds.airbnb.com/facebook-react-native/){:target="_blank"} between iOS and Android.*


{% include blog-author-david.html %}
