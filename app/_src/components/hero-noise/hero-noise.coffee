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
		@$body.on(FOURTEEN.PjaxNavigation.EVENT_HERO_IS_HIDING, @pauseAnimation)
		@$body.on(FOURTEEN.PjaxNavigation.EVENT_HERO_IS_VISIBLE, @resumeAnimation)

		# init
		@createAnimationTimeline()
		@startAnimation()


	pauseAnimation: =>
		#target = if @timeline.progress() > 0.5 then 0 else 1
		# TweenMax.to(@timeline, 1, {
		# 	progress: target
		# 	onComplete: =>
		# 		@timeline.pause()
		# 		@isAnimating = false
		# 	ease: Power2.easeOut
		# })

		@timeline.pause()
		# TweenMax.staggerTo(@paths, 1, {
		# 	opacity: 0.5,
		# 	ease: Power4.easeInOut
		# }, 0.05)
		@animateOut(=>
			@isAnimating = false
		)

	startAnimation: =>
		@isAnimating = true
		@renderLoop()
		@animateIn(=>
			@timeline.resume()
		)

	resumeAnimation: =>
		@isAnimating = true
		@renderLoop()
		# @timeline.resume()
		@animateIn(=>
			@timeline.progress(0).resume()
		)


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


	animateIn: (complete) =>
		# fade in
		TweenMax.staggerTo(@paths, 1, {
			opacity: 1,
			ease: Power4.easeInOut
		}, 0.05)
		# move in from outer edge
		TweenMax.fromTo(env, 2, {
			spread: 150
			speed: 0.01
			rotation: Math.PI*10
			scaleEffect: 1
		},{
			spread: 40
			speed: 0.05
			rotation: Math.PI*2
			scaleEffect: 1
			ease: Expo.easeInOut
			onComplete: complete
		})

	animateOut: (complete) =>
		# move back to outer edge
		TweenMax.to(env, 1, {
		  spread: 150
		  speed: 0.01
		  rotation: Math.PI*10
		  scaleEffect: 1
			ease: Expo.easeInOut
			onComplete: complete
		})

	# loop between exploded and logo state
	createAnimationTimeline: =>
		@timeline = new TimelineMax({paused: true, repeat:-1, repeatDelay:3, yoyo:true, delay: 1})
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
