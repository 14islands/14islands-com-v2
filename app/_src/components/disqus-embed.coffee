class FOURTEEN.DisqusEmbed extends FOURTEEN.BaseComponent

	ASSET_EI_JS_URL = '//assets.codepen.io/assets/embed/ei.js'
	DATA_SHORTNAME = 'disqus-shortname'
	DATA_IDENTIFIER = 'disqus-identifier'
	DATA_EXPANDED = 'disqus-expanded'

	constructor: (@$context, data) ->
		@shortname = @$context.data DATA_SHORTNAME
		@identifier = @$context.data DATA_IDENTIFIER
		@isExpanded = @$context.data(DATA_EXPANDED) || false
		@$countContainer = @$context.find('[data-disquss-count]').show()
		@$commentsContainer = @$context.find('[data-disquss-comments]')

		super(@$context, data)


	onReady: =>
		#unless @$context.find('script').length
		if @isExpanded
			@addEmbed()
		else
			@showNumberOfCommentsLink()


	destroy: =>
		@removeEmbed()
		@$context.find('script').remove()
		console.log "destroyed"


	showNumberOfCommentsLink: ->
		tmpl = @getNumberOfCommentsTemplate shortname: @shortname, identifier: @identifier
		@$context.append(tmpl)
		@$countContainer.one('click', (e) =>
			e.preventDefault()
			@addEmbed()
		)


	addEmbed: ->
		@removeEmbed()
		@$countContainer.hide()
		tmpl = @getEmbedTemplate shortname: @shortname, identifier: @identifier
		@$context.append(tmpl)


	removeEmbed: ->
		@$commentsContainer.empty()


	getNumberOfCommentsTemplate: (params) ->
		"<script type=\"text/javascript\">
		var disqus_shortname = '#{params.shortname}';
		var disqus_identifier = '#{params.identifier}';
		(function () {
				var s = document.createElement('script'); s.async = true;
				s.type = 'text/javascript';
				s.src = '//' + disqus_shortname + '.disqus.com/count.js';
				(document.getElementsByTagName('HEAD')[0] || document.getElementsByTagName('BODY')[0]).appendChild(s);
		}());</script>"


	getEmbedTemplate: (params) ->
		"<script type=\"text/javascript\">
	    var disqus_shortname = '#{params.shortname}';
	    var disqus_identifier = '#{params.identifier}';
	    (function() {
	        var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
	        dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
	        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
	    })();
		</script>"
