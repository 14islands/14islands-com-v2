class window.ComponentLoader

  COMPONENT_PREFIX = "js-component"

  constructor: (@namespace = "") ->
    @registeredComponents = {}

  start: ->
    @scan(document.body, false)

  scan: (context = document.body, doCleanUp = true) ->
    currentComponents = {}
    $elements = $("[class*='#{COMPONENT_PREFIX}']", context)
    for el in $elements
      $element = $(el)
      componentId = -1

      # check this hasn't already been added to
      # the array of elements
      if (!$element.data("componentized"))

        # flag this as componentized so we don't
        # do it a second time
        $element.data('componentized', true)

        # find the name of the component instance
        classList = $element.attr("class").split(" ")
        for ob in classList
          index = ob.indexOf(COMPONENT_PREFIX)

          # if component instance exists
          if (index > -1)
            dashedName = ob.slice(COMPONENT_PREFIX.length)
            name = @dashedNameToLetterCase(dashedName)

            reference = window[@namespace][name]
            if $.isFunction(reference)
              # ensure we don't get any collisions
              componentId = "i14-" + Math.floor(Math.random() * 10000000)
              $element.data('component-id', componentId)
              currentComponents[componentId] = true

              instance = new reference($element)
              instance.open?()
              @registeredComponents[componentId] = instance
      else
        componentId = $element.data('component-id')
        currentComponents[componentId] = true

    @cleanUp(currentComponents) if doCleanUp

  cleanUp: (currentComponents = {}) =>
    componentsToCleanUp = []
    for id, instance of @registeredComponents
      exists = currentComponents[id] == true
      unless exists
        instance.destroy?()
        componentsToCleanUp.push(id)
    delete @registeredComponents[id] for id in componentsToCleanUp

  dashedNameToLetterCase: (name) ->
    return "#{name}".replace(/-([a-z])/g, (g) ->
      g[1].toUpperCase()
    ) if name?.length > 0
    ""
