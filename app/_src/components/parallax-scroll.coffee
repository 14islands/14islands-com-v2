###*
#
# Generic parallax scroll component.
#
# Scrolls the first child of the context element based on
# the context's position inside the viewport
#
# HTML5 Data Attributes:
#  - data-parallax-offset : viewport offset specified in percentage of context height (float)
#  - data-parallax-direction : direction to scroll [horizontal|vertical(default)]
#
# Example usage:
#
# <div class="js-component-parallax-scroll" data-offset-percentage="0.5"></div>
#
# @author 14islands
#
###

class FOURTEEN.ParallaxScroll

  DIRECTION_VERTICAL = 'vertical'
  DIRECTION_HORIZONTAL = 'horizontal'

  constructor: (@$context, data) ->
    @context = @$context.get(0)
    @$body = $(document.body)
    @$document = $(document)
    @$window = $(window)
    @$content = @$context.children().first()
    @updating = false

    @onWindowResizeDebounced = FOURTEEN.Utils.debounce(@onWindowResize, 500)

    @offsetPercentage = parseFloat(@$context.data('parallax-offset') or 0.0)
    @direction = if @$context.data('parallax-direction') is DIRECTION_HORIZONTAL then DIRECTION_HORIZONTAL else DIRECTION_VERTICAL

    if data?.isPjax
      @$body.one FOURTEEN.PjaxNavigation.EVENT_ANIMATION_SHOWN, @init
    else
      @init()


  init: () =>
    # wait for image to load
    # TODO - make more generic in case we are not scrolling images
    @$context.find('img').one('load', =>
      @initParallax()
    ).each( ->
      # data-src images are always complete before responsive.io load the real image
      if !this.hasAttribute('data-src') and this.complete
        $(this).load()
    )


  initParallax: =>
    if scrollMonitor?
      @contextHeight = @$context.height();
      @contextWidth  = @$context.width();
      @contentHeight = @$content.height();
      @contentWidth  = @$content.width();

      #console.log "INIT PARALAX", @contextHeight+'x'+@contextWidth, @contentHeight+'x'+@contentWidth
      offset = @contextHeight * @offsetPercentage

      @watcher = scrollMonitor.create @$context, offset
      @watcher.enterViewport @onEnterViewport
      @watcher.exitViewport @onExitViewport

      @$window.on('resize', @onWindowResizeDebounced);
      @onScrollChanged()


  destroy: =>
    if @watcher
      @watcher.destroy()
      @watcher = null

    @$window.off('resize', @onWindowResizeDebounced);
    @$document.off(FOURTEEN.ScrollState.EVENT_SCROLL_FRAME, @onScrollChanged)


  onWindowResize: =>
    @destroy()
    @init()


  round: (number) =>
    Math.round(number*100) / 100;

  updatePosition: =>
    if @direction is DIRECTION_VERTICAL
      prop =
        y: @round(-1 * (@contentHeight - @contextHeight) * @percentageScrolled)
        force3D: true

    else if @direction is DIRECTION_HORIZONTAL
      prop =
        x: @round(-1 * (@contentWidth - @contextWidth) * @percentageScrolled)
        force3D: true

    TweenLite.set(@$content[0], prop);
    @updating = false


  onScrollChanged: =>
    unless @updating
      @updating = true

      # calculate how far along the way we are
      pixelsScrolled = scrollMonitor.viewportBottom - @watcher.top
      pixelsToGo = @watcher.bottom - scrollMonitor.viewportTop
      @percentageScrolled = Math.max(0, Math.min(1, pixelsScrolled / (pixelsToGo + pixelsScrolled)))

      requestAnimationFrame(@updatePosition)


  onEnterViewport: =>
    @$document.on(FOURTEEN.ScrollState.EVENT_SCROLL_FRAME, @onScrollChanged)


  onExitViewport: =>
    @$document.off(FOURTEEN.ScrollState.EVENT_SCROLL_FRAME, @onScrollChanged)
    @onScrollChanged()


