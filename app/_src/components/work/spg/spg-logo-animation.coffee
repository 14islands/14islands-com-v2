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
		# init FOURTEEN.ElementScrollVisibility
		super(@$context, data)


	# @override FOURTEEN.ElementScrollVisibility.onAnimationPlay
	onAnimationPlay: =>
		super()
		@$context.addClass('do-Animate');

	# @override FOURTEEN.ElementScrollVisibility.onAnimationReset
	onAnimationReset: =>
		super()
		@$context.removeClass('do-Animate');
		
	# @protected
	# @override FOURTEEN.ElementScrollVisibility.destroy
	destroy: ->
		super()
		