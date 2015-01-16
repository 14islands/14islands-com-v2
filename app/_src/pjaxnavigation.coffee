# global $, TweenLite, Circ
window.FOURTEEN ?= {}

# Class for all Pjax navigation logic - including scrolling
class FOURTEEN.PjaxNavigation

  HOMEPAGE_ID: 'home'

  constructor: (@navigationSelector, @btnHomeSelector, @contentSelector, @onLoadCallback) ->
    @$content = $(@contentSelector)
    @$navigation = $(@navigationSelector)
    @$btnHome = $(@btnHomeSelector)
    @init()


  init: ->
    @$hero = $('.hero')
    @$body = $('body')

    @currentPageId = @$body.attr('class').match(/page-(\S*)/)[1]

    # enable PJAX
    $(document).pjax('a', @contentSelector, {
      fragment: @contentSelector,
      duration: 1000
    })

    # bind home link to first transition -> then navigate to home
    # (other wise page jumps to top since home page doesnt have content)
    @$btnHome.on('click', @onNavigateToHome)

    # hook up scrolling logic before showing new page
    @$content.on('pjax:beforeReplace', @onPjaxBeforeReplace)
    @$content.on('pjax:popstate', @onPopState)
    @$content.on('pjax:end', @onPjaxEnd)
    @$content.on('pjax:end', @onLoadCallback)


  # slides in hero and slides out content
  onNavigateToHome: (e, popState) =>
    e.preventDefault()
    @showHero()
    @slideOutContent( =>
      unless popState
        # tell pjax to nav to home page
        $.pjax({url: '/', container: @contentSelector, fragment: @contentSelector})
    )

  onPopState: (e) =>
    if @getPageIdFromUrl(e.state.url) is @HOMEPAGE_ID
      console.log('POP home page')
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
    console.log('beforeReplace', @currentPageId, '->', @getPageIdFromUrl(options.url));
    @calculateY()

    # hide hero if we were standing on the home page before navigating
    if @currentPageId is @HOMEPAGE_ID
      @hideHero()

    # hide content fast when navigating between all other pages
    unless @getPageIdFromUrl(options.url) is @HOMEPAGE_ID
      @hideContent()


  onPjaxEnd: (e, unused, options) =>
    # transition in content for all pages except home
    unless @getPageIdFromUrl(options.url) is @HOMEPAGE_ID
      if @currentPageId is @HOMEPAGE_ID
        # long transition when coming from the home page
        @slideInContent()
      else
        # fast transition between other pages
        @showContent()

    @updateBodyPageId(options)



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
    console.log('hide content');
    TweenLite.set(@$content[0], {
      display: 'none'
    })


  slideOutContent: (callback) =>
    console.log('slide out content');
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


  updateBodyPageId: (options) =>
    pageId = @getPageIdFromUrl(options.url)
    @$body.removeClass('page-' + @currentPageId)

    if pageId
      @currentPageId = pageId
    else
      @currentPageId = @HOMEPAGE_ID

    console.log('update ID to', @currentPageId)

    @$body.addClass('page-' + @currentPageId)


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
      clearProps: 'all'
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
      clearProps: 'all'
    })

