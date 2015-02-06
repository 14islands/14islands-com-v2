# global $, TweenLite, Circ
window.FOURTEEN ?= {}

# Class for all Pjax navigation logic - including scrolling
class FOURTEEN.PjaxNavigation

  @EVENT_ANIMATION_SHOWN: 'pjax-animation:shown'
  @SPINNER_HTML: '
  <div class="spinner spinner--center">
    <svg viewBox="195.9 88.8 109 55.5">
      <g class="down" opacity="0.4">
        <polygon fill="#F8B334" points="234.5,117.3 261.7,144.3 278,139.2 283.6,133.9 287.1,141.3 298.2,131 301.8,128.8 304.9,117.3
          "/>
        <polygon fill="#F8B334" points="224.8,117.3 224.1,119.5 219.1,124.9 215.1,121.8 215.1,126.9 209,128.9 197,117.3   "/>
        <polygon fill="#F17E0B" points="197,117.3 195.9,117.3 198.5,122.3 202.3,122.3   "/>
        <polygon fill="#F17E0B" points="215.1,126.9 215.1,121.8 219.1,124.9 218,126.2   "/>
        <polygon fill="#F17E0B" points="234.5,117.3 232.4,117.3 237.5,131.9 247.2,129.9   "/>
        <polygon fill="#F17E0B" points="278,139.2 283.6,133.9 287.1,141.3   "/>
      </g>
      <g class="down">
        <polygon fill="#F8B334" points="234.5,115.7 261.7,88.8 278,94.1 283.6,99.4 287.1,92 298.2,102.3 301.8,104.4 304.9,115.7   "/>
        <polygon fill="#F8B334" points="224.8,115.7 224.1,113.7 219.1,108.3 215.1,111.5 215.1,106.5 209,104.2 197,115.7   "/>
        <polygon fill="#F17E0B" points="197,115.7 195.9,115.7 198.5,110.3 202.7,110.3   "/>
        <polygon fill="#F17E0B" points="215.1,106.5 215.1,111.5 219.1,108.3 218,107.1   "/>
        <polygon fill="#F17E0B" points="234.5,115.7 232.4,115.7 237.5,101.3 247.2,103.2   "/>
        <polygon fill="#F17E0B" points="278,94 283.6,99.4 287.1,92  "/>
      </g>
    </svg>
  </div>
  '

  # body pageId of home page
  HOMEPAGE_ID: 'home'

  # Delay in ms before spinner should show
  SPINNER_DELAY: 650 # default pjax timeout

  constructor: (@navigationSelector, @btnNavLinks, @btnHomeSelector, @contentSelector, @onEndCallback) ->
    @$content = $(@contentSelector)
    @$navigation = $(@navigationSelector)
    @$btnNavLinks = $(@btnNavLinks)
    @$btnHome = $(@btnHomeSelector)
    @$hero = $('.hero')
    @$body = $('body')
    @$spinner = $(@constructor.SPINNER_HTML)
    @spinnerTimer = null
    @init()

  init: ->
    @currentPageId = @$body.attr('class').match(/page-(\S*)/)[1]

    # enable PJAX
    $.pjax.defaults.timeout = 10000 # we show a spinner so set this to 10s to prevent a full page reload
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
    @$content.on('pjax:end', @onEndCallback)


  # slides in hero and slides out content
  onNavigateToHome: (e, popState) =>
    e.preventDefault()
    unless @currentPageId is @HOMEPAGE_ID
      @calculateY() # might not have been done before if ladning on subpage
      @showHero()
      url = $(e.currentTarget).attr('href')
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
    unless @currentPageId is pageId
      # tell pjax to nav to page
      $.pjax({url: url, container: @contentSelector, fragment: @contentSelector})


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


  # only called if actual ajax request is made
  onPjaxSend: (e, xhr, options) =>
    @startSpinnerTimer()


  onPjaxStart: (e, unused, options) =>
    @calculateY()

    # hide hero if we were standing on the home page before navigating
    if @currentPageId is @HOMEPAGE_ID
      @hideHero()

    # hide content fast when navigating between all other pages
    unless @getPageIdFromUrl(options.url) is @HOMEPAGE_ID
      @hideContent()


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
    @$content.after(@$spinner)


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
    TweenLite.set(@$content[0], {
      display: 'block'
      clearProps: 'all'
    })

    TweenLite.fromTo(@$content.find('.pjax-animate'), 0.8, {
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
    TweenLite.set(@$content[0], {
      display: 'block'
      clearProps: 'all'
    })

    # slide
    TweenLite.fromTo(@$content.find('.pjax-animate'), 0.5, {
      y: @yTo/3
      #opacity: 0
      display: 'block'
    },
    {
      y: 0,
      #opacity: 1
      ease: Circ.easeOut
      clearProps: 'all',
      onComplete: (param) =>
        @$body.trigger @constructor.EVENT_ANIMATION_SHOWN
    })
