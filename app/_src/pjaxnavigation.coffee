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
    @$content.on('pjax:beforeReplace', @onBeforeReplace)
    @$content.on('pjax:success', @onScrollToNavigation)
    @$content.on('pjax:success', @onUpdateBodyPageId)
    @$content.on('pjax:success', @onLoadCallback)


  showHero: =>
    @onBeforeReplace()
    @$hero.removeClass('hero--hidden');
    TweenLite.set(window, {
      scrollTo: {y: @yTo}
    })


  hideHero: =>
    @$hero.addClass('hero--hidden');
    TweenLite.set(window, {
      scrollTo: {y: 0}
    })
    # window.scrollTo(0,0)


  onUpdateBodyPageId:  (e, text, status, res, xhr, t) =>
    i = xhr.url.lastIndexOf('/')
    pageId = xhr.url.slice(i + 1)

    @$body.removeClass('page-' + @currentPageId);

    if pageId
      @currentPageId = pageId
    else
      @currentPageId = @DEFAULT_ID

    @$body.addClass('page-' + @currentPageId);


  onBeforeReplace: =>
    # always scroll from current scroll position before replacing content below
    @yFrom = document.body.scrollTop
    # update position of navigation incase browser was resized since last time
    @yTo = window.innerHeight - @$navigation.outerHeight()


  onScrollToNavigation: (e, text, status, res, xhr, t) =>
    # don't scroll when going back to home page
    unless xhr.url is "/"
      @yTo = 0 if @$hero.hasClass('hero--hidden')

      TweenLite.fromTo(window, 0.6, {
        scrollTo: {y: @yFrom}
      },
      {
        scrollTo: {y: @yTo}
        ease: Circ.easeInOut
        onComplete: =>
          @hideHero()
      })


  onNavigateToHome: (e) =>
    e.preventDefault()

    @showHero()

    TweenLite.to(window, 0.6, {
      scrollTo: {y: 0}
      ease: Circ.easeInOut
      onComplete: =>
        # tell pjax to nav to home page
        $.pjax({url: '/', container: @contentSelector, fragment: @contentSelector})
    })
