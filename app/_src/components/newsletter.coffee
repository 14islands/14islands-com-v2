###
  Newsletter Component
###

class FOURTEEN.Newsletter extends FOURTEEN.BaseComponent

	constructor: (@$context, @data) ->
		@$emailButton = @$context.find('.newsletter__email-button')
		@$emailForm = @$context.find('.newsletter__email-form')

		@$emailInput = @$context.find('.newsletter__email-input')
		@$nameInput = @$context.find('.newsletter__email-name-input')

		@$emailButton.on('click', @onEmailClick)

		@$emailInput.focus()

		# FOURTEEN.BaseComponent()
		super(@$context, @data)

	onEmailClick: (e) =>
		e.preventDefault()
		@$emailForm.submit()

	destroy: =>
