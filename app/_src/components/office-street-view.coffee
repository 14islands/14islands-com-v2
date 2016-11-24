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
class FOURTEEN.OfficeStreetView extends FOURTEEN.BaseComponent

  DATA_FALLBACK = "fallback"
  DATA_TOUCH_DISABLED = "is-touch-disabled"

  CLASSES_FALLBACK = "bg-cover bg-color--blank"
  CLASS_MAP_LOADED = "map-loaded"

  LOADED_CLASS_TIMEOUT = 700

  # @override FOURTEEN.BaseComponent.scripts
  scripts: [
    'https://maps.googleapis.com/maps/api/js?key=AIzaSyDhL8nwKWYtU4LdyiiMUp5zJ_8kRFRoAQA&v=3.25&callback=FOURTEEN.onGoogleMapsLoaded'
  ]


  constructor: (@$context, @data, @instanceId) ->
    @context = @$context.get(0);
    @spinner = new FOURTEEN.Spinner @$context
    @isDisabledOnTouch = @$context.data( DATA_TOUCH_DISABLED ) || false

    @shouldUseFallback = @isDisabledOnTouch and (Modernizr.touch or navigator.msMaxTouchPoints)

    # FOURTEEN.BaseComponent()
    super(@$context, @data)


  # @override FOURTEEN.BaseComponent.onReady()
  # check if maps are already loaded or if we need a load callback
  onReady: ->
    unless @shouldUseFallback
      # maps API already loaded, init map
      if google?.maps?.StreetViewPanorama?
        @initializeMap()
        FOURTEEN.onGoogleMapsLoaded = -> # empty function
      else
        @spinner.show()
        # we need a global callback for the maps api load event
        FOURTEEN.onGoogleMapsLoaded = @initializeMap
    else
      @setFallback( @$context.data( DATA_FALLBACK ) )


  # @override FOURTEEN.BaseComponent.loadAsyncScripts_()
  # abort loading of maps api we are using fallback
  loadAsyncScripts_: =>
    super() unless @shouldUseFallback


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
    if @pano?
      @pano.setVisible(false)
      @pano = undefined
    if google?.maps?.event?
      google.maps.event.clearInstanceListeners(window)
      google.maps.event.clearInstanceListeners(document)
      google.maps.event.clearInstanceListeners(@context)


  setFallback: (url) ->
    return if (!url)
    @$context.attr('data-bg-src', url)
    @$context.addClass( CLASSES_FALLBACK )
    ResponsiveIO.refresh(@$context.get(0))
