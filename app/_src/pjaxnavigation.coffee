# global $, TweenLite, Circ, Turbolinks
window.FOURTEEN ?= {}

# Class for all Pjax navigation logic - including scrolling
class FOURTEEN.PjaxNavigation

  DEFAULT_ID: 'home'

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
    @$content.on('pjax:success', @onShowContent)
    @$content.on('pjax:success', @onUpdateBodyPageId)
    @$content.on('pjax:success', @onLoadCallback)


  onUpdateBodyPageId:  (e, text, status, res, xhr, t) =>
    i = xhr.url.lastIndexOf('/')
    pageId = xhr.url.slice(i + 1)

    @$body.removeClass('page-' + @currentPageId)

    if pageId
      @currentPageId = pageId
    else
      @currentPageId = @DEFAULT_ID

    @$body.addClass('page-' + @currentPageId)


  calculateY: =>
    # update position of navigation incase browser was resized since last time
    @yTo = window.innerHeight - @$navigation.outerHeight()


  onHideHero: (e, text, xhr) =>
    @calculateY()

    # only hide hero if we were standing on the home page before navigating
    if @currentPageId is @DEFAULT_ID
      TweenLite.to(@$hero[0], 0.8,
      {
        y: @yTo * -1
        ease: Circ.easeInOut
        clearProps: 'all'
        onComplete: =>
          console.log('hide hero')
          @$hero.addClass('hero--hidden')
      })


  onHideContent: (e, text, xhr) =>
    # hide content, unless we are going back to home page which slides out instead
    unless xhr.url is "/"
      TweenLite.set(@$content[0], {
        display: 'none'
      })


  onShowContent: (e, text, status, res, xhr) =>
    # don't run when going back to home page
    unless xhr.url is "/"
      # long transition when coming from the home page
      if @currentPageId is @DEFAULT_ID
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



  onNavigateToHome: (e, text, status, res, xhr) =>
    e.preventDefault()

    # abort if already on home page
    unless @currentPageId is @DEFAULT_ID
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
