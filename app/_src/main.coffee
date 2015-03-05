
# init FastClick
$( ->
  FastClick.attach(document.body)
)

# listen for load even on image tags loaded by responsive.io
FOURTEEN.listenForResponsive_ioImageLoad = ->
  $('img[data-src]').one('load', ->
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
  FOURTEEN.componentLoader.scan document.body, true, {isPjax:true}


FOURTEEN.onWindowLoad = ->
  # prefetch main pages - must have same path + querystring as pjax request will have
  # This will only work when sending far future headers for HTML
  if location.pathname is "/"
    $.get('work/?_pjax=.js-pjax-container', ->
      $.get('about/?_pjax=.js-pjax-container', ->
        $.get('contact/?_pjax=.js-pjax-container')
      )
    )



#####################################################################
# BOOTSTRAP
#####################################################################
$(window).load(FOURTEEN.onWindowLoad);
FOURTEEN.listenForResponsive_ioImageLoad()

new FOURTEEN.PjaxNavigation('.js-hero-nav',
                            '.js-nav-link',
                            '.js-nav-home',
                            '.js-pjax-container',
                            FOURTEEN.onPjaxEnd)

# component loader
FOURTEEN.componentLoader.start()

# init sticky header
new FOURTEEN.StickyNav($('.hero'))

