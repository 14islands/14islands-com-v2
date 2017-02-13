###
  Newsletter Component
###

class FOURTEEN.Newsletter extends FOURTEEN.BaseComponent
	UNSUBSCRIBE_TITLE = '14islands';
	UNSUBSCRIBE_MESSAGE = 'Notifications are now turned off.';
	UNSUBSCRIBE_ICON_PATH = '/android-chrome-192x192.png';
	INPUT_TRANSITION_Y = 10
	INPUT_EASING = Power0.easeOut
	ESC_KEY_CODE = 27

	# @override FOURTEEN.BaseComponent.scripts
	scripts: [
		'https://cdn.onesignal.com/sdks/OneSignalSDK.js'
	]

	constructor: (@$context, @data) ->

		# set defaults
		@hasPushSupport = false
		@showNotfications = false
		@isSubscribedToPush = false

		# get elements
		@$html = $('html')
		@$notifyButton = @$context.find('.newsletter__notify-button')
		@$emailButton = @$context.find('.newsletter__email-button')
		@$emailForm = @$context.find('.newsletter__email-form')
		@$emailInput = @$context.find('.newsletter__email-input')
		@$nameInput = @$context.find('.newsletter__email-name-input')

		# add event listeners
		@$notifyButton.on('click', @onNotifyClick)
		@$emailButton.on('click', @onEmailClick)
		@$context.on('click', (e) =>
			@showNotficationView() if $(e.target).is('.js-component-newsletter') or $(e.target).is('h2')
		)
		$(document).on('keyup', (evt) =>
	    @showNotficationView() if (evt.keyCode == ESC_KEY_CODE)
		);

		# FOURTEEN.BaseComponent()
		super(@$context, @data)

	# Init Push Notifications
	onScriptsLoaded: () =>
		OneSignal = window.OneSignal || []
		@initNotifications()
		@showNotficationsIfSupport()
		@toggleViewIfSubscribed()

	initNotifications: () =>
		OneSignal.push(() =>
			unless @$html.is('.push-loaded')
				OneSignal.setDefaultNotificationUrl('https://14islands.com')
				OneSignal.setDefaultTitle('14islands')
				OneSignal.init({
					appId: '1884f39f-2c71-4eb8-96cb-328eb0811873',
					autoRegister: false,
					allowLocalhostAsSecureOrigin: true,
					safari_web_id: 'web.onesignal.auto.378d36e2-d61e-4d1d-83ad-a561308305e8',
					welcomeNotification: {
						title: '14islands',
						message: 'We will keep you posted!'
					},
					promptOptions: {},
					notifyButton: {
						enable: false # Set to false to hide
					}
				});
				@$html.addClass('push-loaded')
		);

	showNotficationsIfSupport: () =>
		OneSignal.push(() =>
			@hasPushSupport = OneSignal.isPushNotificationsSupported();
			@showNotfications = @hasPushSupport
			if @showNotfications
				@$context.addClass('show-notifications')
				TweenLite.set(@$notifyButton[0], {opacity: 1, y: 0})
				TweenLite.set(@$emailInput[0], {opacity: 0, y: INPUT_TRANSITION_Y})
				TweenLite.set(@$nameInput[0], {opacity: 0, y: INPUT_TRANSITION_Y})
			else
				@$emailInput.focus()
		)

	toggleViewIfSubscribed: () =>
		OneSignal.push(() =>
			OneSignal.isPushNotificationsEnabled().then((isSubscribed) =>
				@isSubscribedToPush = isSubscribed
				@$context.toggleClass('is-subscribed-to-push', @isSubscribedToPush)
			)
			OneSignal.on("subscriptionChange", (isSubscribed) =>
				@isSubscribedToPush = isSubscribed
				@$context.toggleClass('is-subscribed-to-push', @isSubscribedToPush)
			)
		)

	onNotifyClick: (e) =>
		e.preventDefault()
		if @isSubscribedToPush
			new window.Notification(UNSUBSCRIBE_TITLE,{
				body: UNSUBSCRIBE_MESSAGE,
				icon: UNSUBSCRIBE_ICON_PATH
			})
			OneSignal.push(() =>
				OneSignal.setSubscription(false)
			)
		else
			OneSignal.push(() =>
				OneSignal.registerForPushNotifications()
				OneSignal.setSubscription(true)
			)

	onEmailClick: (e) =>
		e.preventDefault()
		if (@showNotfications)
			tl = new TimelineLite();
			tl.call(() =>
				@showNotfications = false
				@$context.removeClass('show-notifications')
			)
			tl.to(@$notifyButton[0], 0.15, {opacity: 0, y: -INPUT_TRANSITION_Y, ease: INPUT_EASING})
			tl.to(@$emailInput[0], 0.15, {opacity: 1, y: 0, ease: INPUT_EASING}, '+0.1')
			tl.call(() =>
				@$emailInput.focus();
			)
			tl.to(@$nameInput[0], .2, {opacity: 1, y: 0, ease: INPUT_EASING})
			tl.play()
		else
			@$emailForm.submit()
			@$emailInput.val('')
			@$nameInput.val('')

	showNotficationView: () =>
		if !@showNotfications and @hasPushSupport
			tl = new TimelineLite()
			tl.call(() =>
				@showNotfications = true
				@$context.addClass('show-notifications')
			)
			tl.to(@$emailInput[0], .15, {opacity: 0, y: INPUT_TRANSITION_Y, ease: INPUT_EASING})
			tl.to(@$nameInput[0], .15, {opacity: 0, y: INPUT_TRANSITION_Y, ease: INPUT_EASING}, '-0.1')
			tl.to(@$notifyButton[0], .15, {opacity: 1, y: 0, ease: INPUT_EASING})
			tl.play()

	destroy: =>
