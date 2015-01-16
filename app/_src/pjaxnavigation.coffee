# global $, TweenLite, Circ, Turbolinks
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
      fragment: @contentSelector
    })

    # bind home link to first scroll up -> then navigate to home
    # (other wise page jumps to top since home page doesnt have content)
    @$btnHome.on('click', @onNavigateToHome)

    # hook up scrolling logic before showing new page
    @$content.on('pjax:beforeReplace', @onHideHero)
    @$content.on('pjax:beforeReplace', @onHideContent)
    @$content.on('pjax:end', @onShowContent)
    @$content.on('pjax:end', @onUpdateBodyPageId)
    @$content.on('pjax:end', @onLoadCallback)
    @$content.on('pjax:popstate', @onPopState)


  getPageIdFromUrl: (url) ->
    index = url.lastIndexOf("/")
    name = url.slice(index + 1)
    if name and name.length
      return name
    return @HOMEPAGE_ID

    # listen to popstate to know when to show hero
  onPopState: (e) =>
    if @getPageIdFromUrl(e.state.url) is @HOMEPAGE_ID
      console.log('POP home page')
      @onNavigateToHome(e, true)


  calculateY: =>
    # update position of navigation incase browser was resized since last time
    @yTo = window.innerHeight - @$navigation.outerHeight()


  onHideHero: (e, contents, options) =>
    @calculateY()

    # only hide hero if we were standing on the home page before navigating
    if @currentPageId is @HOMEPAGE_ID
      TweenLite.to(@$hero[0], 0.8,
      {
        y: @yTo * -1
        ease: Circ.easeInOut
        clearProps: 'all'
        onComplete: =>
          @$hero.addClass('hero--hidden')
      })
    else if @getPageIdFromUrl(options.url) is @HOMEPAGE_ID
      console.log('show homepage !!!!!')


  onHideContent: (e, contents, options) =>
    # hide content, unless we are going back to home page which slides out instead
    unless @getPageIdFromUrl(options.url) is @HOMEPAGE_ID
      TweenLite.set(@$content[0], {
        display: 'none'
      })


  onUpdateBodyPageId: (e, unused, options) =>
    pageId = @getPageIdFromUrl(options.url)
    @$body.removeClass('page-' + @currentPageId)

    if pageId
      @currentPageId = pageId
    else
      @currentPageId = @HOMEPAGE_ID

    @$body.addClass('page-' + @currentPageId)


  onShowContent: (e, unused, options) =>
    # don't run when going back to home page
    unless @getPageIdFromUrl(options.url) is @HOMEPAGE_ID
      # long transition when coming from the home page
      if @currentPageId is @HOMEPAGE_ID
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
      else
        # short transition when moving between pages
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


  onNavigateToHome: (e, popState) =>
    e.preventDefault()

    # abort if already on home page
    unless @currentPageId is @HOMEPAGE_ID
      @calculateY()

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
        onComplete: =>
          unless popState
            # tell pjax to nav to home page
            $.pjax({url: '/', container: @contentSelector, fragment: @contentSelector})
      })

      # transition content
      TweenLite.fromTo(@$content[0], 0.8, {
        y: 0
      },
      {
        y: @yTo
        ease: Circ.easeInOut
        display: 'none'
      })
