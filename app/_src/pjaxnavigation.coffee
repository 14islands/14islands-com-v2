# global $, TweenLite, Circ, Turbolinks
window.FOURTEEN ?= {}

# Class for all Pjax navigation logic - including scrolling
class FOURTEEN.PjaxNavigation

  constructor: (@navigationSelector, @btnHomeSelector, @contentSelector, @onLoadCallback) ->
    @$content = $(@contentSelector)
    @$navigation = $(@navigationSelector)
    @$btnHome = $(@btnHomeSelector)

    @init()

  init: ->
    # enable PJAX
    $(document).pjax('a', @contentSelector, {
      fragment: @contentSelector
    })

    # bind home link to first scroll up -> then navigate to home
    # (other wise page jumps to top since home page doesnt have content)
    @$btnHome.on('click', @onNavigateToHome)

    # hook up scrolling logic before showing new page
    @$content.on('pjax:beforeReplace', @onBeforeReplace)
    @$content.on('pjax:success', @onScrollToNavigation)
    @$content.on('pjax:success', @onLoadCallback)

  onBeforeReplace: =>
    # always scroll from current scroll position before replacing content below
    @yFrom = document.body.scrollTop
    # update position of navigation incase browser was resized since last time
    @yTo = window.innerHeight - @$navigation.outerHeight()

  onScrollToNavigation: (e) =>
    TweenLite.fromTo(window, 0.6, {
      scrollTo: {y: @yFrom}
    },
    {
      scrollTo: {y: @yTo}
      ease: Circ.easeInOut
      #onComplete: ->
        # TODO hide header?
        # addClass(document.querySelector('.hero'), 'hero--hidden')
        # window.scrollTo(0,0)
    })

  onNavigateToHome: (e) =>
    e.preventDefault()

    TweenLite.to(window, 0.6, {
      scrollTo: {y: 0}
      ease: Circ.easeInOut
      onComplete: =>
        # tell pjax to nav to home page
        $.pjax({url: '/', container: @contentSelector, fragment: @contentSelector})
    })
