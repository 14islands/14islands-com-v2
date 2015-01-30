# Helper that returns a promise with the of the loading images.
# For example, if you want to animate a section only when
# all images have been loaded through Responsive.io.
#
# E.g.:
#
# refreshImages: ($images) ->
# 	i = 0
# 	imagesLen = $images.length
# 	imagesLoaded = new FOURTEEN.RIOImagesLoaded( $images )
# 	for i in [0..imagesLen] do ResponsiveIO.refresh( $images[i] )
#
# init: () =>
# 	$.when( imagesLoaded.getState() ).done =>
# 		# hide spinner..
# 		# animate stuff....
#

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

