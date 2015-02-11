###
  Responsive.io Lazy Image Loader Component

  This component will load content based on the viewport size.

  Example markup:
    <img data-lazy-src="">


  @method
  init()
  - Initializes the header component

  @method
  render()
  - Called when component is visible - if hidden while instanciating

###
class FOURTEEN.LazyRioImage

    constructor: (@$context, @data, @instanceId) ->
      @offset = @$context.data("lazy-offset") || {}

      # load them immediately for touch devices
      if typeof scrollMonitor is 'object' && !Modernizr.touch && !navigator.msMaxTouchPoints
        @watcher = scrollMonitor.create(@$context, @offset);
        @watcher.enterViewport(@onEnterViewport);
      else
        @loadImg() # can't wait for window load since we use pjax


    ###
     * Gets the source based on the context data attribute.
     * @return {String} src for the img tag
    ###
    getImgSrc: =>
      @$context.data('lazy-src') || ""


    ###
     * Callback for when the context enters the viewport.
    ###
    onEnterViewport: =>
      @loadImg()
      @watcher.destroy()


    ###
     * Loads the image by settings it's data-src for Responsive.io to pick it up
     * or by setting it's source if ResponsiveIO is not available.
    ###
    loadImg: =>
      if typeof ResponsiveIO is 'object'
        @$context.attr('data-src', @getImgSrc());
        ResponsiveIO.refresh(@$context);
      else
        @$context.attr('src', @getImgSrc());


    destroy: =>
      @watcher.destroy();
