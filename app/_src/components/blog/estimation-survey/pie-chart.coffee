class FOURTEEN.BlogEstimationSurveyPieChart extends FOURTEEN.BaseComponent


	TRANSITION_DURATION = 2000 # ms for animation


	constructor: (@$context, data) ->
		super(@$context, data)
		@labels = @$context.data('labels')
		@values = @$context.data('values')
		@type = @$context.data('type') or 'pie'
		@colorScheme = ['#01a084', '#b7d02e', '#eccd00', '#f8b334', '#535b82', '#424242', '#006457', '#83aa08', '#daa500', '#f17e0b', '#3e404d', '#2d2d2d']
		setTimeout =>
			@init()
			@watcher = scrollMonitor.create @$context
			@watcher.enterViewport @_onEnterViewport
		, 1


	_onEnterViewport: () =>
		@run()
		@watcher.destroy()


	init: =>
		width = @$context.parent().width()
		width = if @type is 'pie' then width * 0.8 else width
		height = Math.max(width * 3/4, 400)
		# init with empty values
		@chart = c3.generate({
			bindto: @$context[0],
			size: {
        height: height,
        width: width
    	},
			data: {
				columns: @columns(false)
				type : @type
				colors: @colors()
			}
			transition: {
				duration: TRANSITION_DURATION
			}
		});
		@$context.find('svg').css('height', height)

	run: =>
		@chart.load({
			columns: @columns()
		})

	columns: (showValues = true) =>
		columns = []
		for label, i in @labels
			columns.push([label, if showValues then @values[i] else 0])
		return columns

	colors: () =>
		colors = {}
		for label, i in @labels
			colors[label] = @colorScheme[i];
		return colors

	destroy: =>
		@watcher?.destroy()
		@chart?.destroy()
		super()
