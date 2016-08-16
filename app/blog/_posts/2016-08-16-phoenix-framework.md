---
layout: post
title:  "Why Phoenix is exciting for the modern web"
description: Phoenix is both fast and productive with powerful underlying technologies; Elixir & Erlang.
og_image: /images/blog/phoenix/open-graph-image.png
---

# Why Phoenix is exciting for the modern web

[Ruby on Rails](http://rubyonrails.org/){:target="_blank"} is a server-side framework that makes it possible to write database driven web apps in days, instead of weeks. 

Using Rails has however always meant sacrificing performance to gain developer productivity. Ruby is a slow language and apps grow into big monoliths. 

{% include blog-quote.html quote="Do things that are worse for the machine, that make programs run slower, but widen the smile on a programmer’s face." author-image-src="/images/work/montgomery/rm-large.jpg" author-name="DHH, the creator of Rails about the Ruby programming language" author-link="https://twitter.com/chris_mccord" %}

[The Phoenix Framework](http://www.phoenixframework.org/){:target="_blank"} is both fast and productive. What came as a surprise was a massive benefit of underlying technologies, the Elixir programming language and the Erlang Virtual Machine. 


## The Phoenix Framework 

Phoenix appears on the surface to be similar to Rails. It's a server-side MVC framework with same concepts such as migrations and generators. This makes it simpler for Rails developers to enter Phonenix. 

Be aware though, the internals of Phoenix are totally different.

### Going real-time

Channels are the real-time layer built into Phoenix. The idea is that writing real-time apps should be trivial to implement. 

Phoenix is optimised for multiple real-time connections, and said to handle 2 million concurrent connections on one machine at the same time. 

{% include blog-quote.html quote="Channels is why I started the Framework." author-image-src="/images/work/montgomery/rm-large.jpg" author-name="Chris McCord, creator of Phoenix" author-link="https://twitter.com/chris_mccord" %}

The amount of connected devices is increasing in the world, from smartphones to smart toasters. Phoenix is built for this brave new world.

There are already client libraries available for Web, Swift, ObjectC, Android and C# to communicate with Channels.

### Modern front-end tools

Phoenix uses [Node Package Manager (NPM)](https://www.npmjs.com/){:target="_blank"} for client-side tooling. This is great as most front-end libraries are already available as an NPM package.

The default build tool is the little known [Brunch](http://brunch.io/){:target="_blank"}. It works well out of the box, but can be skipped for using other build tools. Example:

 ```mix phoenix.new —no-brunch```

Phoenix promotes using [ES6](https://babeljs.io/docs/learn-es2015/){:target="_blank"} for modern JavaScript and includes ready modules to talk with  Phoenix back-ends. Example of importing sockets in JavaScript to communicate with Channels.

 ```import sockets from phoenix```

*Live-reload* is included in Phoenix by default, so every time a file is saved the page automatically updates in the browser.

Phoenix is not opinionated about CSS libraries or other front-end frameworks. You are free to pick yourself.

## Elixir

Phoenix is built with [Elixir](http://elixir-lang.org/){:target="_blank"}, a modern programming language created by [José Valim](https://twitter.com/josevalim){:target="_blank"} in 2009. 

Elixir is a dynamic, functional language. Functional means it has no classes, object instances or classic inheritance - leading to simpler code.

The syntax is nice and a lot can be accomplished in few lines of code. I recommend reading the [Elixir website to learn more about the language features](http://elixir-lang.org/){:target="_blank"}. 

Elixir ships with a great set of tools to ease development. A build tool called [Mix](http://elixir-lang.org/getting-started/mix-otp/introduction-to-mix.html){:target="_blank"}, Testing tool called [ExUnit](http://elixir-lang.org/docs/stable/ex_unit/ExUnit.html){:target="_blank"} and an Interactive Shell called [IEX](http://elixir-lang.org/docs/stable/iex/IEx.html){:target="_blank"}.


## Erlang Virtual Machine

Elixir is a compiled language, making it faster. The compiled code runs on the [Erlang Virtual Machine](http://www.erlang.org/){:target="_blank"}. This is where the magic happens. 

Erlang was built for telecom by [Ericsson](https://www.ericsson.com/){:target="_blank"} in 1986. It currently handles around 50% of the world telecom traffic. 

A telephone network needs to operate regardless of the number of simultaneous calls, unexpected issues, or upgrades taking place. Those became Erlang’s design goals:

* Concurrency
* Distribution
* Fault Tolerance
* High Availability

These goal fit surprisingly well with the nature of the modern web. 


### Concurrency

The world is not synchronous. Many things are concurrently happening around you now while you read this. 

The same is true for web apps. Modern web apps talk to multiple users, on multiple devices and perform multiple tasks, all at the same time.

Most platforms offer *threads* and *background processes* to deal with this kind of concurrency in a performant way. Developers know the complexity of using these technologies.

In Erlang concurrency is made simple by using light-weight *processes* within the virtual machine. Processes are an isolated unit and only communicate with each others by sending messages.

The Virtual Machine can spread load on multiple CPU cores on the same machine. It can actually harness the power of modern computers better thean most other platforms. 

Erlang can also easily be scaled to multiple machines, this brings us to the next section. 


### Distribution

There is a debate in the software industry on whether to build big *monoliths* of code or smaller *micro-services*. Monoliths are simpler to build but don't scale well. 

Micro-services scale better but are more complex to maintain as complexity grows with every new service.

I’ve talked to number of companies that have started with monoliths, but forced to re-write parts of the system as a micro-service to scale and deploy in isolation from other parts of the system. One famous example is [Twitter](https://twitter.com/){:target="_blank"}.

The Virtual Machine has an elegant solution to this problem. Since every process is an isolated unit and can communicate to the system on multiple machines, apps can be scaled infinitely. Yes infinitely. This blew my mind.


### Fault Tolerance

Most programming languages run by default in one thread. For example [NodeJS](https://nodejs.org/en/){:target="_blank"} is asynchronous, but if something breaks it might take the whole system down.

Erlang has a concept of *supervisors* to deal with this. Supervisors monitor processes within the Virtual Machine. If a process goes down it will be restarted by its Supervisor without affecting other parts of the system. 

In Erlang you should in general not write *try-catch* statements. Processes should just fail, log the problem and be restarted again. Making up a self-healing system.


### High Availability

Because of Erlang built-in fault tolerance, systems have high availability. There is an example of long-running system in Erlang with 99.999999999% availability.

Because of Erlangs process model, it is possible to make zero downtime deploys. Updates are made live to production without taking the system down.

## Conclusion

Phoenix takes good advantage of Elixir and Erlang features.

The Elixir programming language gives Phoenix an enjoyable developer experience and speed. Phoenix for example uses Elixir to compile HTML templates to bytecode to optmize speed further.

In Phoenix, each request and channel connection gets it's own process within Erlangs Virtual Machine. This makes Phoenix great to build highly concurrent systems with good distribution mechanism, fault-tolerance and high availability.

It's still early days for Phoenix. [Many libraries](https://github.com/h4cc/awesome-elixir){:target="_blank"} are missing or immature compared to Rails. It's ready for production and [many companies](https://github.com/doomspork/elixir-companies){:target="_blank"} are already using it live. 

Services to deploy seem a bit immature for Phoenix. It can be deployed to [Heroku](https://www.heroku.com/){:target="_blank"} in a simple way, but Heroku is still without suppport for Erlang's concurrency features. 

Deploying to your own setup requires time and skills. I trust that somewhere in the world hackers are sitting in a dark room, eating pizza and making this easier for the rest of us.

I've been greatly impressed by Phoenix and look forward to use it going forward.

{% include blog-author-hjortur.html %}
