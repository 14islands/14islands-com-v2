class FOURTEEN.CodePenEmbedOnScroll

	ASSET_EI_JS_URL = '//assets.codepen.io/assets/embed/ei.js'
	DATA_SLUG = 'slug'
	DATA_RATIO = 'ratio'
	DEFAULT_RATIO = 2

	constructor: (@$context, data) ->
		if data?.isPjax
			# wait for animation to be done
			@$body.one FOURTEEN.PjaxNavigation.EVENT_ANIMATION_SHOWN, @init
		else
			@init()

	init: ->
		@injectCodePenMarkup()

	destroy: () =>
		if watcher isnt null
			watcher.destroy()
			watcher = null

	injectCodePenMarkup: =>
		slug = @getSlug()

		if slug?
			height = @getHeight()
			tmpl = @getTemplate height: height, slug: slug
			@$context.append(tmpl)

	getTemplate: (params) ->
		"<p data-height=\"#{params.height}\" data-theme-id=\"6678\" data-slug-hash=\"#{params.slug}\" data-default-tab=\"result\" data-user=\"14islands\" class=\"codepen\"></p>"

	getHeight: ->
		ratio = @getRatio()
		parseInt(@$context.outerWidth(), 10) / ratio

	getSlug: ->
		@$context.data DATA_SLUG

	getRatio: ->
		ratio = @$context.data DATA_RATIO
		if ratio?
			return parseInt(ratio, 10)
		else
			return DEFAULT_RATIO