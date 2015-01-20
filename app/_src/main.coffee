
# init FastClick
$( ->
  FastClick.attach(document.body)
)

FOURTEEN.isOfficeStreetViewLoaded = false;
FOURTEEN.tryLoadOfficeStreatView = ->
  if $("body").is(".page-contact") and !FOURTEEN.tryInitOfficeStreatView
    new FOURTEEN.OfficeStreetView($(".js-office-street-view"))

# listen for load even on image tags loaded by responsive.io
FOURTEEN.listenForResponsive_ioImageLoad = ->
  $("img[data-src]").one("load", ->
    $(this).addClass('image-loaded')
  ).each( ->
    # complete is always true for data-src images
    #if this.complete
      #console.log('was complete - trigger load', this, this.complete);
      #$(this).load()
  )


# Logic to run after page has been loaded via PJAX
FOURTEEN.onPjaxLoad = ->
  # responsive images
  FOURTEEN.listenForResponsive_ioImageLoad()
  ResponsiveIO.refresh()

  # components
  FOURTEEN.componentLoader.scan()

  # google maps
  # FOURTEEN.tryLoadOfficeStreatView()

  $(document.body).trigger("pjax:done")



#####################################################################
# BOOTSTRAP
#####################################################################
FOURTEEN.listenForResponsive_ioImageLoad()

new FOURTEEN.PjaxNavigation('.js-hero-nav',
                            '.js-nav-home',
                            '.js-pjax-container',
                            FOURTEEN.onPjaxLoad)
 
# google maps
# FOURTEEN.tryLoadOfficeStreatView()

# component loader
FOURTEEN.componentLoader.start()


