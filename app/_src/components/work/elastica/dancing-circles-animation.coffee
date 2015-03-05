###*
#
# DancingCirclesAnimation animation component.
#
# For Elastica Case Study
#
# @author 14islands
#
###

class FOURTEEN.DancingCirclesAnimation extends FOURTEEN.ElementScrollVisibility

  ANIMATION_DURATION = 1000
  STROKE_WIDTH = 2


  # sub class Position
  class Position
    constructor: (@x, @y) ->


  # sub class Circle
  class Circle
    constructor: (@position, @size) ->

    animateTo: (properties, duration, easing) ->
      @animation = {
        target: properties
        duration: duration
        easing: easing
      }

    getPosition: (time) ->
      if @animation and @animation.target.position
        deltaX = @animation.target.position.x - @position.x
        deltaY = @animation.target.position.y - @position.y
        return {
          x: @animation.easing(time, @position.x, deltaX, @animation.duration)
          y: @animation.easing(time, @position.y, deltaY, @animation.duration)
        }
      return @position

    getSize: (time) ->
      if @animation and @animation.target.size
        deltaSize = @animation.target.size - @size
        return @animation.easing(time, @size, deltaSize, @animation.duration)
      return @size

    draw: (ctx, time) =>
      pos = @getPosition(time)
      size = @getSize(time)

      if size > 0
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, size, 0, Math.PI*2, true)
        ctx.fill()
        ctx.stroke()


  # sub class Line
  class Line
    constructor: (@circleFrom, @circleTo) ->

    draw: (ctx, time) =>
      pos1 = @circleFrom.getPosition(time)
      pos2 = @circleTo.getPosition(time)

      ctx.beginPath()
      ctx.moveTo(pos1.x, pos1.y)
      ctx.lineTo(pos2.x, pos2.y)
      ctx.stroke()



  ###
  # FOURTEEN.DancingCirclesAnimation()
  # @constructor
  ###
  constructor: (@$context, data) ->
    @canvas = $('canvas', @$context)[0]
    @lineColor = @$context.data('line-color')
    @backgroundColor = @$context.data('background-color')

    @isStarted = false
    @ctx = undefined
    @animationFrame = undefined
    @initDraw()

    # init FOURTEEN.ElementScrollVisibility
    super(@$context, data)

  destroy: ->
    super()
    cancelAnimationFrame(@animationFrame)
    @isStarted = false
    @canvas = undefined
    @ctx = undefined
    @animationFrame = undefined


  runAnimation: ->
    @startedTime = Date.now()
    @isStarted = true
    @draw()


  resetAnimation: ->
    @startedTime = null
    @isStarted = false
    @draw()


  timeElapsed: ->
    return 0 unless @isStarted
    Date.now() - @startedTime


  buildScene: ->
    # positions for circles - magic numbers alert!
    pos1 = new Position(@canvas.width*0.295, @canvas.height*0.19)
    pos2 = new Position(95+STROKE_WIDTH, @canvas.height*0.57)
    pos3 = new Position(@canvas.width-85-STROKE_WIDTH, @canvas.height-85-STROKE_WIDTH)
    pos4 = new Position(@canvas.width*0.675, @canvas.height*0.14)

    # create circles
    circle1 = new Circle(pos1, 35)
    circle2 = new Circle(pos2, 95)
    circle3 = new Circle(pos3, 85)
    circle4 = new Circle(pos4, 60)
    @circles = [circle1, circle2, circle3, circle4]

    # create lines
    line1 = new Line(circle1, circle2)
    line2 = new Line(circle2, circle3)
    line3 = new Line(circle3, circle4)
    line4 = new Line(circle4, circle1)
    line5 = new Line(circle1, circle3)
    line6 = new Line(circle2, circle4)
    @lines = [line1, line2, line3, line4, line5, line6]

    # setup animations
    circle1.animateTo({position: circle2.position, size: circle2.size}, ANIMATION_DURATION, FOURTEEN.Easing.easeInOutQuad)
    circle2.animateTo({position: circle3.position, size: circle3.size}, ANIMATION_DURATION, FOURTEEN.Easing.easeInOutQuad)
    circle3.animateTo({position: circle4.position, size: circle4.size}, ANIMATION_DURATION, FOURTEEN.Easing.easeInOutQuad)
    circle4.animateTo({position: circle1.position, size: circle1.size}, ANIMATION_DURATION, FOURTEEN.Easing.easeInOutQuad)


  initDraw: ->
    return unless @canvas.getContext
    @ctx = @canvas.getContext('2d')
    @buildScene()
    @draw() #first frame


  draw: =>
    time = @timeElapsed()

    if @isStarted and time < ANIMATION_DURATION
      @animationFrame = requestAnimationFrame(@draw)

    @ctx.clearRect(0, 0, @canvas.width, @canvas.height)

    @ctx.lineWidth = STROKE_WIDTH
    @ctx.strokeStyle = @lineColor
    @ctx.fillStyle = @backgroundColor

    line.draw(@ctx, time) for line in @lines
    circle.draw(@ctx, time) for circle in @circles


  # @override FOURTEEN.ElementScrollVisibility.onAnimationPlay
  onAnimationPlay: =>
    super()
    @runAnimation()

  # @override FOURTEEN.ElementScrollVisibility.onAnimationReset
  onAnimationReset: =>
    super()
    @resetAnimation()

