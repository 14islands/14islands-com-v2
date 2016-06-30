class FOURTEEN.BlogEstimationSurveyCollision extends FOURTEEN.BaseComponent

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

	# 16:9
	W = 480
	H = 270

	constructor: (@$context, data) ->
		super(@$context, data)
		@init()
		setTimeout =>
			@watcher = scrollMonitor.create @$context
			@watcher.enterViewport @_onEnterViewport
		, 1

	_onEnterViewport: () =>
		setTimeout =>
			@run()
			@watcher.destroy()
		, 500

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
			.attr("cy", "-1000")
			.attr("cx", "-1000")
			.attr("r", (d) -> d.r )
			.style("fill", (d, i) -> d.fill )

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
				q.visit(collide(NODES[i]))

			@svg.selectAll("circle")
				.attr("cx", (d) -> d.x )
				.attr("cy", (d) -> d.y )
		)

		that = this
		onInteraction = (svg) ->
			if svg?
				coordinates = d3.mouse(svg)
				that.root.px = coordinates[0]
				that.root.py = coordinates[1]
				that.force.resume()
			return

		@svg.on("mousemove", () -> onInteraction(this) )
		@svg.on("touchmove", () -> onInteraction(this) )

		collide = (node) ->
			r = node.r
			nx1 = node.x - r
			nx2 = node.x + r
			ny1 = node.y - r
			ny2 = node.y + r
			(quad, x1, y1, x2, y2) ->
				if quad.point and quad.point != node
					x = node.x - (quad.point.x)
					y = node.y - (quad.point.y)
					l = Math.sqrt(x * x + y * y)
					minDistance = node.r + quad.point.r + 5
					if l < minDistance
						l = (l - minDistance) / l * .05
						node.x -= x *= l
						node.y -= y *= l
						quad.point.x += x
						quad.point.y += y
				x1 > nx2 or x2 < nx1 or y1 > ny2 or y2 < ny1



	destroy: ->
		super()
