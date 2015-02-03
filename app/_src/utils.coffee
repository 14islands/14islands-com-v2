class FOURTEEN.Utils

	###
		Debounce and SmartResize (in jQuery) ported to CoffeeScript
		debouncing function from John Hann
		http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
	###
	@debounce: (func, threshold, execAsap) ->
		timeout = false

		return debounced = ->
			obj = this
			args = arguments

			delayed = ->
				func.apply(obj, args) unless execAsap
				timeout = null

			if timeout
				clearTimeout(timeout)
			else if (execAsap)
				func.apply(obj, args)

			timeout = setTimeout delayed, threshold || 100

	###
		Simple checks if we are dealing with localhost
	###
	@isLocalhost: () ->
		hosts = ['localhost', '0.0.0.0', '127.0.0.1']
		hosts.indexOf(document.location.hostname) isnt -1

	###
		Returns a random number
		based on the given min and max interval.

		@param  {Integer} min from which number
		@param  {Integer} max until which number
		@return {[type]}     Integer
	###
	@getRandomNumber: (min, max) ->
		Math.floor(Math.random()*(max-min+1)+min)

	###
		Rounds up to the closest multiple of 10

		@param  {Integer} n number to be rounded up
		@return {Integer}   number rounded to a multiple of 10. e.g. 20, 30, 40, etc.
	###
	@getRoundUp: (n) ->
		result = n

		if (n % 10)
			result = n + (10 - n % 10)

		return result

	###
		Shows the given spinner	element
	###
	@showSpinner: ($spinner) ->
		return if !$spinner
		$spinner.removeClass 'spinner--inactive'

	###
		Hides the given spinner
	###
	@hideSpinner: ($spinner) ->
		return if !$spinner
		TweenLite.to $spinner, .3, {
			opacity: 0,
			ease: Power4.EaseOut,
			onComplete: ->
				$spinner.addClass 'spinner--inactive'
		}

	@whichAnimationEvent: () ->
		t = undefined
		el = document.createElement('div')
		animationNames =
		  'WebkitAnimation': 'webkitAnimationEnd'
		  'MozAnimation': 'animationend'
		  'OAnimation': 'oAnimationEnd oanimationend'
		  'animation': 'animationend'
		for t of animationNames
		  if el.style[t] != undefined
		    return animationNames[t]
