###
	Map Component

	This component will render a google map street view in it's context.

	@method
	init()
	- Initializes the header component

	@method
	render()
	- Called when component is visible - if hidden while instanciating

###
class FOURTEEN.OfficeStreetView

	DATA_FALLBACK = "fallback"
	DATA_TOUCH_DISABLED = "is-touch-disabled"

	CLASSES_FALLBACK = "bg-cover bg-color--blank"
	CLASS_MAP_LOADED = "map-loaded"

	LOADED_CLASS_TIMEOUT = 700

	constructor: (@$context, @data, @instanceId) ->
		@context = @$context.get(0);
		@$body = $("body")
		@spinner = new FOURTEEN.Spinner @$context
		@isDisabledOnTouch = @$context.data( DATA_TOUCH_DISABLED ) || false

		# No maps on mobile. Saves bandwidth and awkwardness scrolling.
		if (@isDisabledOnTouch and (Modernizr.touch or navigator.msMaxTouchPoints))
			@setFallback( @$context.data( DATA_FALLBACK ) )
		else
			@spinner.show()
			window.onload = @appendMapScriptToBody
			#google.maps.event.addDomListener(window, 'load', @appendMapScriptToBody)
			@$body.on("pjax:done", @appendMapScriptToBody)

	appendMapScriptToBody: =>
		# Append script time to page on first view
		unless google?.maps?.StreetViewPanorama?
			FOURTEEN.initializeMap = @initializeMap
			script = document.createElement('script')
			script.id = 'google-maps-script-tag'
			script.type = 'text/javascript'
			script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDhL8nwKWYtU4LdyiiMUp5zJ_8kRFRoAQA&v=3.exp&callback=FOURTEEN.initializeMap'
			document.body.appendChild(script)
		else
			@initializeMap()

	initializeMap: =>
		latLong = new google.maps.LatLng(@$context.data('latitude'), @$context.data('longitude'))
		@panoramaOptions = {
			position: latLong,
			disableDefaultUI: true,
			scrollwheel: false,
			pov: {
				heading: @$context.data('heading'),
				pitch: @$context.data('pitch')
			},
			zoom: @$context.data('zoom')
		}

		@spinner.hide(=>
			@pano = new google.maps.StreetViewPanorama(@context, @panoramaOptions)
			@pano.setVisible(true)

			setTimeout(=>
			  @$context.addClass( CLASS_MAP_LOADED )
			, LOADED_CLASS_TIMEOUT)

			google.maps.event.trigger(@context, 'resize');
		)

	destroy: =>
		google.maps.event.clearInstanceListeners(window)
		google.maps.event.clearInstanceListeners(document)
		google.maps.event.clearInstanceListeners(@context)
		@$body.off("pjax:done")

	setFallback: (url) ->
		return if (!url)
		@$context.attr('data-bg-src', url)
		@$context.addClass( CLASSES_FALLBACK )
		ResponsiveIO.refresh(@$context.get(0))
