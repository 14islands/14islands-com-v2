class FOURTEEN.CodePenEmbedOnScroll

	ASSET_EI_JS_URL = '//assets.codepen.io/assets/embed/ei.js'
	DATA_SLUG = 'slug'
	DATA_OFFSET = 'offset'
	DATA_RATIO = 'ratio'
	HEIGHT = 400
	watcher = null

	constructor: (@$context, data) ->
		if data?.isPjax
			# wait for animation to be done
			@$body.one FOURTEEN.PjaxNavigation.EVENT_ANIMATION_SHOWN, @init
		else
			@init()

	init: ->
		if typeof scrollMonitor is 'object'
			offset = @$context.data DATA_OFFSET or -50
			watcher = scrollMonitor.create( @$context, offset )
			watcher.enterViewport @onEnterViewport
		else
			@onEnterViewport()

	destroy: () =>
		if watcher isnt null
			watcher.destroy()
			watcher = null

	onEnterViewport: =>
		@injectCodePenMarkup()
		watcher.destroy() if watcher isnt null

	injectCodePenMarkup: =>
		slug = @getSlug()

		if slug?
			height = @getHeight()
			tmpl = @getTemplate height: height, slug: slug

			@$context.append(tmpl)

			setTimeout =>
				@initCodePenJS()
			, 100

	injectCodePenScriptTag: ->
		script = document.createElement 'script'
		script.src = ASSET_EI_JS_URL
		script.async = true
		script.insertBefore
		@$context.before script

	initCodePenJS: ->
		scriptSelector = 'script[src="' + ASSET_EI_JS_URL + '"]'
		isCodePenJSInjected = ($(scriptSelector).length > 0)
		if isCodePenJSInjected isnt true or true
			# Note: CodePenEmbed will auto-execute
			# after it's loaded (ei.js)
			@injectCodePenScriptTag()
		else if typeof CodePenEmbed is 'object'
			# TODO this needs to wait for it to load !
			CodePenEmbed.init()

	getTemplate: (params) ->
		"<p data-height=\"#{params.height}\" data-theme-id=\"6678\" data-slug-hash=\"#{params.slug}\" data-default-tab=\"result\" data-user=\"14islands\" class=\"codepen\"></p>"

	getHeight: ->
		ratio = @getRatio()
		HEIGHT * ratio

	getSlug: ->
		@$context.data DATA_SLUG

	getRatio: ->
		ratio = @$context.data DATA_RATIO
		return if ratio then parseInt(ratio, 10) else 1