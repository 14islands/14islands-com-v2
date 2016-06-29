class FOURTEEN.EstimationPostCollision extends FOURTEEN.BaseComponent

	scripts: [
		'//cdn.rawgit.com/mbostock/d3/v3.5.5/d3.min.js',
	]

	SELECTOR_CONTAINER = '#js-estimation-post-collision-container'

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

	destroy: ->
		super()
