class FOURTEEN.HeroNoise extends FOURTEEN.BaseComponent

	env = {
	  autoAnimate: true
	  speed: 0.6
	  spread: 40
	  rotation: Math.PI/20
	  scaleEffect: 0
	  parallaxEffect: 0.01
	}

	frame = 0
	mouseCurrent = {mouseX: -1, mouseY: -1}
	mouseTarget = {mouseX: -1, mouseY: -1}


	constructor: (@$context, data) ->
		super(@$context, data)
		@$body = $('body')
		@$window = $(window)
		@isAnimating = false

		# find and create all shapes
		@islands = []
		logoEl = document.querySelector('.js-logo')
		@paths = document.querySelectorAll('.js-logo-island')

		@paths.forEach((el) =>
			island = new FOURTEEN.HeroNoiseIsland(el, env)
			@islands.push(island)
		)

		# bind events
		@$window.on('mousemove', @onMouseMove)
		@$body.on(FOURTEEN.PjaxNavigation.EVENT_HERO_IS_HIDING, @stopAnimation)
		@$body.on(FOURTEEN.PjaxNavigation.EVENT_HERO_IS_VISIBLE, @startAnimation)

		# init
		@createAnimationTimeline()
		@animateIn()
		@startAnimation()


	stopAnimation: =>
		@isAnimating = false
		console.log('STOP HERO!')


	startAnimation: =>
		@isAnimating = true
		@renderLoop()
		console.log('START HERO!')


	# keep track of the mouse position
	onMouseMove: (e) =>
	  mouseTarget.mouseX = e.clientX
	  mouseTarget.mouseY = e.clientY


	# RENDER LOOP
	renderLoop: =>
		# update mouse position towards target slowly
		mouseCurrent.mouseX += (mouseTarget.mouseX - mouseCurrent.mouseX) * 0.1
		mouseCurrent.mouseY += (mouseTarget.mouseY - mouseCurrent.mouseY) * 0.1

		# update physics in batch - draw in batch so browser touches Dom efficiently
		@islands.forEach((island, index) =>
		  island.updatePhysics(index, mouseCurrent)
		)
		@islands.forEach((island, index) =>
		  if (frame % 3 is 0)
		  	island.render()
		)
		frame++

		if @isAnimating then window.requestAnimationFrame(@renderLoop)


	animateIn: =>
		# Intro tween (fade in)
		TweenMax.staggerTo(@paths, 0.5, {
			spread: 40,
			speed: 0.1,
			opacity: 1,
			ease: Power4.easeIn
		}, 0.05)

	createAnimationTimeline: =>
		@timeline = new TimelineMax({paused: true, repeat:-1, repeatDelay:3, yoyo:true, delay: 4})
		@timeline.fromTo(env, 2, {
		  spread: 40,
		  speed: 0.05,
		  rotation: Math.PI*2,
		  scaleEffect: 1,
		  parallaxEffect: 0.2
		}, {
		  spread: 0.7,
		  speed: 0.8,
		  rotation: Math.PI/20,
		  ease: Expo.easeInOut,
		  scaleEffect: 0,
		  parallaxEffect: 0.01
		})

	destroy: ->
		@timeline?.kill()
		@$window.off('mousemove', @onMouseMove)
		@$body.off(FOURTEEN.PjaxNavigation.EVENT_HERO_IS_HIDING, @stopAnimation)
		@$body.off(FOURTEEN.PjaxNavigation.EVENT_HERO_IS_VISIBLE, @startAnimation)

		super()
