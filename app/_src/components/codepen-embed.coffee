class FOURTEEN.CodePenEmbedOnScroll

  ASSET_EI_JS_URL = '//assets.codepen.io/assets/embed/ei.js'
  DATA_SLUG = 'slug'
  DATA_RATIO = 'ratio'
  DEFAULT_RATIO = 16/9
  EMBED_SELECTOR = '> div:not(.spinner)'
  PRELOAD_DURATION = 4000 #ms to allow browser to preload before removing from DOM

  constructor: (@$context, data) ->
    @$body = $('body')
    @isInViewport = false
    @isEmbedded = false
    @spinner = new FOURTEEN.Spinner @$context

    if data?.isPjax
      # wait for animation to be done
      @$body.one FOURTEEN.PjaxNavigation.EVENT_ANIMATION_SHOWN, @init
    else
      @init()


  destroy: =>
    @removeEmbed()


  init: =>
    if scrollMonitor?
      @watcher = scrollMonitor.create @$context
      @watcher.enterViewport @onEnterViewport
      @watcher.fullyEnterViewport @onFullyEnterViewport
      @watcher.exitViewport @onExitViewport

      @preloadEmbed()

    else
      # always show embed if no scrollMonitor
      @onEnterViewport


  onEnterViewport: =>
    @isInViewport = true
    unless @isEmbedded
      @spinner.show()


  onFullyEnterViewport: =>
    unless @isEmbedded
      @spinner.hide( =>
        @addEmbed()
      )

  onExitViewport: =>
    @isInViewport = false
    # no need to remove what the user has already seen.
    # as longs as pens only run once - no looping
    # @removeEmbed()


  # embed for a short time before removing again - browser will cache resources
  preloadEmbed: =>
    unless @isInViewport
      @addEmbed()
      setTimeout( =>
        # make sure it wasn't scrolled in to viewport while preloading
        unless @isInViewport
          @removeEmbed()
      , PRELOAD_DURATION)


  addEmbed: =>
    @isEmbedded = true
    @injectCodePenMarkup()
    @injectCodePenJS()


  removeEmbed: =>
    @isEmbedded = false
    @$context.find(EMBED_SELECTOR).remove()


  injectCodePenMarkup: =>
    slug = @getSlug()

    if slug?
      height = @getHeight()
      tmpl = @getTemplate height: height, slug: slug
      @$context.append(tmpl)


  injectCodePenJS: ->
    scriptSelector = 'script[src="' + ASSET_EI_JS_URL + '"]'
    isCodePenJSInjected = ($(scriptSelector).length > 0)
    if isCodePenJSInjected is true
      if typeof CodePenEmbed is 'object'
        CodePenEmbed.init()
        CodePenEmbed.showCodePenEmbeds()
    else
      script = document.createElement 'script'
      script.src = ASSET_EI_JS_URL
      script.async = true
      @$body.append script


  getTemplate: (params) ->
    "<p data-height=\"#{params.height}\" data-theme-id=\"6678\" data-slug-hash=\"#{params.slug}\" data-default-tab=\"result\" data-user=\"14islands\" class=\"codepen\"></p>"


  getHeight: ->
    ratio = @getRatio()
    parseInt(@$context.outerWidth() / ratio, 10)


  getSlug: ->
    @$context.data DATA_SLUG


  # ratio string must be formatted like so "16_9" "4_3" - also used by CSS
  getRatio: ->
    ratio = @$context.data(DATA_RATIO) + ""
    parts = ratio?.split('_')

    if parts.length > 1
      width = parseInt(parts[0], 10)
      height = parseInt(parts[1], 10)
      return width / height;
    else
      return DEFAULT_RATIO
