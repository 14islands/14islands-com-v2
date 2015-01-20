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
	CLASS_SPINNER_INACTIVE = "spinner--inactive"
	CLASS_MAP_LOADED = "map-loaded"

	SELECTOR_SPINNER = '.spinner'

	LOADED_CLASS_TIMEOUT = 700

	constructor: (@$context) ->
		@context = @$context.get(0);
		@$body = $("body")
		@mapsLoadListener = null
		@$spinner = @$context.find( SELECTOR_SPINNER )
		@isDisabledOnTouch = @$context.data( DATA_TOUCH_DISABLED ) || false

		# No maps on mobile. Saves bandwidth and awkwardness scrolling.
		if (@isDisabledOnTouch and (Modernizr.touch or navigator.msMaxTouchPoints))
			@setFallback( @$context.data( DATA_FALLBACK ) )
		else
			@showSpinner()
			@mapsLoadListener = google.maps.event.addDomListener(window, 'load', @initializeMap)
			@$body.on("pjax:done", @initializeMap)
			

	forceRedraw: (element) =>

    return if (!element) 

    n = document.createTextNode(' ')
    disp = element.style.display # don't worry about previous display style

    element.appendChild(n);
    element.style.display = 'none'

    setTimeout(() =>
        element.style.display = disp
        n.parentNode.removeChild(n)
    ,20) # you can play with this timeout to make it as short as possible

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
		
		@pano = new google.maps.StreetViewPanorama(@context, @panoramaOptions)
		@pano.setVisible(true)
		@hideSpinner()

		setTimeout(=>
		  @$context.addClass( CLASS_MAP_LOADED )
		, LOADED_CLASS_TIMEOUT)

		@forceRedraw(@context)

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

	showSpinner: ->
	  return if (!@$spinner) 
	  # jQuery's fadeOut might add some dirty inline CSS...
	  @$spinner.css({
	    'display': 'block',
	    'visibility': 'visible'
	  })

	  @$spinner.removeClass( CLASS_SPINNER_INACTIVE )

	hideSpinner: ->
	  return if (!@$spinner)
	  @$spinner.fadeOut(300, => 
	  	@$spinner.addClass(CLASS_SPINNER_INACTIVE)
	  )
   