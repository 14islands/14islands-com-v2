class FOURTEEN.CodePenEmbedOnScroll

	ASSET_EI_JS_URL = '//assets.codepen.io/assets/embed/ei.js'
	DATA_SLUG = 'slug'
	DATA_RATIO = 'ratio'
	DATA_HEIGHT = 'height'
	DATA_TAB = 'tab'
	DATA_LAZY = 'lazyload'
	DEFAULT_RATIO = 16/9
	DEFAULT_TAB = 'result'
	DEFAULT_LAZY = false
	EMBED_SELECTOR = '.codepen-embed__content'
	PRELOAD_DURATION = 4000 #ms to allow browser to preload before removing from DOM

	constructor: (@$context, data) ->
		@$body = $('body')
		@$content = @$context.find(EMBED_SELECTOR)
		@isInViewport = false
		@isEmbedded = @$content.children().length > 0 # could be cached by pjax

		@isLazy = @$context.data DATA_LAZY || DEFAULT_LAZY
		@slug = @$context.data DATA_SLUG
		@tab = @$context.data DATA_TAB || DEFAULT_TAB

		@spinner = new FOURTEEN.Spinner @$context

		if data?.isPjax
			# wait for animation to be done
			@$body.one FOURTEEN.PjaxNavigation.EVENT_ANIMATION_SHOWN, @init
		else
			@init()


	destroy: =>
		@removeEmbed()


	init: =>
		if @isLazy and scrollMonitor?
			@watcher = scrollMonitor.create @$context
			@watcher.enterViewport @onEnterViewport
			@watcher.fullyEnterViewport @onFullyEnterViewport
			@watcher.exitViewport @onExitViewport

			# should be a setting maybe
			@preloadEmbed()

		else
			# always show embed if no scrollMonitor
			@addEmbed()


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
		unless @isEmbedded
			@isEmbedded = true
			@injectCodePenMarkup()
			@injectCodePenJS()


	removeEmbed: =>
		@isEmbedded = false
		@$content.children().remove()


	injectCodePenMarkup: =>
		if @slug?
			height = @getHeight()
			tmpl = @getTemplate height: height, slug: @slug, tab: @tab
			@$content.append(tmpl)


	injectCodePenJS: ->
		if $('#codepen-script-tag').length > 0
			if typeof CodePenEmbed is 'object'
				CodePenEmbed.init()
				CodePenEmbed.showCodePenEmbeds()
		else
			script = document.createElement 'script'
			script.id = 'codepen-script-tag'
			script.src = ASSET_EI_JS_URL
			script.async = true
			@$body.append script


	getTemplate: (params) ->
		"<p data-height=\"#{params.height}\" data-theme-id=\"6678\" data-slug-hash=\"#{params.slug}\" data-default-tab=\"#{params.tab}\" data-user=\"14islands\" class=\"codepen\"></p>"


	getHeight: ->
		height = @$context.data DATA_HEIGHT
		if isFinite(height)
			return height
		else
			ratio = @getRatio()
			return parseInt(@$context.outerWidth() / ratio, 10)


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
