###
  Scroll State Abstraction
  ------------------------
  Should be used by all components that need to query scroll state

  Holds info about scroll position, speed, direction, document / viewport size, etc

  Triggers "state:change" event when scroll state has changed

  Note:
   - This implementation uses ScrollMonitor to read the state, to avoid
     accessing window properties more than once.

###
class ScrollState

  # private vars
  $document = $(document)
  updating  = false
  latestFrame = Date.now()

  # prototype state vars
  @scrollDiff         : 0  # delta from last scroll position
  scrollDistance      : 0  # absolute delta
  scrollDirection     : 0  # -1, 0, or 1
  msSinceLatestChange : 0
  scrollSpeed         : 0  # pixels / second for latest frame
  documentHeight      : undefined
  viewportHeight      : undefined
  viewportTop         : 0
  viewportBottom      : undefined
  isScrollingUp       : undefined
  isScrollingDown     : undefined
  isScrolledToTop     : undefined
  isScrolledToBottom  : undefined

  constructor: ->
    @updateState()
    $(window).on('scroll', @updateState)

  # static state
  updateState: =>
    unless updating # can never be too careful
      updating = true

      now = Date.now()

      # distance and speed calcs
      @scrollDiff  = @viewportTop - scrollMonitor.viewportTop
      @scrollDistance  = Math.abs(@scrollDiff)
      @scrollDirection = Math.max(-1, Math.min(1, @scrollDiff))
      @msSinceLatestChange = (now - @latestFrame)
      @scrollSpeed = @scrollDistance / @msSinceLatestChange * 1000

      # viewport
      @documentHeight = scrollMonitor.documentHeight
      @viewportHeight = scrollMonitor.viewportHeight
      @viewportTop    = scrollMonitor.viewportTop
      @viewportBottom = scrollMonitor.viewportBottom

      # helpers
      @isScrollingUp = @scrollDirection > 0
      @isScrollingDown = @scrollDirection < 0
      @isScrolledToTop = @viewportTop <= 0
      @isScrolledToBottom = @viewportBottom >= @documentHeight

      @latestFrame = now
      $document.trigger('state:change', @)

      updating = false


FOURTEEN.ScrollState = new ScrollState()
