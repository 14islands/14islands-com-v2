
# init FastClick
$( ->
  FastClick.attach(document.body)
)

# listen for load even on image tags loaded by responsive.io
FOURTEEN.listenForResponsive_ioImageLoad = ->

	$('.main-content').imagesLoaded().progress( ( instance, image ) ->
		if image.isLoaded
			$(image.img).addClass('image-loaded')
			$(image.img).closest('.content-image').addClass('image-loaded') if image.isLoaded
	 )

# Logic to run after page has been loaded via PJAX
FOURTEEN.onTransitionEnd = ->
  # responsive images
  FOURTEEN.listenForResponsive_ioImageLoad()
  ResponsiveIO.refresh()

FOURTEEN.onPjaxEnd = ->
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

pjaxNav = new FOURTEEN.PjaxNavigation('.js-hero-nav',
                            '.js-nav-link',
                            '.js-nav-home',
                            '.js-pjax-container',
                            FOURTEEN.onPjaxEnd)

$('body').on(FOURTEEN.PjaxNavigation.EVENT_ANIMATION_SHOWN, FOURTEEN.onTransitionEnd)

# component loader
FOURTEEN.componentLoader.start()

# init sticky header
new FOURTEEN.StickyNav($('.hero'))
