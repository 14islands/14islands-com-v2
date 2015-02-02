
# init FastClick
$( ->
  FastClick.attach(document.body)
)

# listen for load even on image tags loaded by responsive.io
FOURTEEN.listenForResponsive_ioImageLoad = ->
  $("img[data-src]").one("load", ->
    $(this).addClass('image-loaded')
    $(this).closest('.content-image').addClass('image-loaded')
  ).each( ->
    # complete is always true for data-src images
    #if this.complete
      #console.log('was complete - trigger load', this, this.complete);
      #$(this).load()
  )


# Logic to run after page has been loaded via PJAX
FOURTEEN.onPjaxEnd = ->
  # responsive images
  FOURTEEN.listenForResponsive_ioImageLoad()
  ResponsiveIO.refresh()

  # components
  FOURTEEN.componentLoader.scan()

  $(document.body).trigger("pjax:done")



#####################################################################
# BOOTSTRAP
#####################################################################
FOURTEEN.listenForResponsive_ioImageLoad()

new FOURTEEN.PjaxNavigation('.js-hero-nav',
                            '.js-nav-link',
                            '.js-nav-home',
                            '.js-pjax-container',
                            FOURTEEN.onPjaxEnd)

# component loader
FOURTEEN.componentLoader.start()

# init sticky header
new FOURTEEN.StickyNav($('.hero__nav'))
