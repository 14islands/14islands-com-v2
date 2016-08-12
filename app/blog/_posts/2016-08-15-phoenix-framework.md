---
layout: post
title:  "Why I’m excited about Phoenix Web Framework, with Elixir and Erlang"
description: Phoenix is both fast and productive with powerful underlying technologies; Elixir & Erlang.
og_image: /images/blog/phoenix/open-graph-image.png
---

# Why I’m excited about Phoenix Web Framework, with Elixir and Erlang

[Ruby on Rails](http://rubyonrails.org/) is a server-side framework that makes it possible to write database driven web apps in days, instead of weeks. 

Using Rails has however always meant sacrificing performance of writing the framework. Ruby is a slow-ish language and apps grow into big monoliths. 

{% include blog-quote.html quote="The Ruby programming language. Do things that are worse for the machine, that make programs run slower, but widen the smile on a programmer’s face." author-image-src="/images/work/montgomery/rm-large.jpg" author-name="DHH, the creator of Rails, creator of Rails" author-link="https://twitter.com/chris_mccord" %}

[The Phoenix Framework](http://www.phoenixframework.org/) is both fast and productive. What came as an additional surprise is a massive benefit of underlying technologies, the Elixir programming language and the Erlang Virtual Machine. 


## The Phoenix Framework 

On the surface, Phoenix appears to be similar to Rails. It's a server-side MVC framework with same concepts such as migrations, generators and more. This makes it easier for developers with Rails background to enter Phonenix. The internals are however totally different.

### Channels

{% include blog-quote.html quote="Channels is why I started the Framework." author-image-src="/images/work/montgomery/rm-large.jpg" author-name="Chris McCord, creator of Phoenix" author-link="https://twitter.com/chris_mccord" %}

Channels are a real-time layer built into Phoenix. The idea is that writing real-time apps should be trivial. Phoenix is optimised for concurrency, and said to handle 2 million real-time connections on one machine at the same time. 

There increasing amount of connected devices on the web, from smart phones to smart toasters. One of Phoenix design goals is to support multiple devices and there are already clients libraries available for The Web, Swift, ObjectC and Android.

### Modern front-end tools

Phoenix uses Node Package Manager (NPM) for client-side tooling. This is great as most front-end libraries are already available as an NPM package.

The default build tool is the little known [Brunch](http://brunch.io/). It works well out of the box, but can be skipped for using other build tools. Example:

 ```mix phoenix.new —no-brunch```

Phoenix promotes using ES6 for JavaScript and includes modules that can added to talk to Phoenix. Here is an example in JavaScript for importing sockets to talk to Channels:

``import sockets from phoenix`

Live Reload is part front-end stack, so every time a file is saved the page automatically updates in the browser.

Phoenix is not opinionated about CSS libraries or other frameworks. You are free to pick yourself.

## Elixir

Phoenix is built with [Elixir](http://elixir-lang.org/), a modern programming language created in 2009. 

Elixir is a dynamic, functional language. Functional means it has no classes, object instances or inheritance - leading to simpler code. 

Elixir syntax is nice and can accomplish a lot in few lines of code. I recommend reading the [Elixir website to learn more about the language features](http://elixir-lang.org/). 

Elixir ships with a great set of tools to ease development. A build tool called Mix, Testing tool called ExUnit, an Interactive Shell called IEX and others.

## Erlang Virtual Machine

Elixir is a compiled language, making it faster. The compiled code runs on the Erlang Virtual Machine; That is where magic happens. 

Erlang was built for telecom by Ericsson in 1986. It currently handles around 50% of the world telecom traffic. 

A telephone network needs to operate regardless of the number of simultaneous calls, unexpected issues, or upgrades taking place. Those became the Erlang’s design goals:

* Concurrency
* Distribution
* Fault Tolerance
* High Availability

Surprisingly these goal fit very well with nature of the modern web. 


### Concurrency

The world is not synchronous. Many things are concurrently happening around you now while you read this. 

The same is true for software. Software talks to multiple users, on multiple devices and performs multiple tasks, all at the same time.

Most platforms offer threads and background processes to deal with concurrency in a performant way. Developers know the complexity of using these technologies.

In Erlang this is made simple by using light-weight processes within the virtual machine. Processes are an isolated unit and communicate with each others by sending messages.

Erlang Virtual Machine spreads load on multiple cores to harness multiple CPU an unusual efficient way. It can also scale to multiple machines making it great to create distributed systems.


### Distribution

There is this debate in the software industry on whether to build big monoliths of code or smaller micro-services. Monoliths are simpler to build but impossible to scale. Micro-services scale better but are more complex to build and maintain as complexity grows with every new service.

I’ve talked to number of companies that have started with monoliths, but forced to re-write parts of the system as a micro-service to be able to scale and deploy in isolation from other parts of the system. One famous example is Twitter.

Erlang has an elegant solution to this problem. Since every process is an isolated unit and can communicate to the rest of the system on multiple servers - apps can scaled be infinitely.

This solving the problem of scaling.


### Fault Tolerance and High Availability

NodeJS is an asynchronous language running in one thread on the server. If something breaks it might take the whole system down.

Erlang has an different approach by using supervisors to monitor processes within the virtual machine. If a process goes down it will be restarted by its Supervisor without affecting other parts of the system. 

In Erlang you should in general not write **try-catch** statements. Processes should just fail, log the problem and be restarted again. The system is self-healing.


> In Erlang, there is an example of 99.999999999% availability

Update code live in production - zero downtime deploys. Not like NGinx 



## Conclusion

Phoenix is built to take advantage of the Elixir and Erlang features. Makes it faster (even views and tempaltes in Phoneix are compiled) 

In Phoenix, templates are compiled and routes are compiled.

In Phoenix each request and channels gets their own process.

It’s early days for Phoenix. It’s still not as mature as Rails and missing many comparable libraries. However, since the underlying technologies are mature - it’s ready for production.

Deployment is still a problem. It can be deployed to Heroku but it dosn’t suppport Erlang concurrency features. Deploying to your own setup requires time. I trust that somewhere in the world hackers are sitting in a dark room, eating pizza and solving the deployment problem.

The roots even go deeper then I imagined 


{% include blog-author-hjortur.html %}
