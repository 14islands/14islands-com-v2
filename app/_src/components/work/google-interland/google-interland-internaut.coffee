###
#
# GoogleInterlandInternaut component.
#
# For Google Interland Case Study
#
# @author 14islands
#
###

class FOURTEEN.GoogleInterlandInternaut extends FOURTEEN.ElementScrollVisibility

	ROTATE_DISTANCE = 0.1 #degrees per frame

	# define async scripts to load
	scripts: [
		'/js/bundles/interland/interland-internaut.min.js'
	]


	constructor: (@$context, data) ->
		super(@$context, data)

		@panoramaHasLoaded_ = false
		@isScrolling_ = false

		@spinner = new FOURTEEN.Spinner @$context, {isBlack: true}
		@spinner.show()


	# @protected
	onReady: ->
		super()

		# we need a global callback for the maps api load event
		FOURTEEN.onInterlandInternautLoaded = @_onInternautLoaded

		# internaut already loaded? init directly
		if FOURTEEN.InterlandInternaut
			@_onInternautLoaded()


	# @private
	_onInternautLoaded: =>
		@spinner.hide(=>
			FOURTEEN.InterlandInternaut.init(@context)
			@onEnterViewport() if @isInViewport
		)

	# @protected
	destroy: ->
		super()
		FOURTEEN.InterlandInternaut.destroy()

	# @protected
	onEnterViewport: =>
		super()
		FOURTEEN.InterlandInternaut?.startRender()

	# @protected
	onFullyEnterViewport: =>
		super()
		FOURTEEN.InterlandInternaut?.triggerAnimation()

	# @protected
	onExitViewport: =>
		super()
		FOURTEEN.InterlandInternaut?.stopRender()
