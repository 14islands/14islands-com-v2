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
    'https://maps.googleapis.com/maps/api/js?key=AIzaSyDhL8nwKWYtU4LdyiiMUp5zJ_8kRFRoAQA&v=3.exp&callback=FOURTEEN.GoogleStreetviewPanorama.onGoogleMapsLoaded'
    'https://rawgit.com/davatron5000/Lettering.js/master/jquery.lettering.js'
  ]


  constructor: (@$context, data) ->
    @panoramaHasLoaded = false

    # we need a global callback for the maps api load event
    FOURTEEN.GoogleStreetviewPanorama.onGoogleMapsLoaded = @onGoogleMapsApiLoaded

    # FOURTEEN.ElementScrollVisibility()
    super(@$context, data)


  destroy: ->
    if @pano?
      @pano.setVisible(false)
      @pano = undefined
    if google?
      google.maps.event.removeListener(@panoramaLoadListener_) if @panoramaLoadListener_?
      google.maps.event.removeListener(@panoramaPovListener_) if @panoramaPovListener_?
    @cancelAutoRotate_()


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
    @panoramaHasLoaded = true
    @pano.setVisible(true)
    if @isInViewport
      @autoRotate_()


  onEnterViewport: =>
    super()
    @autoRotate_()


  onExitViewport: =>
    super()
    @cancelAutoRotate_()
