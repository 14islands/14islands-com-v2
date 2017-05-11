# global $, TweenLite, Circ
window.FOURTEEN ?= {}

# Class for all Pjax navigation logic - including scrolling
class FOURTEEN.PjaxNavigation

  @EVENT_ANIMATION_SHOWN: 'pjax-animation:shown'
  @EVENT_HERO_IS_HIDING: 'pjax-animation:hero-is-hiding'
  @EVENT_HERO_IS_VISIBLE: 'pjax-animation:hero-is-visible'

  # body pageId of home page
  HOMEPAGE_ID: 'home'
  hasPjaxClass = false

  # Delay in ms before spinner should show
  SPINNER_DELAY: 650 # default pjax timeout

  constructor: (@navigationSelector, @btnNavLinks, @btnHomeSelector, @contentSelector, @onEndCallback) ->
    @$content = $(@contentSelector)
    @$navigation = $(@navigationSelector)
    @$btnNavLinks = $(@btnNavLinks)
    @$btnHome = $(@btnHomeSelector)
    @$hero = $('.hero')
    @$body = $('body')
    @spinner = new FOURTEEN.Spinner @$body
    @spinnerTimer = null

    @hijack = new FOURTEEN.ScrollHijack()
    @hijack.onScroll = @onScroll
    @hijack.preventDefault = true
    @canSrollToWork = true
    @init()


  init: ->
    @currentPageId = @$body.attr('class').match(/page-(\S*)/)[1]

    if @currentPageId is @HOMEPAGE_ID
      @hijack.enable()
      setTimeout(=>
        @$body.trigger(@constructor.EVENT_HERO_IS_VISIBLE)
      , 0)


    # enable PJAX
    $.pjax.defaults?.timeout = 10000 # we show a spinner so set this to 10s to prevent a full page reload
    $(document).pjax('a', @contentSelector, {
      fragment: @contentSelector
    })

    # bind home link to first transition -> then navigate to home
    # (other wise page jumps to top since home page doesnt have content)
    @$btnHome.on('click', @onNavigateToHome)
    @$btnNavLinks.on('click', @onNavigateToPage)

    # hook up scrolling logic before showing new page
    @$content.on('pjax:send', @onPjaxSend)
    @$content.on('pjax:start', @onPjaxStart)
    @$content.on('pjax:popstate', @onPopState)
    @$content.on('pjax:end', @onPjaxEnd)


  onScroll: (delta) =>
    if (@canSrollToWork and delta < 0)
      @canSrollToWork = false
      $('.js-nav-link-work').click()



  # slides in hero and slides out content
  onNavigateToHome: (e, popState) =>
    e.preventDefault()
    unless @currentPageId is @HOMEPAGE_ID
      @calculateY() # might not have been done before if ladning on subpage
      @showHero()
      url = $(e.currentTarget).attr('href')
      @setPjaxClass()
      @slideOutContent( =>
        unless popState
          # tell pjax to nav to home page
          $.pjax({url: url, container: @contentSelector, fragment: @contentSelector})
      )


  # Triggered before navigating to a main nav page
  onNavigateToPage: (e, popState) =>
    e.preventDefault()
    $link = $(e.currentTarget)
    url = $(e.currentTarget).attr('href')
    pageId = @getPageIdFromUrl(url)
    # prevent transition to same page
    @setPjaxClass()
    unless @currentPageId is pageId
      # tell pjax to nav to page
      $.pjax({url: url, container: @contentSelector, fragment: @contentSelector})


  # handle history event for home page link
  onPopState: (e) =>
    if @getPageIdFromUrl(e.state.url) is @HOMEPAGE_ID
      @onNavigateToHome(e, true)


  setPjaxClass: =>
    ## add class to html element to show pjax has happened
    unless hasPjaxClass
      $('html').addClass('pjax')
      hasPjaxClass = true

  getPageIdFromUrl: (url) ->
    url = url.replace(/http\S*:\/\//, '') # remove protocol
    indexStart = url.indexOf("/")
    indexEnd = url.lastIndexOf("/")

    # must have more than one slash, otherwise must be the root
    unless indexStart is indexEnd
      name = url.slice(indexStart + 1, indexEnd)
      if name and name.length
        return name

    return @HOMEPAGE_ID


  calculateY: =>
    # update position of navigation incase browser was resized since last time
    @yTo = window.innerHeight - @$navigation.outerHeight()


  # only called if actual ajax request is made
  onPjaxSend: (e, xhr, options) =>
    @startSpinnerTimer()


  onPjaxStart: (e, unused, options) =>
    @calculateY()

    # hide hero if we were standing on the home page before navigating
    if @currentPageId is @HOMEPAGE_ID
      #wait 300ms to allow browser to load and paint
      @$body.trigger(@constructor.EVENT_HERO_IS_HIDING)
      setTimeout( =>
        @hideHero()
      , 800)

    # hide content fast when navigating between all other pages
    unless @getPageIdFromUrl(options.url) is @HOMEPAGE_ID
      @hideContent()


  onPjaxEnd: (e, unused, options) =>
    isPoppingHistory = options?.push isnt true

    @cancelSpinner( =>

      # trigger callback first since some components
      # bind to the EVENT_ANIMATION_SHOWN event
      @onEndCallback() if @onEndCallback

      # transition in content for all pages except home
      unless @getPageIdFromUrl(options.url) is @HOMEPAGE_ID
        if @currentPageId is @HOMEPAGE_ID
          # long transition when coming from the home page
          @slideInContent(isPoppingHistory)
        else
          # fast transition between other pages
          @showContent(isPoppingHistory)

      @updateBodyPageId(options)
    )


  updateBodyPageId: (options) =>
    pageId = @getPageIdFromUrl(options.url)
    @$body.removeClass('page-' + @currentPageId)

    if pageId
      @currentPageId = pageId
    else
      @currentPageId = @HOMEPAGE_ID

    @$body.addClass('page-' + @currentPageId)


  startSpinnerTimer: =>
    clearTimeout(@spinnerTimer)
    @spinnerTimer = setTimeout(@showSpinner, @SPINNER_DELAY)


  cancelSpinner: (callback) =>
    clearTimeout(@spinnerTimer)
    @spinner.hide(callback)


  showSpinner: =>
    @spinner.show()


  hideHero: =>
    TweenLite.to(@$hero[0], 0.8,
    {
      y: @yTo * -1
      ease: Circ.easeInOut
      clearProps: 'all'
      onComplete: =>
        @$hero.addClass('hero--hidden')
        @hijack.disable()
    })


  showHero: =>
    # show and prepare hero outside of viewport
    TweenLite.set(@$hero[0], {
      y: @yTo * -1,
    })
    @$hero.removeClass('hero--hidden')

    # transition hero
    TweenLite.fromTo(@$hero[0], 0.6, {
      y: @yTo * -1,
    },
    {
      y: 0
      delay: 0.2
      ease: Circ.easeInOut
      clearProps: 'all',
      onComplete: =>
        @$body.trigger(@constructor.EVENT_HERO_IS_VISIBLE)
        @hijack.enable()
        @canSrollToWork = true
    })

  hideContent: =>
    TweenLite.set(@$content[0], {
      display: 'none'
    })


  slideOutContent: (callback) =>
    # TweenLite.fromTo(@$content[0], 0.8, {
    #   y: 0
    #   display: 'block'
    # },
    # {
    #   y: @yTo
    #   ease: Circ.easeInOut
    #   display: 'none',
    #   clearProps: 'all'
    #   onComplete: callback
    # })
    TweenLite.fromTo(@$content[0], 0.6, {
      y: 0
      opacity: 1
      display: 'block'
    },
    {
      y: @yTo
      opacity: 0
      ease: Circ.easeInOut
      display: 'none',
      onComplete: callback
    })



  # long transition from hero
  slideInContent: (isPoppingHistory) =>
    TweenLite.set(@$content[0], {
      clearProps: 'all',
      display: 'block'
      visibility: 'hidden'
    })

    # only animate top parts for performance
    # UNLESS user is navigating back/forward - then we have to move everything because of scroll history
    $el = if isPoppingHistory then @$content else @$content.find('.pjax-animate')

    TweenLite.fromTo($el, 0.6, {
      # y: 100
      y: @yTo/4
      opacity: 0
      visibility: 'visible'
    },
    {
      y: 0
      opacity: 1
      ease: Expo.easeOut
      delay: 1.1 #0.8 #0.6 #0.1
      clearProps: 'all'
      onComplete: (param) =>
        @$body.trigger @constructor.EVENT_ANIMATION_SHOWN
    })


  # fast content transition between normal pages
  showContent: (isPoppingHistory) =>
    # only animate if user is navigating using links and we know scroll is at top of new page
    if isPoppingHistory
      TweenLite.set(@$content[0], {
        display: 'block'
      })
      @$body.trigger @constructor.EVENT_ANIMATION_SHOWN

    else
      # TweenLite.set(@$content[0], {
      #   display: 'block'
      #   visibility: 'hidden'
      # })

      TweenLite.fromTo(@$content[0], .3, {
        opacity: 0
        display: 'block'
      }, {
        opacity: 1
        display: 'block'
        ease: Power2.easeOut
        onComplete: => @$body.trigger @constructor.EVENT_ANIMATION_SHOWN
      })
      #     @$body.trigger @constructor.EVENT_ANIMATION_SHOWN
      # slide
      # TweenLite.fromTo(@$content.find('.pjax-animate'), 0.5, {
      #   y: @yTo/4
      # },
      # {
      #   y: 0,
      #   ease: Circ.easeOut
      #   clearProps: 'all'
      #   onStart: =>
      #     TweenLite.set(@$content[0], {
      #       visibility: 'visible'
      #     })
      #   onComplete: (param) =>
      #     @$body.trigger @constructor.EVENT_ANIMATION_SHOWN
      # })
