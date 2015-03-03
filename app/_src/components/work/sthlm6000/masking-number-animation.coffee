###*
#
# MaskingNumberAnimation animation component.
#
# For Sthlm6000 Case Study
#
# @author 14islands
#
###

class FOURTEEN.MaskingNumberAnimation extends FOURTEEN.ElementScrollVisibility

  DURATION = 2000

  constructor: (@$context, data) ->
    @$cover            = @$context.find('.js-cover')
    @$content          = @$context.find('.js-cover-content')
    @$numbers          = @$context.find('.js-number')

    @transformProp     = Modernizr.prefixed('transform')

    @targetValue      = 3030
    @maxValue         = 6000
    @targetPercentage  = 100 - (@targetValue / @maxValue) * 100

    @resetAnimation()

    # init FOURTEEN.ElementScrollVisibility
    super(@$context, data)


  runAnimation: =>
    @animationStarted = Date.now()
    @moveCover(@targetPercentage)
    @animateNumbers()


  resetAnimation: =>
    cancelAnimationFrame(@nextFrame)
    @animationStarted = -1
    @moveCover(100)
    @currentValue = -1
    @updateNumber(0)


  moveCover: (percentage) ->
    if Modernizr.csstransforms3d
      @$cover.css @transformProp, 'translate3d(-' + percentage + '%, 0, 0)'
      @$content.css @transformProp, 'translate3d(' + percentage + '%, 0, 0)'

    else
      @$cover.css @transformProp, 'translateX(-' + percentage + '%)'
      @$content.css @transformProp, 'translateX(' + percentage + '%)'

    return # prevent array return

  timeElapsed: =>
    return Math.min(DURATION, Date.now() - @animationStarted)


  updateNumber: (newValue) ->
    if newValue > @currentValue
      @currentValue = newValue
      @$numbers.html(@currentValue)


  # Animation frame
  animateNumbers: =>
    @nextFrame = requestAnimationFrame(@animateNumbers) if @currentValue < @targetValue
    newValue = Math.round(FOURTEEN.Easing.easeInOutCirc(@timeElapsed(), 0, @targetValue, DURATION))
    @updateNumber(newValue)


  # @override FOURTEEN.ElementScrollVisibility.onAnimationPlay
  onAnimationPlay: =>
    super()
    @runAnimation()

  # @override FOURTEEN.ElementScrollVisibility.onAnimationReset
  onAnimationReset: =>
    super()
    @resetAnimation()
