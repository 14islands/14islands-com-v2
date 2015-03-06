###
  Sticky Nav component

  Listens to change events from FOURTEEN.ScrollState

  Header is permanently "sticky" by default (using position: fixed;)

  If scrolling down with enough speed, we hide the header by adding a class.
###


class FOURTEEN.StickyNav

  HIDDEN_CLASS = 'sticky-nav--hidden'
  VISIBLE_CLASS = 'sticky-nav--visible'
  THROTTLE_DELAY = 50

  # Speed/Distance required to change appearance per scroll frame
  MIN_SCROLL_SPEED = 600
  MIN_SCROLL_DISTANCE = 20

  constructor: (@$context) ->
    @$document = $(document)
    @isHidden = false
    @isBusyChecking = false
    @animationEndEvent = FOURTEEN.Utils.whichAnimationEvent()

    @init()


  init: ->
    @$document.on(FOURTEEN.ScrollState.EVENT_SCROLL_FRAME, @onStateChanged)


  onStateChanged: (e, state) =>
    unless @isBusyChecking
      @isBusyChecking = true
      setTimeout( =>
        @checkScrollState(state)
      , THROTTLE_DELAY)


  show: =>
    if @isHidden
      @$context.addClass(VISIBLE_CLASS).removeClass(HIDDEN_CLASS)
      @isHidden = false
      @$context.one @animationEndEvent, =>
        @$context.removeClass(VISIBLE_CLASS)


  hide: =>
    unless @isHidden
      @$context.addClass(HIDDEN_CLASS).removeClass(VISIBLE_CLASS)
      @isHidden = true


  checkScrollState: (state) =>
    # scrolled to the very top or bottom; element slides in
    if state.isScrolledToTop or state.isScrolledToBottom
      @show()

    # else if scrolling with enough speed
    # * fast computer -> many events -> short distance between events = better to check speed
    # * slow computer -> few events -> less visible speed = better to check distance
    else if state.scrollSpeed > MIN_SCROLL_SPEED or state.scrollDistance > MIN_SCROLL_DISTANCE

      # scrolled up ; element slides in
      if state.isScrollingUp
        @show()

      # scrolled down with enough speed; element slides out
      else if state.isScrollingDown
        @hide()

    @isBusyChecking = false


  destroy: =>
    @show()
    @$document.off(FOURTEEN.ScrollState.EVENT_SCROLL_FRAME, @onScrollDebounced)

