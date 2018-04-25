###
  Lottie Component
###
class FOURTEEN.Lottie extends FOURTEEN.ElementScrollVisibility

  # @override FOURTEEN.BaseComponent.scripts
  scripts: [
    'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/4.13.0/bodymovin.min.js'
  ]

  constructor: (@$context, @data, @instanceId) ->
    @context = @$context.get(0)
    @path = @$context.data('path')
    super(@$context, @data)

  onScriptsLoadedSync: =>
    @initializeAnimation()

  onEnterViewportSync: =>
  	@play()

  initializeAnimation: =>
  	data =
  		container: @context
  		autoplay: false
  		loop: false
  		renderer: 'svg'
  		path: '/js/lottie/' + @path.replace(/^\/+/, "")

  	@animationEl = window.bodymovin.loadAnimation data

  play: =>
  	@animationEl.play()

  stop: =>
  	@animationEl.stop()

  destroy: =>
    if @animationEl then @animationEl.destroy()
