class FOURTEEN.EstimationPostPieChart extends FOURTEEN.BaseComponent

	scripts: [
		'//cdn.rawgit.com/mbostock/d3/v3.5.5/d3.min.js',
		'//cdn.rawgit.com/c3js/c3/0.4.11/c3.min.js'
	]

	SELECTOR_CONTAINER = '#js-estimation-post-collision-container'

	constructor: (@$context, data) ->
		super(@$context, data)
		@labels = @$context.data('labels')
		@values = @$context.data('values')
		@type = @$context.data('type') or 'pie'
		@colorScheme = ['#01a084', '#b7d02e', '#eccd00', '#f8b334', '#535b82', '#424242', '#006457', '#83aa08', '#daa500', '#f17e0b', '#3e404d', '#2d2d2d']

	onScriptsLoaded: =>
		@init()

	init: =>
		# init with empty values
		@chart = c3.generate({
			bindto: @$context[0],
			data: {
				columns: @columns(false)
				type : @type
				colors: @colors()
			}
			transition: {
				duration: 2000
			}
		});

		# TODO use scrollMonitor
		setTimeout( () =>
			@showChart()
		, 1000)


	showChart: =>
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

	destroy: ->
		super()
