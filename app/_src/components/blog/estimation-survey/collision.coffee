class FOURTEEN.BlogEstimationSurveyCollision extends FOURTEEN.BaseComponent

	scripts: [
		'//cdn.rawgit.com/mbostock/d3/v3.5.5/d3.min.js',
	]

	SELECTOR_CONTAINER = '#js-estimation-post-collision-container'

	NODES = [
		# 18 of these bad boys (blue)
		{ r: 10, fill: "#006457" },
		{ r: 10, fill: "#006457" },
		{ r: 10, fill: "#006457" },
		{ r: 10, fill: "#006457" },
		{ r: 10, fill: "#006457" },
		{ r: 10, fill: "#006457" },
		{ r: 10, fill: "#006457" },
		{ r: 10, fill: "#006457" },
		{ r: 10, fill: "#006457" },
		{ r: 10, fill: "#006457" },
		{ r: 10, fill: "#006457" },
		{ r: 10, fill: "#006457" },
		{ r: 10, fill: "#006457" },
		{ r: 10, fill: "#006457" },
		{ r: 10, fill: "#006457" },
		{ r: 10, fill: "#006457" },
		{ r: 10, fill: "#006457" },
		{ r: 10, fill: "#006457" },
		# 3 of these bad boys (green)
		{ r: 15, fill: "#83aa08" },
		{ r: 15, fill: "#83aa08" },
		{ r: 15, fill: "#83aa08" },
		# 4 of these bad boys (yellow)
		{ r: 20, fill: "#daa500" },
		{ r: 20, fill: "#daa500" },
		{ r: 20, fill: "#daa500" },
		{ r: 20, fill: "#daa500" },
		# 2 of these bad boys (orange)
		{ r: 25, fill: "#f17e0b" }
		{ r: 25, fill: "#f17e0b" }
	]

	W = 600
	H = 400

	constructor: (@$context, data) ->
		super(@$context, data)

	onScriptsLoaded: =>
		@init()
		setTimeout =>
			@watcher = scrollMonitor.create @$context
			@watcher.enterViewport @_onEnterViewport
		, 1

	_onEnterViewport: () =>
		@run()
		@watcher.destroy()

	run: =>
		@force = d3.layout.force()
			.gravity(0.05)
			.nodes( NODES )
			.size([ W, H])

		@force.start()

		@force.on("tick", (e) =>
			q = d3.geom.quadtree(NODES)
			i = 0
			n = NODES.length

			while (++i < n)
				q.visit(() => collide(NODES[i]))

			@svg.selectAll("circle")
				.attr("cx", (d) -> d.x )
				.attr("cy", (d) -> d.y )
		)

		@svg.on("mousemove", () ->
			onInteraction(this)
		)
		@svg.on("touchmove", () ->
		  onInteraction(this)
		)

		that = this
		onInteraction = (arg) ->
			p1 = d3.mouse(arg)
			that.root.px = p1[0]
			that.root.py = p1[1]
			that.force.resume()
			return

		collide = (node) ->
			r = node.r + 0
			nx1 = node.x - r
			nx2 = node.x + r
			ny1 = node.y - r
			ny2 = node.y + r
			(quad, x1, y1, x2, y2) ->
				`var r`
				if quad.point and quad.point != node
					x = node.x - (quad.point.x)
					y = node.y - (quad.point.y)
					l = Math.sqrt(x * x + y * y)
					r = node.r + quad.point.r
					if l < r
						l = (l - r) / l * .5
						node.x -= x *= l
						node.y -= y *= l
						quad.point.x += x
						quad.point.y += y
				x1 > nx2 or x2 < nx1 or y1 > ny2 or y2 < ny1

	init: =>
		@root = NODES[0]
		@root.r = 0
		@root.fixed = true

		@svg = d3.select( SELECTOR_CONTAINER )
			 .append("svg")
			 .attr("preserveAspectRatio", "xMinYMin meet")
			 .attr("viewBox", "0 0 " + W + " " + H)
			 .classed("svg-content", true)

		@svg.selectAll("circle")
			.data( NODES )
			.enter()
			.append("svg:circle")
			.attr("r", (d) -> d.r )
			.style("fill", (d, i) -> d.fill )


	destroy: ->
		super()
