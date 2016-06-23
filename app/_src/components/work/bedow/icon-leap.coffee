class FOURTEEN.BedowLeapIcon extends FOURTEEN.BaseComponent

	scripts: [
		'/js/vendor/TimelineMax.js',
		'/js/vendor/DrawSVGPlugin.js'
	]

	constructor: (@$context, data) ->
		super(@$context, data)

	onScriptsLoaded: =>
		@init()
		setTimeout =>
			@watcher = scrollMonitor.create @$context
			@watcher.enterViewport @_onEnterViewport
			@watcher.exitViewport @_onExitViewport
			@watcher.recalculateLocation()
		, 1

	_onEnterViewport: () =>
		@play()

	_onExitViewport: () =>
		@stop()

	init: =>
		@$path = @$context.find('.js-IconLeap-path');

		@tl = new TimelineMax({ paused: true, repeat: -1, repeatDelay: 1});

		@tl
			.set( @$path, { visibility: 'visible'} )
			.add( @getDrawTween("0% 0%", "0% 20%") )
			.add( @getDrawTween("0% 20%", "55% 35%") )
			.add( @getDrawTween("55% 35%", "95% 75%") )
			.add( @getDrawTween("95% 75%", "100% 100%") );

	getDrawTween: (fromStr, toStr) ->
		return TweenMax.fromTo( @$path, 2/4,
			{ drawSVG: fromStr },
			{ drawSVG: toStr, ease: Power0.easeNone }
		);

	play: =>
		console.log('play!', @tl, Math.random())
		@tl.play()

	stop: =>
		console.log('stop!', @tl, Math.random())
		@tl.pause()

	pause: =>
		@tl.pause()

	destroy: ->
		super()
		if @watcher then @watcher.destroy()
