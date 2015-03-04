###
#
# Base Component
#
# How to use:
#   1. Extend this class using 'extends' keyword in coffeescript
#   2. Init this parent class in the constructor:
#
#       constructor: (@$context, data) ->
#         super(@$context, data)
#
#   3. override onReady() in subclass to be notified when component is ready to do work (after pjax animation)
#
#
# How to load 3rd party scripts async:
#   1. Override the 'scripts' prototype array with string of each script to load
#   2. Override the onAsyncScriptsLoaded() callback to be notified when all scripts have loaded (always happens after onReady())
#
# @author 14islands
#
###

class FOURTEEN.BaseComponent

  numberOfScriptsLoaded_: 0

  # override with all resources that should be loaded async
  scripts: []

  constructor: (@$context, data) ->
    @$body = $('body')

    # Shared functionality - wait for pjax animation before running init
    if data?.isPjax
      # wait for animation to be done before loading scripts
      @$body.one FOURTEEN.PjaxNavigation.EVENT_ANIMATION_SHOWN, @init_
    else
      @init_()


  ###
  ## PRIVATE METHODS
  ###

  init_: (data) =>
    # load scripts if provided
    @loadAsyncScripts_() if @scripts?.length
    # trigger callback in subclass if exists
    @onReady() if @onReady?


  # load a script from the browser cache if possible
  loadScript_: (url, options) ->
    options = $.extend( options || {}, {
      dataType: 'script',
      cache: true,
      url: url
    })
    # Return the jqXHR object so we can chain callbacks
    return jQuery.ajax(options)


  # loads all async scripts
  loadAsyncScripts_: =>
    @loadScript_(script).done(@onScriptLoaded_) for script in @scripts


  # triggers loaded callback when all scripts have finished loading
  onScriptLoaded_: (script, textStatus) =>
    if ++@numberOfScriptsLoaded_ is @scripts.length
      @onAsyncScriptsLoaded()


  ###
  ## PROTECTED METHODS - OVERRIDE IN SUBCLASS
  ###

  # OPTIONAL: callback when component is ready to do work (after pjax aimation)
  onReady: =>


  # OPTIONAL: override in subclass
  onAsyncScriptsLoaded: =>

