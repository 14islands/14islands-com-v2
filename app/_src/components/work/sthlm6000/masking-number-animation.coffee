###*
#
# MaskingNumberAnimation animation component.
#
# For Sthlm6000 Case Study
#
# @author 14islands
#
###

class FOURTEEN.MaskingNumberAnimation extends FOURTEEN.ElementScrollVisibility

	DURATION = 2000


	constructor: (@$context, data) ->
		@$cover            = @$context.find('.js-cover')
		@$content          = @$context.find('.js-cover-content')
		@$numbers          = @$context.find('.js-number')

		@transformProp     = Modernizr.prefixed('transform')

		@targetValue      = 3030
		@maxValue         = 6000
		@targetPercentage  = 100 - (@targetValue / @maxValue) * 100

		@resetAnimation_()

		# init FOURTEEN.ElementScrollVisibility
		super(@$context, data)

	# @protected
	# @override FOURTEEN.ElementScrollVisibility.destroy
	destroy: ->
		super()
		cancelAnimationFrame(@nextFrame)

	# @private
	runAnimation_: =>
		@animationStarted = Date.now()
		@moveCover_(@targetPercentage)
		@animateNumbers_()

	# @private
	resetAnimation_: =>
		cancelAnimationFrame(@nextFrame)
		@animationStarted = -1
		@moveCover_(100)
		@currentValue = -1
		@updateNumber_(0)

	# @private
	moveCover_: (percentage) ->
		if Modernizr.csstransforms3d
			@$cover.css @transformProp, 'translate3d(-' + percentage + '%, 0, 0)'
			@$content.css @transformProp, 'translate3d(' + percentage + '%, 0, 0)'

		else
			@$cover.css @transformProp, 'translateX(-' + percentage + '%)'
			@$content.css @transformProp, 'translateX(' + percentage + '%)'

		return # prevent array return

	# @private
	timeElapsed_: =>
		return Math.min(DURATION, Date.now() - @animationStarted)

	# @private
	updateNumber_: (newValue) ->
		if newValue > @currentValue
			@currentValue = newValue
			@$numbers.html(@currentValue)

	# @private
	# Animation frame
	animateNumbers_: =>
		@nextFrame = requestAnimationFrame(@animateNumbers_) if @currentValue < @targetValue
		newValue = Math.round(FOURTEEN.Easing.easeInOutCirc(@timeElapsed_(), 0, @targetValue, DURATION))
		@updateNumber_(newValue)

	# @protected
	# @override FOURTEEN.ElementScrollVisibility.onAnimationPlay
	onAnimationPlay: =>
		super()
		@runAnimation_()

	# @protected
	# @override FOURTEEN.ElementScrollVisibility.onAnimationReset
	onAnimationReset: =>
		super()
		@resetAnimation_()
