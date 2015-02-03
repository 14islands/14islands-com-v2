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

    constructor: (@$context, data) ->
        @context = @$context.get(0)
        @$body = $(document.body)

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

    onEnterViewport: () =>
        return if @hasPartiallyPlayed
        @hasPartiallyPlayed = true
        @$context.addClass CSS_PARTIALLY_VISIBLE_CLASS

    onFullyEnterViewport: () =>
        return if @hasFullyPlayed
        @hasFullyPlayed = true
        @$context.addClass CSS_FULLY_VISIBLE_CLASS + " " + CSS_ANIMATE_CLASS

        animationEnd = FOURTEEN.Utils.whichAnimationEvent()

        if (animationEnd)
            @$context.on animationEnd, ->
                @$context.addClass CSS_ANIMATED_CLASS
                setTimeout ->
                    @$context.addClass CSS_ANIMATE_CLASS
                , 50

    onExitViewport: () =>
        return if @hasExited
        @hasExited = true
        @$context.addClass CSS_EXIT_CLASS
        @removeEventListeners() if @hasPartiallyPlayed and @hasFullyPlayed