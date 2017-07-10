###
#
# GoogleInterlandShouter component.
#
# For Google Interland Case Study
#
# @author 14islands
#
###

class FOURTEEN.GoogleInterlandShouter extends FOURTEEN.ElementScrollVisibility

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
		FOURTEEN.onInterlandShouterLoaded = @_onInternautLoaded

		# internaut already loaded? init directly
		if FOURTEEN.InterlandShouter
			@_onInternautLoaded()


	# @private
	_onInternautLoaded: =>
		@spinner.hide(=>
			FOURTEEN.InterlandShouter.init(@context)
			@onEnterViewport() if @isInViewport
		)

	# @protected
	destroy: ->
		super()
		@spinner.removeEl()
		FOURTEEN.InterlandShouter.destroy()

	# @protected
	onEnterViewport: =>
		super()
		FOURTEEN.InterlandShouter?.startRender()

	# @protected
	onFullyEnterViewport: =>
		super()
		FOURTEEN.InterlandShouter?.triggerAnimation()

	# @protected
	onExitViewport: =>
		super()
		FOURTEEN.InterlandShouter?.stopRender()
