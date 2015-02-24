###*
#
# CircularMask animation component.
#
# @author 14islands
#
###

class FOURTEEN.CircularMaskAnimation extends FOURTEEN.ElementScrollVisibility

  LENS_RADIUS = 110
  SCALE_DURATION = 1500
  MOVE_DURATION = 1300

  constructor: (@$context, data) ->
    @canvas = $('canvas', @$context)[0]
    @srcImg = $('.elastica-circular-mask-animation__ratio__mask')[0]
    @startX = 150
    @startY = @canvas.height - LENS_RADIUS
    @endX = 280
    @endY = 170
    @startSize = 0

    @animationStarted
    @isLoaded = false
    @isStarted = false

    @initDraw()

    # init FOURTEEN.ElementScrollVisibility
    super(@$context, data)


  runAnimation: =>
    @animationStarted = Date.now()
    @isStarted = true
    @draw()


  resetAnimation: =>
    @animationStarted = null
    @isStarted = false
    @draw()


  timeElapsed: =>
    return 0 unless @isStarted
    Date.now() - @animationStarted


  initDraw: =>
    return unless @canvas.getContext

    @ctx = @canvas.getContext('2d')

    @img = new Image()
    @img.addEventListener('load', =>
      @isLoaded = true
      if @isStarted
        @runAnimation()
    , true)
    @img.src = @srcImg.src


  getPosition: =>
    time = Math.max(0, Math.min(MOVE_DURATION, @timeElapsed() - SCALE_DURATION))

    x = FOURTEEN.Easing.easeInSine(time, @startX, @endX-@startX, MOVE_DURATION)
    y = FOURTEEN.Easing.easeOutSine(time, @startY, @endY-@startY, MOVE_DURATION)

    return {
      x: x,
      y: y
    }

  getSize: =>
    endSize = LENS_RADIUS
    time = Math.min(SCALE_DURATION, @timeElapsed())
    return FOURTEEN.Easing.easeInOutQuart(time, @startSize, endSize-@startSize, SCALE_DURATION)

  draw: =>
    return unless @isLoaded

    if @timeElapsed() < (MOVE_DURATION + SCALE_DURATION)
      requestAnimationFrame(@draw)

    @ctx.clearRect(0, 0, @canvas.width, @canvas.height)

    @ctx.save()

    @ctx.lineWidth = 1
    @ctx.strokeStyle = '#F6772C' # better anti-aliasing
    @ctx.fillStyle = 'rgba(255,255,255,1)'

    size = @getSize()
    pos = @getPosition()

    @ctx.beginPath()
    @ctx.arc(pos.x, pos.y, size, 0, Math.PI*2, true)
    @ctx.clip()

    @ctx.fill()
    @ctx.drawImage(@img, 0, 0, @canvas.width, @canvas.height)
    @ctx.stroke()

    @ctx.closePath()
    @ctx.restore()


  # @override FOURTEEN.ElementScrollVisibility.onAnimationPlay
  onAnimationPlay: =>
    super()
    @runAnimation()

  # @override FOURTEEN.ElementScrollVisibility.onAnimationReset
  onAnimationReset: =>
    super()
    @resetAnimation()

