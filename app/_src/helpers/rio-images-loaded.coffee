class FOURTEEN.RIOImagesLoaded

	DATA_RIO_WIDTH = 'rio-width'
	DATA_SRC = 'src'

	constructor: (@$images) ->
		@deffereds = []
		@mainDeffered = jQuery.Deferred()
		@numResolved = 0
		@numImages = @$images.length
		@init()

	init: () =>
		for i in [0...@numImages]
			$image = @$images.eq(i)

			@deffereds.push jQuery.Deferred()

			if $image.data(DATA_RIO_WIDTH) is undefined
				@addLoadListener @$images.eq(i), i
			else
				@resolveDeffered i


	addLoadListener: ($image, i) =>
		$image.one 'load', =>
			@resolveDeffered i

	resolveDeffered: (index) =>
		@deffereds[ index ].resolve()
		@numResolved++
		if @numResolved is @numImages
			@mainDeffered.resolve()

	getState: () =>
		@mainDeffered

