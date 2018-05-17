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
    @delay = parseInt(@$context.data('delay'), 10) || 0
    super(@$context, @data)

  onScriptsLoadedSync: =>
    @initializeAnimation()

  onEnterViewport: =>
  	unless @isPlaying then @play()

  onExitViewport: =>
  	if @isPlaying then @stop()

  initializeAnimation: =>
  	data =
  		container: @context
  		autoplay: false
  		loop: false
  		renderer: 'svg'
  		path: '/js/lottie/' + @path.replace(/^\/+/, "")

  	@animationEl = window.bodymovin.loadAnimation data

  play: =>
  	setTimeout (=>
  		@isPlaying = true
  		@animationEl.play()
  	), @delay

  stop: =>
  	@isPlaying = false
  	@animationEl.stop()

  destroy: =>
    if @animationEl then @animationEl.destroy()
