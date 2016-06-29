class FOURTEEN.BlogEstimationSurveyCollision extends FOURTEEN.BaseComponent

	scripts: [
		'//cdn.rawgit.com/mbostock/d3/v3.5.5/d3.min.js',
	]

	SELECTOR_CONTAINER = '#js-estimation-post-collision-container'

	NODES = [
		{ r: 18, fill: "red" },
		{ r: 3, fill: "purple" },
		{ r: 4, fill: "blue" },
		{ r: 2, fill: "green" }
	]

	constructor: (@$context, data) ->
		super(@$context, data)

	onScriptsLoaded: =>
		@init()

	init: =>
		@svg = d3.select( SELECTOR_CONTAINER )
			 .append("svg")
			 .attr("preserveAspectRatio", "xMinYMin meet")
			 .attr("viewBox", "0 0 600 400")
			 .classed("svg-content", true)

		@svg.selectAll("circle")
			.data( NODES )
			.enter()
			.append("svg:circle")
			.attr("r", (d) -> d.r )
			.style("fill", (d, i) -> d.fill )

	destroy: ->
		super()
