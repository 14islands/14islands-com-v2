class FOURTEEN.Spinner

	SPINNER_HTML = '
	<div class="spinner spinner--center spinner--inactive">
	  <svg viewBox="195.9 88.8 109 55.5">
	    <g class="down" opacity="0.4">
	      <polygon fill="#F8B334" points="234.5,117.3 261.7,144.3 278,139.2 283.6,133.9 287.1,141.3 298.2,131 301.8,128.8 304.9,117.3
	        "/>
	      <polygon fill="#F8B334" points="224.8,117.3 224.1,119.5 219.1,124.9 215.1,121.8 215.1,126.9 209,128.9 197,117.3   "/>
	      <polygon fill="#F17E0B" points="197,117.3 195.9,117.3 198.5,122.3 202.3,122.3   "/>
	      <polygon fill="#F17E0B" points="215.1,126.9 215.1,121.8 219.1,124.9 218,126.2   "/>
	      <polygon fill="#F17E0B" points="234.5,117.3 232.4,117.3 237.5,131.9 247.2,129.9   "/>
	      <polygon fill="#F17E0B" points="278,139.2 283.6,133.9 287.1,141.3   "/>
	    </g>
	    <g class="down">
	      <polygon fill="#F8B334" points="234.5,115.7 261.7,88.8 278,94.1 283.6,99.4 287.1,92 298.2,102.3 301.8,104.4 304.9,115.7   "/>
	      <polygon fill="#F8B334" points="224.8,115.7 224.1,113.7 219.1,108.3 215.1,111.5 215.1,106.5 209,104.2 197,115.7   "/>
	      <polygon fill="#F17E0B" points="197,115.7 195.9,115.7 198.5,110.3 202.7,110.3   "/>
	      <polygon fill="#F17E0B" points="215.1,106.5 215.1,111.5 219.1,108.3 218,107.1   "/>
	      <polygon fill="#F17E0B" points="234.5,115.7 232.4,115.7 237.5,101.3 247.2,103.2   "/>
	      <polygon fill="#F17E0B" points="278,94 283.6,99.4 287.1,92  "/>
	    </g>
	  </svg>
	</div>
	'

	BEFORE_HIDE_DURATION_MS = 2000
	CLASS_INACTIVE = 'spinner--inactive'
	CLASS_WHITE = 'spinner--white'

	constructor: (@$context, options) ->
		@$spinner = $(SPINNER_HTML)
		@appendEl(options)
		@deffered = jQuery.Deferred()
		@hasDeffered = false
		@isAppended = false

	appendEl: (options) ->
		return if @isAppended
		if options?.isWhite
			@$spinner.addClass CLASS_WHITE
		@$context.append @$spinner
		@isAppended = true

	removeEl: ->
		@$spinner.remove() if @$spinner.length
		@isAppended = false

	show: =>
		@appendEl() unless @isAppended
		@$spinner.removeClass CLASS_INACTIVE
		@hasDeffered = true
		setTimeout =>
			@deffered.resolve()
		, BEFORE_HIDE_DURATION_MS

	hide: (callback, isToBeRemoved) =>
		return @animateOut callback, isToBeRemoved unless @hasDeffered
		$.when( @deffered.promise() ).done =>
			@animateOut callback, isToBeRemoved

	animateOut: (callback, isToBeRemoved) =>
		TweenLite.to @$spinner, .3, {
			opacity: 0,
			ease: Power4.EaseOut,
			onComplete:  =>
				@hasDeffered = false
				@$spinner.addClass CLASS_INACTIVE
				callback() if typeof callback is 'function'
				@removeEl() if isToBeRemoved is true
		}