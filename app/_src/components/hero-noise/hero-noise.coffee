class FOURTEEN.HeroNoise extends FOURTEEN.BaseComponent

	env = {
		spreadX:  window.innerWidth * 0.5
		spreadY: window.innerHeight * 0.66
		speed: 0.02
		rotation: Math.PI*5
		scaleEffect: 0 # start with no scale to avoid blur
		parallaxEffect: 0.2
	}

	mouseCurrent = {mouseX: window.innerWidth/2, mouseY: window.innerHeight/2}
	mouseTarget = {mouseX: -1, mouseY: -1}


	constructor: (@$context, data) ->
		super(@$context, data)
		@$body = $('body')
		@$window = $(window)
		@isAnimating = false

		# find and create all shapes
		@islands = []
		@$logoEl = @$context.find('.js-logo')
		@logoEl = @$logoEl[0]
		@paths = document.querySelectorAll('.js-logo-island')

		for el in @paths
			island = new FOURTEEN.HeroNoiseIsland(el, env)
			@islands.push(island)

		# bind events
		@$window.on('mousemove', @onMouseMove) unless Modernizr.touch
		@$body.on(FOURTEEN.PjaxNavigation.EVENT_HERO_IS_HIDING, @pauseAnimation)
		@$body.on(FOURTEEN.PjaxNavigation.EVENT_HERO_IS_VISIBLE, @resumeAnimation)


	pauseAnimation: =>
		@timeline.pause()
		@animateOut(=>
			@isAnimating = false
			# set back to initial env (copy somehow?)
			env.spreadX = window.innerWidth * 0.5
			env.spreadY = window.innerHeight * 0.66
			env.speed = 0.02
			env.rotation = Math.PI*5
			env.scaleEffect = 0
			env.parallaxEffect = 0.2
		)

	resumeAnimation: =>
		@isAnimating = true
		@renderLoop()
		@animateIn(=>
			@startTimeline()
		)


	onLogoClick: =>
		if @timeline
			time = @timeline.time()
			if time is 0
				@timeline.restart()
			else
				@timeline.timeScale(2.5)
				@timeline.reverse()

	# keep track of the mouse position
	onMouseMove: (e) =>
	  mouseTarget.mouseX = e.clientX
	  mouseTarget.mouseY = e.clientY


	# RENDER LOOP
	renderLoop: =>
		unless Modernizr.touch
			# update mouse position towards target slowly
			mouseCurrent.mouseX += (mouseTarget.mouseX - mouseCurrent.mouseX) * 0.1
			mouseCurrent.mouseY += (mouseTarget.mouseY - mouseCurrent.mouseY) * 0.1

		# update physics in batch - draw in batch so browser touches Dom efficiently
		for island, index in @islands
			island.updatePhysics(index, mouseCurrent)

		for island, index in @islands
			island.render()

		if @isAnimating then window.requestAnimationFrame(@renderLoop)


	animateIn: (complete) =>
		# add scale effect with delay so they render at full size to avoid blur
		TweenMax.to(env, 1.0, {
			scaleEffect: 1,
			ease: Power2.easeInOut,
			delay: 0.15,
			onComplete: complete
		})
		# fade in
		staggerDelay = 0.7 / 14
		TweenMax.staggerTo(@paths, .8, {
			opacity: 1,
			ease: Power2.easeInOut,
			# onComplete: complete
		}, staggerDelay)

	animateOut: (complete) =>
		# spin out
		numVisible = @$logoEl.children(':visible').length
		staggerDelay = 0.7 / numVisible
		TweenMax.staggerTo(@paths, 0.2, {
			opacity: 0,
			delay: 0.2
			ease: Power4.easeInOut
		}, staggerDelay)
		TweenMax.killTweensOf(env)
		TweenMax.to(env, 1.2, {
		  speed: 0.2
			spreadX: 0
			spreadY: 0
			rotation: Math.PI*30
			scaleEffect: 0
			ease: Expo.easeInOut
			onComplete: complete
		})

	addLogoClickListener: =>
		@removeLogoClickListener()
		@$logoEl.closest('.js-btn-explode-logo').on('click', @onLogoClick)

	removeLogoClickListener: =>
		@$logoEl.closest('.js-btn-explode-logo').off('click', @onLogoClick)

	# loop between exploded and logo state
	startTimeline: =>
		TweenMax.killTweensOf(env)
		@timeline = new TimelineMax({paused: false, delay: 2})

		@timeline.fromTo(env, 2, {
			spreadX:  window.innerWidth * 0.5
			spreadY: window.innerHeight * 0.66
			speed: 0.02
			rotation: Math.PI*5
			scaleEffect: 1
			parallaxEffect: 0.2
		},{
			spreadX: @logoEl.clientWidth * 0.7 * 0.01
			spreadY: @logoEl.clientWidth * 0.7 * 0.01
			speed: 0.8,
			rotation: Math.PI/20,
			scaleEffect: 0,
			parallaxEffect: 0.025
			ease: Expo.easeInOut
		})

		@timeline.eventCallback('onComplete', @addLogoClickListener)

	destroy: ->
		@timeline?.kill()
		@$window.off('mousemove', @onMouseMove) unless Modernizr.touch
		@$body.off(FOURTEEN.PjaxNavigation.EVENT_HERO_IS_HIDING, @pauseAnimation)
		@$body.off(FOURTEEN.PjaxNavigation.EVENT_HERO_IS_VISIBLE, @resumeAnimation)
		@removeLogoClickListener()

		super()
