class FOURTEEN.BedowMorphIcon extends FOURTEEN.BaseComponent

	scripts: [
		'/js/vendor/TweenMax.js',
		'/js/vendor/MorphSVGPlugin.js'
	]

	constructor: (@$context, data) ->
		super(@$context, data)
		@startSelector = @$context.data 'start-selector'
		@endSelector = @$context.data 'end-selector'

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
		options = {
			morphSVG: @endSelector,
			paused: true,
			repeat: -1,
			yoyo: true,
			ease: Power0.easeOut
		}
		@tween = TweenMax.to(@startSelector, .8, options)
		console.log("init!", @tween)

	play: =>
		console.log('play!', @tween, Math.random())
		@tween.play()

	stop: =>
		console.log('stop!', @tween, Math.random())
		@tween.pause()

	pause: =>
		@tween.pause()

	destroy: ->
		super()
		if @watcher then @watcher.destroy()
