class FOURTEEN.HeroNoiseIsland

  mathutil = {
  	normalize: (val, min, max) =>
  		return (val-min)/(max-min)
  	interpolate: (value, minimum, maximum) =>
  		return minimum + (maximum - minimum) * value
  	limit: (value, min, max) =>
  		return Math.min(Math.max(min, value), max)
  	limitInt: (value, min, max) =>
  		return Math.round(Math.min(Math.max(min, value), max))
  	dist: (x1, y1, x2 ,y2) =>
  		return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1))
  }

  constructor: (@el, @env) ->
    @boundingRect = el.getBoundingClientRect()
    @_localPos = {}
    @_worldPos = {}
    @_rotation = 0

    @_tX = Math.random()
    @_tY = Math.random()
    @_tA = Math.random()

    @noise = new Noise(Math.random())

    @setLocalPos({
      x: @boundingRect.left,
      y: @boundingRect.top
    })
    @setWorldPos(@_localPos)

    @onResize = @onResize.bind(this)

    window.addEventListener('resize', @onResize)
    @onResize()

  onResize: () =>
    @_logoWidth = @el.parentNode.parentNode.parentNode.clientWidth

  # How far to spread out is relative to logo size
  getSpreadX: () =>
    # return @_logoWidth * @env.spreadX * 0.01
    return @env.spreadX

  getSpreadY: () =>
    # return @_logoWidth * @env.spreadY * 0.01
    return @env.spreadY

  updatePhysics: (index, {mouseX, mouseY}) =>
    @_tX = @_tX + (@env.speed * 0.01)
    @_tY = @_tY + (@env.speed * 0.01)
    @_tA = @_tA + (@env.speed * 0.01)

    noiseX = @noise.perlin2(@_tX, @_tY)
    noiseY = @noise.perlin2(@_tY, @_tX)
    noiseRot = @noise.perlin2(@_tA, @_tA)

    @_rotation =+ (@env.rotation) * noiseRot;
    @_scale = 1 + (noiseRot * @env.scaleEffect) # simulates depth in parallax

    depthX = 0
    depthY = 0
    if (mouseX > -1)
      depthX = (@_worldPos.x - mouseX) * @_scale * @env.parallaxEffect
    if (mouseY > -1)
      depthY = (@_worldPos.y - mouseY) * @_scale * @env.parallaxEffect

    @_worldPos.x = @_localPos.x + (noiseX * @getSpreadX()) + depthX
    @_worldPos.y = @_localPos.y + (noiseY * @getSpreadY()) + depthY

  getLocalPos: () =>
    return @_localPos

  setLocalPos: ({x, y}) =>
    @_localPos = {x, y}

  getWorldPos: () =>
    return @_worldPos

  setWorldPos: ({x, y}) =>
    @_worldPos = {x, y}

  render: () =>
    # convert physics coords to local and translate DOM element
    x = @getWorldPos().x - @getLocalPos().x
    y = @getWorldPos().y - @getLocalPos().y
    z = 0
    rot = @_rotation

    scale = @_scale
    @el.style.transform = "translate3d(#{x}px, #{y}px, #{z}px) rotate3d(0,0,1,#{rot}rad) scale(#{scale})"
