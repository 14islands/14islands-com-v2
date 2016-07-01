class FOURTEEN.BedowIcon extends FOURTEEN.BaseComponent

	TIMEOUT_FIRST_DELAY_MS = 1000
	CLASS_ANIMATING = 'is-animating'
	CLASS_PAUSED = 'is-paused'

	constructor: (@$context, data) ->
		super(@$context, data)

		setTimeout =>
			@watcher = scrollMonitor.create @$context
			@watcher.enterViewport( @_onEnterViewport )
			@watcher.exitViewport( @_onExitViewport )
			@watcher.recalculateLocation()
		, TIMEOUT_FIRST_DELAY_MS

	_onEnterViewport: () =>
		@play()

	_onExitViewport: () =>
		@stop()

	play: =>
		@$context
			.removeClass( CLASS_PAUSED )
			.addClass( CLASS_ANIMATING )

	stop: =>
		@$context.removeClass( CLASS_ANIMATING )

	pause: =>
		@$context.addClass( CLASS_PAUSED )

	destroy: ->
		super()
		if @watcher then @watcher.destroy()
