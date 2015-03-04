###
#
# GoogleStreetviewPanorama component.
#
# For Sthlm6000 Case Study
#
# @author 14islands
#
###

class FOURTEEN.GoogleStreetviewPanorama extends FOURTEEN.ElementScrollVisibility

  ROTATE_DISTANCE = 0.1 #degrees per frame

  # @override FOURTEEN.BaseComponent.scripts
  scripts: [
    'https://maps.googleapis.com/maps/api/js?key=AIzaSyDhL8nwKWYtU4LdyiiMUp5zJ_8kRFRoAQA&v=3.exp&callback=FOURTEEN.onGoogleMapsLoaded'
    'https://rawgit.com/davatron5000/Lettering.js/master/jquery.lettering.js'
  ]


  constructor: (@$context, data) ->
    @panoramaHasLoaded = false
    @isScrolling = false

    # debounce scroll callbacks to know when scroll starts and ends
    @onScrollStartDebounced = FOURTEEN.Utils.debounce(@onScrollStart, 500, true)
    @onScrollEndDebounced = FOURTEEN.Utils.debounce(@onScrollEnd, 500)

    # FOURTEEN.ElementScrollVisibility()
    super(@$context, data)


  onReady: ->
    super() #FOURTEEN.ElementScrollVisibility.onReady

    @$document.on('state:change', @onScrollStartDebounced)
    @$document.on('state:change', @onScrollEndDebounced)

    # maps API already loaded, init panorama
    if google?.maps?.StreetViewPanorama?
      @onGoogleMapsApiLoaded()
      FOURTEEN.onGoogleMapsLoaded = -> # empty function
    else
      # we need a global callback for the maps api load event
      FOURTEEN.onGoogleMapsLoaded = @onGoogleMapsApiLoaded



  destroy: ->
    @$document.off('state:change', @onScrollStartDebounced)
    @$document.off('state:change', @onScrollEndDebounced)
    @cancelAutoRotate_()
    @panoramaHasLoaded = false
    @isScrolling = false
    if @pano?
      @pano.setVisible(false)
      @pano = undefined
    if google?
      google.maps.event.removeListener(@panoramaLoadListener_) if @panoramaLoadListener_?
      google.maps.event.removeListener(@panoramaPovListener_) if @panoramaPovListener_?
      google.maps.event.clearInstanceListeners(window)
      google.maps.event.clearInstanceListeners(document)
      google.maps.event.clearInstanceListeners(@$context[0])


  # @override FOURTEEN.BaseComponent.onAsyncScriptsLoaded
  # Normally this is all you need, but since Maps load a number of other files async,
  # ... we also need to wait for Maps to call the loaded callback
  onAsyncScriptsLoaded: =>
    # init lettering
    @$context.find(".js-title").lettering()


  # Google maps api loads a number of dependencies async and then calls this function
  onGoogleMapsApiLoaded: =>
    panoramaOptions = {
      position: new google.maps.LatLng( @$context.data('latitude'), @$context.data('longitude') )
      disableDefaultUI: true
      scrollwheel: false
      pov: {
        heading: 105
        pitch: 0
      }
      zoom: 1
    }

    @pano = new google.maps.StreetViewPanorama( @$context[0], panoramaOptions )

    @panoramaLoadListener_ = google.maps.event.addListener(@pano,
                                                           'pano_changed',
                                                           @onPanoLoaded_)

    @panoramaPovListener_ = google.maps.event.addListener(@pano,
                                                          'pov_changed',
                                                          @cancelAutoRotate_)


  autoRotate_: =>
    if @panoramaHasLoaded
      pov = @pano.getPov()
      pov.heading += ROTATE_DISTANCE
      @pano.setPov(pov)
      @povTimeout = requestAnimationFrame(@autoRotate_)


  cancelAutoRotate_: =>
    cancelAnimationFrame(@povTimeout)


  onPanoLoaded_: =>
    unless @panoramaHasLoaded
      @panoramaHasLoaded = true
      @pano.setVisible(true)
      if @isInViewport
        @autoRotate_()


  onScrollStart: =>
    @isScrolling = true
    @cancelAutoRotate_()


  onScrollEnd: =>
    @isScrolling = false
    @autoRotate_()


  onEnterViewport: =>
    super()
    @autoRotate_() unless @isScrolling


  onExitViewport: =>
    super()
    @cancelAutoRotate_()
