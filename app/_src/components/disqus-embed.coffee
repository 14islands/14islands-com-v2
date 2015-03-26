class FOURTEEN.DisqusEmbed extends FOURTEEN.BaseComponent

	ASSET_EI_JS_URL = '//assets.codepen.io/assets/embed/ei.js'
	DATA_SHORTNAME = 'disqus-shortname'
	DATA_IDENTIFIER = 'disqus-identifier'
	DATA_EXPANDED = 'disqus-expanded'

	constructor: (@$context, data) ->
		@shortname = @$context.data DATA_SHORTNAME
		@identifier = @$context.data DATA_IDENTIFIER
		@isExpanded = @$context.data(DATA_EXPANDED) || false
		@$countContainer = @$context.find('[data-disquss-count]')
		@$commentsContainer = @$context.find('[data-disquss-comments]')
		super(@$context, data)


	onReady: =>
		# make sure this is not cached PJAX markup with existing comments
		unless @$commentsContainer.children().length
			if @isExpanded
				@addEmbed()
			else
				@showNumberOfCommentsLink()


	destroy: =>
		@removeEmbed()
		@$context.find('script').remove().length
		# must be removed so count scripts run again
		@$countContainer.off('click', @onShowComments)
		# must be undefined for count to be updated
		window.DISQUSWIDGETS = undefined


	onShowComments: (e) =>
		e.preventDefault()
		@addEmbed()


	showNumberOfCommentsLink: ->
		tmpl = @getNumberOfCommentsTemplate shortname: @shortname, identifier: @identifier
		@$context.append(tmpl)
		@$countContainer.one('click', @onShowComments)


	addEmbed: ->
		# must set min height so it doesn't collapse when we hide count button
		@$context.css('minHeight', @$context.outerHeight())
		@$countContainer.hide()
		tmpl = @getEmbedTemplate shortname: @shortname, identifier: @identifier
		@$context.append(tmpl)


	removeEmbed: ->
		@$commentsContainer.html("")


	getNumberOfCommentsTemplate: (params) ->
		#added cache bust timestamp to make sure we make an actual request each time
		"<script type=\"text/javascript\">
		var disqus_shortname = '#{params.shortname}';
		var disqus_identifier = '#{params.identifier}';
		(function () {
				var s = document.createElement('script'); s.async = true;
				s.type = 'text/javascript';
				s.src = '//' + disqus_shortname + '.disqus.com/count.js?cacheBust='+Date.now();
				(document.getElementsByTagName('HEAD')[0] || document.getElementsByTagName('BODY')[0]).appendChild(s);
		}());</script>"


	getEmbedTemplate: (params) ->
		# This inline script is injected into the markup and cached by PJAX history navigation
		# The followin snippet is modified to avoid multiple scripts and comment iframes being injected
		"<script type=\"text/javascript\">
			var disqus_shortname = '#{params.shortname}';
			var disqus_identifier = '#{params.identifier}';
			/* here we will only load the disqus <script> if not already loaded */
			if (!window.DISQUS) {
				(function() {
						var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
						dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
						(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
				})();
			}
			/* if disqus <script> already loaded, we just reset disqus the right way
			   see http://help.disqus.com/customer/portal/articles/472107-using-disqus-on-ajax-sites */
			else {
				/* remove existing comments first incase this is a cached PJAX result (after history navigation) */
				$('[data-disquss-comments]').empty();
				DISQUS.reset({
					reload: true,
					config: function () {
						this.page.identifier = disqus_identifier
					}
				})
			}
		</script>"
