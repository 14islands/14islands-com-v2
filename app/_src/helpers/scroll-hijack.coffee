class FOURTEEN.ScrollHijack

	constructor: ->
		@_$window = $(window)

		# private state
		@_previousTouch = {y: -1}
		@_newSwipe = false
		@_previousDelta = 0

		@_onMouseWheelEvent = @_onMouseWheelEvent.bind(this)
		@_onTouchStart = @_onTouchStart.bind(this)
		@_onTouchMove = @_onTouchMove.bind(this)

		# public flag
		@preventDefault = false
		@onlyDetectSwipe = false


	enable: =>
		@_$window.on('DOMMouseScroll mousewheel', @_onMouseWheelEvent)
		@_$window.on('touchstart', @_onTouchStart)
		@_$window.on('touchmove', @_onTouchMove)


	disable: =>
		@_$window.off('DOMMouseScroll mousewheel', @_onMouseWheelEvent);
		@_$window.off('touchstart', @_onTouchStart);
		@_$window.off('touchmove', @_onTouchMove);


	_onMouseWheelEvent: (event) =>
		if (@preventDefault)
			event.preventDefault() # No scroll

		# normalize event
		e = if event.originalEvent then event.originalEvent else event

		# normalize mouse wheel event
		delta = if e.wheelDelta then e.wheelDelta else (if e.detail then -e.detail else 0)

		# The following equation will return either a 1 for scroll down
		# or -1 for a scroll up
		direction = Math.max(-1, Math.min(1, delta))

		if (!@onlyDetectSwipe or Math.abs(delta) >= Math.abs(@_previousDelta))
			@onScroll(direction)

		@_previousDelta = delta


	_onTouchStart: (event) =>
		# normalize event
		e = if event.originalEvent then event.originalEvent else event
		if (e.touches.length)
			pageY = e.touches[0].pageY
			@_previousTouch.y = pageY
			@_newSwipe = true


	_onTouchMove: (event) =>
		if (@preventDefault)
			event.preventDefault() # No scroll

		# normalize event
		e = if event.originalEvent then event.originalEvent else event
		if (e.touches.length)
			pageY = e.touches[0].pageY
			delta = pageY - @_previousTouch.y
			# The following equation will return either a 1 for scroll down
			# or -1 for a scroll up
			direction = Math.max(-1, Math.min(1, delta))

			if (!@onlyDetectSwipe or @_newSwipe is true)
				@onScroll(direction)
				@_newSwipe = false

			@_previousTouch.y = pageY


	# @override to get updates
	onScroll: (delta) ->
		# nothing here


	destroy: ->
		@disable()
