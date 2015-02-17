###*
#
# Generic parallax scroll component.
#
# Scrolls the first child of the context element based on
# the context's position inside the viewport
#
# HTML5 Data Attributes:
#  - data-parallax-offset : viewport offset specified in percentage of window height (float)
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
    @$body = $(document.body)
    @$document = $(document)
    @$window = $(window)
    @context = @$context.get(0)
    @$content = @$context.children().first()
    @updating = false

    @onWindowResizeDebounced = FOURTEEN.Utils.debounce(@onWindowResize, 500)

    @offsetPercentage = parseFloat(@$context.data('parallax-offset') or -0.4)
    @direction = if @$context.data('parallax-direction') is DIRECTION_HORIZONTAL then DIRECTION_HORIZONTAL else DIRECTION_VERTICAL

    if data?.isPjax
      @$body.one FOURTEEN.PjaxNavigation.EVENT_ANIMATION_SHOWN, @init
    else
      @init()


  init: () =>

    if scrollMonitor?
      # TODO check direction and support horizontal movement
      @contextHeight = @$context.height();

      # TODO wait for responsive.io to finish loading image
      @contentHeight = @$content.height();

      offset = @$window.height() * @offsetPercentage

      @watcher = scrollMonitor.create @$context, offset
      @watcher.enterViewport @onEnterViewport
      @watcher.exitViewport @onExitViewport

      @$window.on('resize', @onWindowResizeDebounced);


  destroy: =>
    if @watcher
      @watcher.destroy()
      @watcher = null

    @$window.off('resize', @onWindowResizeDebounced);
    @$document.off('state:change', @onScrollChanged)


  onWindowResize: =>
    @destroy()
    @init()


  updatePosition: =>
    # TODO check direction and support horizontal movement
    TweenLite.set(@$content[0], {
      y: -1 * (@contentHeight - @contextHeight) * @percentageScrolled,
      force3D: true
    });
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
    @$document.on('state:change', @onScrollChanged)


  onExitViewport: =>
    @$document.off('state:change', @onScrollChanged)
    @onScrollChanged()


