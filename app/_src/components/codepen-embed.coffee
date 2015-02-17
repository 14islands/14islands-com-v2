class FOURTEEN.CodePenEmbed

	ASSET_EI_JS_URL = '//assets.codepen.io/assets/embed/ei.js'
	DATA_SLUG = 'slug'
	DATA_OFFSET = 'offset'
	watcher = null

	constructor: (@$context) ->
		if typeof scrollMonitor is 'object'
			@addEventListeners()
		else
			@injectCodePenMarkup()

	addEventListeners: () =>
		offset = @$context.data DATA_OFFSET or -100
		watcher = scrollMonitor.create( @$context, offset )
		watcher.enterViewport @onEnterViewport

	onEnterViewport: =>
		@injectCodePenMarkup()
		watcher.destroy() if watcher isnt null

	injectCodePenMarkup: =>
		slug = @$context.data DATA_SLUG

		if slug?
			height = @getHeight()
			tmpl = @getTemplate height: height, slug: slug

			@$context.append tmpl

			setTimeout =>
				@initCodePenJS()
			, 100

	injectCodePenJS: ->
		script = document.createElement 'script'
		script.src = ASSET_EI_JS_URL
		script.async = true
		@$context.append script

	initCodePenJS: ->
		if typeof CodePenEmbed isnt 'object'
			@injectCodePenJS() # CodePenEmbed will auto-execute after appended
		else
			CodePenEmbed.init()

	getTemplate: (params) ->
		"<p data-height=\"#{params.height}\" data-theme-id=\"6678\" data-slug-hash=\"#{params.slug}\" data-default-tab=\"result\" data-user=\"14islands\" class=\"codepen\"></p>"

	getHeight: ->
		ratio = @getRatio()
		400

	getRatio: ->
		1