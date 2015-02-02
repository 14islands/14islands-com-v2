# global $, TweenLite, Circ
window.FOURTEEN ?= {}

# Class for all Pjax navigation logic - including scrolling
class FOURTEEN.PjaxNavigation

  @EVENT_ANIMATION_SHOWN: 'pjax-animation:shown'

  # body pageId of home page
  HOMEPAGE_ID: 'home'

  # Delay in ms before spinner should show
  SPINNER_DELAY: 500

  constructor: (@navigationSelector, @btnNavLinks, @btnHomeSelector, @contentSelector, @onEndCallback) ->
    @$content = $(@contentSelector)
    @$navigation = $(@navigationSelector)
    @$btnNavLinks = $(@btnNavLinks)
    @$btnHome = $(@btnHomeSelector)
    @$hero = $('.hero')
    @$body = $('body')
    @$spinner = $('<div class="spinner spinner--center"></div>')
    @spinnerTimer = null
    @init()

  init: ->
    @currentPageId = @$body.attr('class').match(/page-(\S*)/)[1]

    # enable PJAX
    $(document).pjax('a', @contentSelector, {
      fragment: @contentSelector
    })

    # bind home link to first transition -> then navigate to home
    # (other wise page jumps to top since home page doesnt have content)
    @$btnHome.on('click', @onNavigateToHome)
    @$btnNavLinks.on('click', @onNavigateToPage)

    # hook up scrolling logic before showing new page
    @$content.on('pjax:beforeReplace', @onPjaxBeforeReplace)
    @$content.on('pjax:popstate', @onPopState)
    @$content.on('pjax:end', @onPjaxEnd)
    @$content.on('pjax:end', @onEndCallback)


  # slides in hero and slides out content
  onNavigateToHome: (e, popState) =>
    e.preventDefault()
    unless @currentPageId is @HOMEPAGE_ID
      @calculateY() # might not have been done before if ladning on subpage
      @showHero()
      @slideOutContent( =>
        unless popState
          # tell pjax to nav to home page
          $.pjax({url: '/', container: @contentSelector, fragment: @contentSelector})
      )


  # Triggered before navigating to a main nav page
  onNavigateToPage: (e, popState) =>
    e.preventDefault()
    $link = $(e.currentTarget)
    url = $(e.currentTarget).attr('href')
    pageId = @getPageIdFromUrl(url)
    # prevent transition to same page
    unless @currentPageId is pageId
      # tell pjax to nav to page
      $.pjax({url: "/#{pageId}", container: @contentSelector, fragment: @contentSelector})


  # handle history event for home page link
  onPopState: (e) =>
    if @getPageIdFromUrl(e.state.url) is @HOMEPAGE_ID
      @onNavigateToHome(e, true)


  getPageIdFromUrl: (url) ->
    index = url.lastIndexOf("/")
    name = url.slice(index + 1)
    if name and name.length
      return name
    return @HOMEPAGE_ID


  calculateY: =>
    # update position of navigation incase browser was resized since last time
    @yTo = window.innerHeight - @$navigation.outerHeight()


  onPjaxBeforeReplace: (e, contents, options) =>
    @calculateY()

    # hide hero if we were standing on the home page before navigating
    if @currentPageId is @HOMEPAGE_ID
      @hideHero()

    # hide content fast when navigating between all other pages
    unless @getPageIdFromUrl(options.url) is @HOMEPAGE_ID
      @hideContent()

    @startSpinnerTimer()


  onPjaxEnd: (e, unused, options) =>
    @cancelSpinner()
    # transition in content for all pages except home
    unless @getPageIdFromUrl(options.url) is @HOMEPAGE_ID
      if @currentPageId is @HOMEPAGE_ID
        # long transition when coming from the home page
        @slideInContent()
      else
        # fast transition between other pages
        @showContent()
    @updateBodyPageId(options)


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


  cancelSpinner: =>
    clearTimeout(@spinnerTimer)
    @$spinner.remove()


  showSpinner: =>
    @$content.append(@$spinner)


  hideHero: =>
    TweenLite.to(@$hero[0], 0.8,
    {
      y: @yTo * -1
      ease: Circ.easeInOut
      clearProps: 'all'
      onComplete: =>
        @$hero.addClass('hero--hidden')
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
      clearProps: 'all'
    })


  hideContent: =>
    TweenLite.set(@$content[0], {
      display: 'none'
    })


  slideOutContent: (callback) =>
    TweenLite.fromTo(@$content[0], 0.8, {
      y: 0
      display: 'block'
    },
    {
      y: @yTo
      ease: Circ.easeInOut
      display: 'none',
      onComplete: callback
    })


  # long transition from hero
  slideInContent: =>
    TweenLite.fromTo(@$content[0], 0.8, {
      y: @yTo
      display: 'block'
    },
    {
      y: 0
      ease: Circ.easeInOut
      delay: 0.1
      clearProps: 'all',
      onComplete: (param) =>
        @$body.trigger @constructor.EVENT_ANIMATION_SHOWN
    })


  # fast content transition between normal pages
  showContent: =>
    TweenLite.fromTo(@$content[0], 0.5, {
      y: @yTo/3
      opacity: 0
      display: 'block'
    },
    {
      y: 0,
      opacity: 1
      ease: Circ.easeOut
      clearProps: 'all',
      onComplete: (param) =>
        @$body.trigger @constructor.EVENT_ANIMATION_SHOWN
    })
