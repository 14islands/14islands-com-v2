class FOURTEEN.SpeakerdeckEmbed extends FOURTEEN.ElementScrollVisibility

	ASSET_EI_JS_URL = '//assets.codepen.io/assets/embed/ei.js'
	DATA_SLUG = 'id'
	DATA_RATIO = 'ratio'
	DEFAULT_RATIO = 4/3
	EMBED_SELECTOR = '> *'

	constructor: (@$context, data) ->
		@slug = @$context.data DATA_SLUG
		super(@$context, data)

	onReady: =>
		@addEmbed()

	destroy: =>
		@removeEmbed()
		@$context.remove()

	addEmbed: =>
		@injectMarkup()

	removeEmbed: =>
		@$context.find(EMBED_SELECTOR).remove()

	injectMarkup: =>
		tmpl = @getTemplate ratio: @getRatio(), slug: @slug
		@$context.append(tmpl)

	getTemplate: (params) ->
		"<script async class=\"speakerdeck-embed\" data-id=\"#{params.slug}\" data-ratio=\"#{params.ratio}\" src=\"//speakerdeck.com/assets/embed.js\"></script>"


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
