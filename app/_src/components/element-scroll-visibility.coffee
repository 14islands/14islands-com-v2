###*
#
# ElementScrollVisibility component.
#
# This component will watch it's state within the viewport
# and react with the following classes:
#
# - is-partially-visible
# - is-fully-visible
# - has-exited
# - animate
# - has-animated
#
# Example usage:
#
# <div class="js-component-scroll-monitor" data-offset="500"></div>
#
# @author 14islands
#
###

class FOURTEEN.ElementScrollVisibility extends FOURTEEN.BaseComponent

  CSS_PARTIALLY_VISIBLE_CLASS = 'is-partially-visible'
  CSS_FULLY_VISIBLE_CLASS = 'is-fully-visible'
  CSS_ANIMATE_CLASS = 'animate'
  CSS_ANIMATED_CLASS = 'has-animated'
  CSS_EXIT_CLASS = 'has-exited'
  DATA_OFFSET = 'offset'
  DATA_REPEAT = 'scroll-repeat'
  DATA_FORCE_LOOP = 'force-loop'

  constructor: (@$context, data) ->
    @context = @$context.get(0)
    @repeat = @$context.data DATA_REPEAT or 0
    @forceLoop = @$context.data DATA_FORCE_LOOP or 0

    @isInViewport = false
    @isFullyInViewport = false

    @animationEndEvent = FOURTEEN.Utils.whichAnimationEvent()

    if @repeat?
      @repeat = JSON.parse(@repeat)

    if @forceLoop?
      @forceLoop = JSON.parse(@forceLoop)

    # FOURTEEN.BaseComponent()
    super(@$context, data)


  # @override FOURTEEN.BaseComponent.onReady
  onReady: ->
    @addEventListeners_()


  destroy: ->
    super()
    @removeEventListeners_()


  addEventListeners_: =>
    offset = @$context.data('offset') or -100
    if scrollMonitor?
      @watcher = scrollMonitor.create @$context, offset
      @watcher.enterViewport @onEnterViewport
      @watcher.fullyEnterViewport @onFullyEnterViewport
      @watcher.exitViewport @onExitViewport
      @watcher.recalculateLocation()

  removeEventListeners_: =>
    if @watcher
      @watcher.destroy()
      @watcher = null

  reset_: =>
    @$context.removeClass CSS_PARTIALLY_VISIBLE_CLASS
    @$context.removeClass CSS_FULLY_VISIBLE_CLASS
    @onAnimationReset()
    @hasExited = false
    @hasPartiallyPlayed = false
    @hasFullyPlayed = false


  onAnimationReset: =>
    @$context.removeClass CSS_ANIMATE_CLASS
    @$context.removeClass CSS_ANIMATED_CLASS

  onAnimationPlay: =>
    @$context.addClass CSS_ANIMATE_CLASS
    @$context.one @animationEndEvent, @onAnimationEnd if @animationEndEvent

  onAnimationEnd: =>
    @$context.addClass CSS_ANIMATED_CLASS

    # force Javascript animations to loop by resetting and replaying
    if @forceLoop
      if @isInViewport
        # only replay if still in viewport
        setTimeout =>
          @onAnimationReset()
          setTimeout =>
            @onAnimationPlay()
          , 500
        , 500
      else
        @onAnimationReset()



  ###
    The following functions are always called in synchronous order
    NOTE: they will not be called if the @scripts array is empty
    1. onScriptsLoadedSync
    2. onEnterViewportSync
    3. onFullyEnterViewportSync
  ###

  onScriptsLoadedSync: =>
    # override me

  onEnterViewportSync: =>
    # override me

  onFullyEnterViewportSync: =>
    # override me

  # This function is only called if all scripts have been loaded
  # NOTE: it will not be called if the @scripts array is empty
  onExitViewportSync: =>
    # override me



  # @override FOURTEEN.BaseComponent.onScriptsLoaded
  onScriptsLoaded: =>
    @onScriptsLoadedSync()
    @onEnterViewportSync() if @isInViewport
    @onFullyEnterViewportSync() if @isFullyInViewport


  onEnterViewport: =>
    @isInViewport = true
    @onEnterViewportSync() if @asyncScriptsLoaded
    return if @hasPartiallyPlayed
    @hasPartiallyPlayed = true
    @$context.removeClass CSS_EXIT_CLASS
    @$context.addClass CSS_PARTIALLY_VISIBLE_CLASS

  onFullyEnterViewport: =>
    @isFullyInViewport = true
    @onFullyEnterViewportSync() if @asyncScriptsLoaded
    return if @hasFullyPlayed
    @hasFullyPlayed = true
    @$context.addClass CSS_FULLY_VISIBLE_CLASS
    @onAnimationPlay()

  onExitViewport: =>
    @isInViewport = false
    @isFullyInViewport = false
    @onExitViewportSync() if @asyncScriptsLoaded
    return if @hasExited
    @hasExited = true
    @$context.off @animationEndEvent, @onAnimationEnd if @animationEndEvent
    @$context.addClass CSS_EXIT_CLASS
    if @repeat
      @reset_()
    else if @hasPartiallyPlayed and @hasFullyPlayed
      @removeEventListeners_()
