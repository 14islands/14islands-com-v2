###
	Grid Component

	This component will fix up the grid markup in it's context based on the given model.

	@method
	init()
	- Initializes the header component

	@method
	render()
	- Called when component is visible - if hidden while instanciating

###
class FOURTEEN.Grid

	DEBOUNCE_THRESHOLD = 200

	DATA_NUM_ROWS = 'num-rows'
	DATA_GAP = 'gap'
	DATA_MAP_MODEL = 'map-model'
	DATA_MAP_PATTERN = 'map-pattern'
	DATA_MAP_SIZES = 'map-sizes'
	DATA_IS_REPEATABLE = 'is-repeatable'

	SELECTOR_SPINNER = '.js-spinner'
	SELETOR_CELL_ITEM = '.team-grid__item'
	SELETOR_CELL_APPENDED_ITEM = '.team-grid__item--appended'
	SELECTOR_SPINNER = '.spinner'
	SELECTOR_IMAGES = '.team-grid__image'

	CLASS_CELL_ITEM = 'team-grid__item team-grid__item--appended'
	CLASS_IMG = 'team-grid__image'
	CLASS_ANCHOR = 'team-grid__link'
	CLASS_ANIMATE_ITEM = 'team-grid__item--animate'
	CLASS_SPINNER_INACTIVE = 'spinner--inactive'

	IS_GRID_REPEATABLE = false

	SPINNER_TIMEOUT_MS = 1500

	GRID_CELL_GAP = 0
	GRID_PATTERN = {}

	MODEL = {
		1: [],
		2: []
	}

	numAvailable = {
		rows: 0,
		cols: 0,
		cells: 0
	}

	hasChangedBreakpoint = false
	currentBreakpointKey = null
	debouncedResizeFn = null
	spinnerTimerId = null
	watcher = null
	imagesLoaded = null

	###
	We rely on a DOMModel object
	to proper calculate the grid nodes.
		This will be an array of arrays:
	- First array corresponds the row
	- Second array corresponds the column
		Example:
	[
		 [ 0, 1, 1] row 0
			col 0, col 1, col 2
	]
	DOMModel[0][1] = 1 -> row 0, column 1
	###
	DOMModel = []

	constructor: (@$context) ->
		@context = @$context.get(0)
		@$body = $('body')
		@$spinner = @$context.find( SELECTOR_SPINNER )

		@initializeGrid()
		# @$body.on("pjax:done", @initializeGrid)


	initializeGrid: =>
		# Read our data from the page
		@setGridModel()

		# Check which breakpoint are we working on
		@checkBreakpoint()

		if currentBreakpointKey isnt null

			# Setup the grid on how many cols and rows
			@gridSetup()

			# Go!
			@createGrid()

		# Animate them in only when in viewport
		if Modernizr.touch or
			navigator.msMaxTouchPoints or
			typeof scrollMonitor isnt 'object'
				# Except for mobile...
				@onEnterViewport()
		else
			watcher = scrollMonitor.create( @$context, 500 )
			watcher.recalculateLocation()
			@addWatcherListeners()

	###
		Add watcher event callbacks
	###
	addWatcherListeners: =>
		if watcher isnt null
			watcher.enterViewport @onEnterViewport
			watcher.exitViewport @onExitViewport

	###
		Add event callbacks
	###
	addEventListeners: =>
		# Check if we're not coming back here again
		return if debouncedResizeFn isnt null
		debouncedResizeFn = FOURTEEN.Utils.debounce @onWindowResize, DEBOUNCE_THRESHOLD
		$(window).on 'resize', debouncedResizeFn
		@

	###
		This function detects which breakpoint are we working on now
		See the MQ_BREAKPOINT_X constants defined on the top.

		Depending on the breakpoint we can load a different pattern or sizes.
	###
	checkBreakpoint: () ->

		currentBreakpointKey = null

		for key of GRID_PATTERN

			continue if GRID_PATTERN[key].hasOwnProperty('mq') is false

			# if we have "mq" set and
			# it actually matches our current resolution
			if Modernizr.mq(GRID_PATTERN[key]['mq'])

				currentBreakpointKey = key

				if currentBreakpointKey isnt key and currentBreakpointKey isnt null
					hasChangedBreakpoint = true

				@

	###
		Removes watcher events callbacks
	###
	removeWatcherListeners: () ->
		if watcher isnt null
			watcher.destroy()

	###
		Removes event callbacks
	###
	removeEventListeners: () ->
		$(window).off( 'resize', debouncedResizeFn )


	###

		Callbacks

	####

	###
		Callback for when it's visible on the page view
	###
	onEnterViewport: () =>
		return if @hasBeenShown
		@showGrid()
		@addEventListeners()
		# in case we have resized before all this happened
		@onWindowResize()
		@hasBeenShown = true

	###
		Shows all items when the images have been loaded.
	###
	showGrid: () =>
		return if currentBreakpointKey is null
		spinnerTimerId = setTimeout @showSpinner, SPINNER_TIMEOUT_MS
		$.when( imagesLoaded.getState() ).done =>
			if spinnerTimerId isnt null then @hideSpinner()
			@showItems( @$context.find( SELETOR_CELL_APPENDED_ITEM ) )

	###
		Resets the model to it's initial state
		necessary for when starting over again (like different grid pattern).
	###
	resetDOMModel: () ->
		DOMModel.length = 0

	###
		Re-creates the grid by reseting everything
		and working with it's new pattern and breakpoint
		as defined previously with checkBreakpoint and gridSetup.
	###
	changeGridLayout: () ->
		@$context.empty()
		@resetDOMModel()
		@createGrid()
		@showGrid()
		hasChangedBreakpoint = false

	showSpinner: () =>
		FOURTEEN.Utils.showSpinner @$spinner

	hideSpinner: () =>
		FOURTEEN.Utils.hideSpinner @$spinner

	isUsingRIO: () ->
		typeof ResponsiveIO is 'object'

	###
		Callback for when it's exiting the page view
	###
	onExitViewport: () =>
		if @hasBeenShown then @removeWatcherListeners()

	###
		Callback for when the window is resized
	###
	onWindowResize: () =>

		@checkBreakpoint()

		if currentBreakpointKey is null
			# if we are getting out of a grid
			# at least resize the whole container down to it's normal size
			@updateContextHeight true
			return

		currentNumberOfCols = if DOMModel[0] isnt undefined then DOMModel[0].length else 0
		row = 0

		# Which breakpoint should we base this on
		@gridSetup()

		# First of all, if we have to update positions
		# do that
		if hasChangedBreakpoint
			return @changeGridLayout()

		# Can we add more?
		if numAvailable.cols > currentNumberOfCols

			spinnerTimerId = setTimeout @showSpinner, SPINNER_TIMEOUT_MS

			# Add only the additional ones
			while row < numAvailable.rows
				@addGridCols row, currentNumberOfCols, numAvailable.cols
				row++

			@refreshImages currentNumberOfCols

		@updateContextHeight()

		# Show them
		$.when( imagesLoaded.getState() ).done =>

			if spinnerTimerId isnt null then @hideSpinner()

			# Show only the new ones
			# with "greater than" what we currently have
			@showItems @$context.find(SELETOR_CELL_ITEM + ':gt(' + currentNumberOfCols + ')')

	###
		Goes through the images and call RIO to
		pick them up with refresh.

		@param  {Integer} startColumn From which column should we do this.
	###
	refreshImages: (startColumn) ->
		# return if @isUsingRIO() isnt true

		$images = @$context.find( SELETOR_CELL_APPENDED_ITEM + ' img' )
		_startColumn = startColumn || 0
		i = 0
		imagesLen = $images.length

		$images.slice(_startColumn, imagesLen)

		imagesLoaded = new FOURTEEN.RIOImagesLoaded( $images )

		for i in [0..imagesLen]
			ResponsiveIO.refresh( $images[i] )


	###

		Grid methods

	###


	###
		Creates a <img> tag to be inserted in a parent.

		@param  {Object} item details for the image such as src and alt.
		@return {String}      A fresh new <img> for you.
	###
	createImgTagString: ( item ) ->
		img = ""

		if (!item or
				!item.hasOwnProperty('src') or
				!item.hasOwnProperty('alt'))

			console.warn('Missing src or alt attribute in object.')
			return ""

		if (@isUsingRIO())
			img = '<img class="' + CLASS_IMG + '" data-src="' + decodeURIComponent(item.src) + '" alt="' + item.alt + '" />'
		else
			img = '<img class="' + CLASS_IMG + '" src="' + decodeURIComponent(item.src) + '" alt="' + item.alt + '" />'

		return img

	###
		Creates a <li> tag to be inserted in the grid

		@param  {Object} child Element to be appended into this <li>
		@return {String}       A fresh new <li> in a string format.
	###
	createDivTagString: ( child, type, left, top ) ->
		_child = child || ""
		_style = ""
		_style = 'visibility: hidden;'
		_style += 'top: ' + top + 'px;'
		_style += 'left: ' + left + 'px;'

		if GRID_PATTERN[currentBreakpointKey]['sizes'].hasOwnProperty(type)
			_style += 'width: ' + GRID_PATTERN[currentBreakpointKey]['sizes'][type] + 'px;'
			_style += 'height: ' + GRID_PATTERN[currentBreakpointKey]['sizes'][type] + 'px;'

		return '<div class="' + CLASS_CELL_ITEM + '" style="' + _style + '">' + _child + '</div>'

	###
		Creates a <a> tag to be inserted in it's <li> parent

		@param  {Object} item  item with link information
		@return {String}       child item that will be appended in this anchor.
	###
	createAnchorTagString: ( item, child ) ->
		href = item.href || '#'
		return '<a class="' + CLASS_ANCHOR + '" href="' + href + '" target="_blank">' + child + '</a>'

	###
		Creates the whole grid.
	###
	createGrid: () ->
		@addGridRows()
		@updateContextHeight()
		@refreshImages()

	###
		Creates the rows of the grid.
	###
	addGridRows: (start, end) =>
		_start = start || 0
		_end = end || numAvailable.rows
		row = _start

		while row < _end
			@addGridCols row
			row++

	###
		Updates the container (context) height
		based on number of rows
		or just reset it if passed true as an argument

		@param {Boolean} reset If we are resetting the containers height
	###
	updateContextHeight: (reset) =>
		if reset is true
			@$context.height 'auto'
		else
			@$context.height numAvailable.rows * (@getCellHeight('1') + GRID_CELL_GAP)

	###
		Creates the cols of the grid.

		@param  {Integer} rowIndex Which row are we in the grid.
		@param  {Integer} start From which column index should we start creating.
		@param  {Integer} end To which column index should we stop creating.
	###
	addGridCols: ( row, start, end ) ->
		type = null
		strItems = ""
		_start = start || 0
		_end = end || numAvailable.cols
		col = _start

		while col < _end

			type = @getItemType( col, row )

			if (!DOMModel[row])
				DOMModel.push( [] )

			# Save a copy of how our DOM is looking like
			DOMModel[row][col] = type

			# Call the creation
			strItems += @addGridCell( type, col, row )

			col++

		@$context.append( strItems )

	###
		Returns a type of item e.g 1 or 2

		@param  {Integer} The type number for this item.
	###
	getItemType: (col, row) ->

		# Don't let it extrapolate our modal length
		# just to find out the type number
		colMod = col % GRID_PATTERN[currentBreakpointKey]['types'][row].length

		# Find out it's type
		return GRID_PATTERN[currentBreakpointKey]['types'][row][colMod]


	isUnrepetableItem: (item) ->
		return false if item.hasOwnProperty('unrepeatable') isnt true
		JSON.parse item.unrepeatable

	###
		Gets an individual item from the model.

		@param  {Integer} type type of element to be returned. Eg. 1
		@return {Object}      element from the model
	###
	getItem: ( type ) ->

		item = false

		if ( type and
				MODEL.hasOwnProperty( type ) and
				MODEL[ type ] and
				MODEL[ type ].length > 0 )

			item = MODEL[ type ].shift()

			# Add it back to the end
			# if it's repeatable
			if IS_GRID_REPEATABLE and @isUnrepetableItem(item) isnt true
				MODEL[ type ].push item

		return item

	###
		Creates an individual cell for the grid.

		@param  {Integer} rowIndex Which row index are we in the grid.
		@param  {Integer} colIndex Which column index are we in the grid.
	###
	addGridCell: ( type, col, row ) ->
		item = null
		anchor = ""
		img = ""
		x = 0
		y = 0

		# Blanks are just dummies, no need to create anything
		# return empty string to concatenate
		return "" if (type is 0)

		item = @getItem type

		if item

			img = @createImgTagString item

			if item.hasOwnProperty('href')
				anchor = @createAnchorTagString item, img

		x = @calculateX col, row
		y = @calculateY row

		if anchor
			return @createDivTagString anchor, type, x, y
		else
			return @createDivTagString img, type, x, y

	###
		Calculates the X axis that the cell should be in,
		based on the it's column and row position numbers.

		@param  {Integer} col column number e.g 0-9.
		@param  {Integer} row row number e.g 0-9.
		@return {Integer}     The total X to be used in pixels.
	###
	calculateX: ( col, row ) ->
		totalX = 0
		previousCols = null
		numPreviousCols = null
		previousType = 0
		currentType = 0
		i = 0

		# First column should always be at 0px
		return 0 if col is 0

		# Get all columns until this one
		previousCols = DOMModel[row].slice(0, col)
		numPreviousCols = previousCols.length

		while i < numPreviousCols

			currentType = previousCols[i]
			previousType = previousCols[i - 1]

			i += 1

			# we want to skip this
			# if it's a blank followed by a 2x2
			continue if (currentType is 0 and previousType is 2)

			totalX += @getCellWidth(currentType) + GRID_CELL_GAP

		return totalX

	###
		Calculates the Y axis that the cell should be in,
		based on the smallest size and it's gap.

		@param  {Integer} row row number e.g 0-9.
		@return {Integer}     The total Y to be used in pixels.
	###
	calculateY: ( row ) ->
		return (@getCellHeight('1') + GRID_CELL_GAP) * row

	###
		Returns the width of a given type of cell.

		@param  {Integer} type type of the cell e.g 1
		@return {Integer}      width number in pixels
	###
	getCellWidth: ( type ) ->
		return @getSizeValue(type, 'w')

	###
		Returns the height of a given type of cell.

		@param  {Integer} type type of the cell e.g 1
		@return {Integer}      height number in pixels
	###
	getCellHeight: ( type ) ->
		return @getSizeValue(type, 'h')

	###
		This function allows more flexibility on how the
		grid cell sizes are defined.
		See grid-model.js for more details.

		@param  {Integer} type type of cell e.g 1
		@param  {String}  key  a valid object key from grid-model or none
		@return {Integer}      It's value (width or height)
	###
	getSizeValue: ( type, key ) =>
		value = 0

		if (typeof GRID_PATTERN[currentBreakpointKey]['sizes'][type] is 'object' and
				GRID_PATTERN[currentBreakpointKey]['sizes'][type].hasOwnProperty(key))

			value = GRID_PATTERN[currentBreakpointKey]['sizes'][type][key]

		else

			value = GRID_PATTERN[currentBreakpointKey]['sizes'][type]

		return parseInt( value, 10 )

	###
		Shows a group of items by calling show on each of them.
	###
	showItems: ( $items ) ->
		numItems = $items.length
		i = 0

		while i < numItems
			@showItem $items.eq( i )
			i++

	###
		Shows an item by setting an active class.

		@param  {Object} $item jQuery element with the element to display.
	###
	showItem: ( $item ) ->

		if ($item.length is 0 or
				typeof $item isnt "object")

			throw new Error('showItem: Object missing to display')

		delay = FOURTEEN.Utils.getRoundUp( FOURTEEN.Utils.getRandomNumber(100, 400) )

		# Prepare
		$item
			.css('visibility', 'visible')

		# Animate
		setTimeout ->
			$item
				.addClass( CLASS_ANIMATE_ITEM )
				.css( Modernizr.prefixed('transitionDelay'), delay + 'ms' )
		, 50

		@

	###
		Setups the grid by finding out information
		on how many elements we can have in this available width.
	###
	gridSetup: () =>

		if GRID_PATTERN.hasOwnProperty(currentBreakpointKey) is false
			throw new Error('GRID_PATTERN doesn\'t have the given ' + currentBreakpointKey + ' key or is empty.')

		# How much space do we have to work with
		totalAvailableWidth = @$context.outerWidth()

		# How many rows are desired
		numAvailable.rows = GRID_PATTERN[currentBreakpointKey]['types'].length

		# How many cols we can fit
		# We base how many cols we can have with the smallest square size = 1
		numAvailable.cols = Math.ceil( totalAvailableWidth / @getCellWidth('1') )
		numAvailable.cells = numAvailable.cols * numAvailable.rows

	###
		Reads our data from the HTML
		given it's keys.
	###
	setGridModel: () =>
		patternKey = @$context.data( DATA_MAP_PATTERN )
		cellSizesKey = @$context.data( DATA_MAP_SIZES )
		modelKey = @$context.data( DATA_MAP_MODEL )

		# Set our gap
		GRID_CELL_GAP = @$context.data( DATA_GAP ) || 0

		IS_GRID_REPEATABLE = parseInt( @$context.data( DATA_IS_REPEATABLE ), 10 ) || 1

		GRID_PATTERN = @getObjFromKey patternKey
		MODEL = @getObjFromKey modelKey

	getObjFromKey: (key) =>
		if ( !key )
			throw new Error('Model missing for the grid ' + @$context)
		else
			if (FOURTEEN.hasOwnProperty(key) is false)
				throw new Error('Key for the model is incorrect: ' + key)
			else
				return FOURTEEN[ key ]
		return false