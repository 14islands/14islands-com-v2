###*
#
# Logo animation component.
#
# For SPG Case Study
#
# @author 14islands
#
###

class FOURTEEN.SpgLogoAnimation extends FOURTEEN.ElementScrollVisibility

	constructor: (@$context, data) ->
		@asyncScriptsLoaded = true;

		# init FOURTEEN.ElementScrollVisibility
		super(@$context, data)


	# @protected
	# @override FOURTEEN.ElementScrollVisibility.destroy
	destroy: ->
		super()
		
	# @override FOURTEEN.ElementScrollVisibility.onAnimationPlay
	onEnterViewport: =>
		super()
		@$context.addClass('do-Animate');

	# @override FOURTEEN.ElementScrollVisibility.onExitViewportSync
	onExitViewport: =>
		super()
		# @$context.removeClass('do-Animate');
		