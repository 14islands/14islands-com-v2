###
#
# CSAboutChart component.
#
# For STHLM6000 Case Study
#
# @author 14islands
#
###

class FOURTEEN.SthlmAboutChart extends FOURTEEN.ElementScrollVisibility

	DURATION_NUMBER_MS = 1000
	READY_CLASS = 'js-ready'
	DONUT_SVG_SELECTOR = '#js-sthlm6000-donut-svg'
	STATS_NUMBERS_SELECTOR = '.js-sthlm6000-stats-number'
	TOTAL_NUMBERS = 0
	DATA_NUM = 'num'
	COLORS = ['#8bffb8', '#36ffa1', '#00e587', '#ffffff']
	WIDTH = 538
	HEIGHT = 538
	OUTER_RADIUS = 268
	INNER_RADIUS = 92


	scripts: [
		'http://cdn.rawgit.com/mbostock/d3/v3.5.5/d3.min.js',
		'http://cdn.rawgit.com/tweenjs/tween.js/r14/build/tween.min.js'
	]

	constructor: (@$context, data) ->
		# calls FOURTEEN.ElementScrollVisibility()
		super(@$context, data)
		@spinner = new FOURTEEN.Spinner @$context, {isWhite: true}
		@spinner.show()
		@reset()


	 # @override FOURTEEN.ElementScrollVisibility.onScriptsLoadedSync
	onScriptsLoadedSync: =>
		# hide spinner immediately when loaded to avoid race condition with run()
		@spinner.hideImmediate()
		@init()

	# @override FOURTEEN.ElementScrollVisibility.onFullyEnterViewportSync
	onFullyEnterViewportSync: =>
		@run()

	# @override FOURTEEN.ElementScrollVisibility.onExitViewportSync
	onExitViewportSync: =>
		@reset()
		@init() # prepare for entering viewport again

	destroy: () =>
		super()
		@$context.removeClass READY_CLASS
		@reset()
		@spinner.hide()

	reset: () =>
		cancelAnimationFrame(@nextFrame)
		@nextFrame = undefined
		@numbers = []
		@numbersTweens = []
		@paths = []

		grandTotal = 0

		# remove all tweens that might still be running
		if TWEEN?
			TWEEN.removeAll()

		for $number in @$context.find(STATS_NUMBERS_SELECTOR)
			$number = jQuery($number)
			$number.text(0)
			@numbers.push
				$el: $number,
				value: parseInt($number.data(DATA_NUM), 10)
			grandTotal += parseInt($number.data(DATA_NUM), 10)

		# Last one is just padding
		@numbers.push
			$el: null
			value: 6000 - grandTotal

		TOTAL_NUMBERS = @numbers.length - 1

		if @svg isnt null
			jQuery(DONUT_SVG_SELECTOR).empty()
			@svg = null

	run: () =>
		# Play number tweens one by one
		for tween, i in @numbersTweens
			tween.delay( i * DURATION_NUMBER_MS ).start()

		# Play the arcs
		@playArcsTweens()

		# Keep looping for the number tweens
		@requestTick()
		@

	requestTick: (time) =>
		# keep looping as long as there are still tweens running
		@nextFrame = requestAnimationFrame @requestTick if TWEEN?.getAll()?.length
		TWEEN.update()
		@

	getTotal: (index) =>
		@numbers[index].value

	numberTween: (index) =>
		$number = @numbers[index].$el
		value = @getTotal index

		tween = new TWEEN.Tween(n: 0)
			.to( n: @numbers[index].value, DURATION_NUMBER_MS )
			.easing( TWEEN.Easing.Quadratic.Out )
			.onUpdate ->
				$number.text Math.round this.n
				@

		tween

	playArcsTweens: () =>
		# play the arcs
		@arcGroups
			.append("path")
			.style("fill", (d,i) => COLORS[i])
			.transition()
			.ease('quad-out')
			.delay( (d,i) -> i * DURATION_NUMBER_MS )
			.duration(DURATION_NUMBER_MS)
			.attrTween('d', @arcTween)
		@

	###*
	 * Number tweens that will update
	 * on display.
	###
	createNumberTweens: () =>
		for i in [0..TOTAL_NUMBERS]
			if @numbers[i].$el isnt null
				@numbersTweens.push(@numberTween(i))

	###*
	 * Interpolates the 'd' attribute
	 * to update its angle based on its value.
	###
	arcTween: (d) =>
		i = d3.interpolate d.startAngle, d.endAngle
		(t) =>
			d.endAngle = i(t)
			@outerArcRef d

	###*
	 * Draws the svg groups
	 * and prepare the arcs.
	###
	initSvg: () =>
		@svg = d3.select(DONUT_SVG_SELECTOR)

		# Our doughnut pie chart
		# we associate the path d attribute with our
		# "value" specified in the model
		@pie = d3.layout.pie()
			.sort(null)
			.startAngle(0)
			.endAngle(2 * Math.PI)
			.value (d) -> d.value

		# Outer arc reference to calculate angles later
		@outerArcRef = d3.svg.arc()
			.innerRadius(INNER_RADIUS)
			.outerRadius(OUTER_RADIUS - 10)

		# Main group with white background
		@mainGroup = @svg
			.append("g")
			.attr("transform", "translate(" + WIDTH / 2 + "," + HEIGHT / 2 + ")")
			.append('path')
			.datum({startAngle: 0, endAngle: 2 * Math.PI})
			.style('fill', '#ffffff')
			.attr('d', @outerArcRef)
			.attr('stroke', '#ffffff')
			.attr('stroke-width', '10')

		# Prepare the arcs based on the pie data
		@arcGroups = @svg.selectAll(".arc")
			.data(@pie(@numbers))
			.enter()
			.append("g")
			.attr("transform", "translate(" + WIDTH / 2 + "," + HEIGHT / 2 + ")")
			.attr("class", "arc");

	init: () =>
		@initSvg()
		@createNumberTweens()
		@$context.addClass READY_CLASS
		@
