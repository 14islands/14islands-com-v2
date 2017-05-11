class FOURTEEN.HeroNoise extends FOURTEEN.BaseComponent

	env = {
	  autoAnimate: true
	  speed: 0.6
	  spreadX: -1
	  spreadY: -1
	  rotation: Math.PI/20
	  scaleEffect: 0
	  parallaxEffect: 0.01
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
		)

	resumeAnimation: =>
		@isAnimating = true
		@renderLoop()
		@startTimeline()
		@animateIn()


	onLogoClick: =>
		if @timeline
			time = @timeline.time()
			if time is 0
				@timeline.restart()
			else
				@timeline.timeScale(2)
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

	getIntroSpread: =>
		if (window.innerHeight > window.innerWidth)
			return window.innerHeight / 2
		else
			return window.innerWidth / 10

	animateIn: (complete) =>
		# fade in
		TweenMax.staggerTo(@paths, .8, {
			opacity: 1,
			ease: Power2.easeInOut,
			onComplete: complete
		}, 0.05)

	animateOut: (complete) =>
		# move back to outer edge
		TweenMax.staggerTo(@paths, 0.2, {
			opacity: 0,
			delay: 0.2
			ease: Power4.easeInOut
		}, 0.05)
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
		@timeline = new TimelineMax({paused: false, delay: 3})

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
