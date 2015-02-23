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
#
# Example usage:
#
# <div class="js-component-scroll-monitor" data-offset="500"></div>
#
# @author 14islands
#
###

class FOURTEEN.ElementScrollVisibility

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

        @$body = $(document.body)
        @animationEndEvent = FOURTEEN.Utils.whichAnimationEvent()

        if @repeat?
            @repeat = JSON.parse(@repeat)

        if @forceLoop?
            @forceLoop = JSON.parse(@forceLoop)

        if data?.isPjax
            @$body.one FOURTEEN.PjaxNavigation.EVENT_ANIMATION_SHOWN, @addEventListeners
        else
            @addEventListeners()

    destroy: () =>
        @removeEventListeners()

    addEventListeners: () =>
        offset = @$context.data('offset') or -100
        if scrollMonitor?
            @watcher = scrollMonitor.create @$context, offset
            @watcher.enterViewport @onEnterViewport
            @watcher.fullyEnterViewport @onFullyEnterViewport
            @watcher.exitViewport @onExitViewport
            @watcher.recalculateLocation()

    removeEventListeners: () =>
        if @watcher
            @watcher.destroy()
            @watcher = null

    reset: () =>
        @$context.removeClass CSS_PARTIALLY_VISIBLE_CLASS
        @$context.removeClass CSS_FULLY_VISIBLE_CLASS
        @$context.removeClass CSS_ANIMATE_CLASS
        @hasExited = false
        @hasPartiallyPlayed = false
        @hasFullyPlayed = false

    onAnimationEnd: =>
        @$context.addClass CSS_ANIMATED_CLASS

        if @forceLoop
            @$context.removeClass CSS_ANIMATE_CLASS
            setTimeout =>
                @$context.removeClass CSS_ANIMATED_CLASS
                @$context.addClass CSS_ANIMATE_CLASS
            , 500

    onEnterViewport: () =>
        return if @hasPartiallyPlayed
        @hasPartiallyPlayed = true
        @$context.removeClass CSS_EXIT_CLASS
        @$context.addClass CSS_PARTIALLY_VISIBLE_CLASS

    onFullyEnterViewport: () =>
        return if @hasFullyPlayed
        @hasFullyPlayed = true
        @$context.addClass CSS_FULLY_VISIBLE_CLASS + " " + CSS_ANIMATE_CLASS
        @$context.on @animationEndEvent, @onAnimationEnd if @animationEndEvent

    onExitViewport: () =>
        return if @hasExited
        @hasExited = true
        @$context.off @animationEndEvent, @onAnimationEnd if @animationEndEvent
        @$context.addClass CSS_EXIT_CLASS
        if @repeat
            @reset()
        else if @hasPartiallyPlayed and @hasFullyPlayed
            @removeEventListeners()
