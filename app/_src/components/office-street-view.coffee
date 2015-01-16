class FOURTEEN.OfficeStreetView

	DATA_FALLBACK = "fallback"
	DATA_TOUCH_DISABLED = "is-touch-disabled"

	CLASSES_FALLBACK = "bg-cover bg-color--blank"
	CLASS_SPINNER_INACTIVE = "spinner--inactive"
	CLASS_MAP_LOADED = "map-loaded"

	SELECTOR_SPINNER = '.spinner'

	LOADED_CLASS_TIMEOUT = 700

	constructor: (@$context) ->
		console.log("initialize map")
		@context = @$context.get(0);
		@init()

	init: ->
    # Hello spinner
    @$spinner = @$context.find( SELECTOR_SPINNER )
    @isDisabledOnTouch = @$context.data( DATA_TOUCH_DISABLED ) || false

    # No maps on mobile. Saves bandwidth and awkwardness scrolling.
    if (@isDisabledOnTouch && (Modernizr.touch || navigator.msMaxTouchPoints))
      @setFallback( @$context.data( DATA_FALLBACK ) )
    else
      @showSpinner()
      google.maps.event.addDomListener(window, 'load', @initializeMap)

  initializeMap: =>
    @panoramaOptions = {
      position: new google.maps.LatLng(@$context.data('latitude'), @$context.data('longitude')),
      disableDefaultUI: true,
      scrollwheel: false,
      pov: {
        heading: 336.54,
        pitch: 20
      },
      zoom: 1
    }

    @pano = new google.maps.StreetViewPanorama(@context, @panoramaOptions)
    @pano.setVisible(true)
    @hideSpinner()
    
    setTimeout(=>
      @$context.addClass( CLASS_MAP_LOADED )
    , LOADED_CLASS_TIMEOUT)

  setFallback: (url) ->
    return if (!url)
    @$context.css('background-image', 'url(' + url + ')')
    @$context.addClass( CLASSES_FALLBACK )


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
   