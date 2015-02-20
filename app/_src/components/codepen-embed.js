var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

FOURTEEN.CodePenEmbedOnScroll = (function() {
  var ASSET_EI_JS_URL, DATA_RATIO, DATA_SLUG, DEFAULT_RATIO;

  ASSET_EI_JS_URL = '//assets.codepen.io/assets/embed/ei.js';

  DATA_SLUG = 'slug';

  DATA_RATIO = 'ratio';

  DEFAULT_RATIO = 16 / 9;

  function CodePenEmbedOnScroll($context, data) {
    this.$context = $context;
    this.injectCodePenMarkup = __bind(this.injectCodePenMarkup, this);
    this.init = __bind(this.init, this);
    this.$body = $('body');
    if (data != null ? data.isPjax : void 0) {
      this.$body.one(FOURTEEN.PjaxNavigation.EVENT_ANIMATION_SHOWN, this.init);
    } else {
      this.init();
    }
  }

  CodePenEmbedOnScroll.prototype.init = function() {
    this.injectCodePenMarkup();
    return this.injectCodePenJS();
  };

  CodePenEmbedOnScroll.prototype.injectCodePenMarkup = function() {
    var height, slug, tmpl;
    slug = this.getSlug();
    if (slug != null) {
      height = this.getHeight();
      tmpl = this.getTemplate({
        height: height,
        slug: slug
      });
      return this.$context.append(tmpl);
    }
  };

  CodePenEmbedOnScroll.prototype.injectCodePenJS = function() {
    var script;
    if ($('#codepen-script-tag').length > 0) {
      if (typeof CodePenEmbed === 'object') {
        CodePenEmbed.init();
        return CodePenEmbed.showCodePenEmbeds();
      }
    } else {
      script = document.createElement('script');
      script.id = 'codepen-script-tag';
      script.src = ASSET_EI_JS_URL;
      script.async = true;
      return this.$body.append(script);
    }
  };

  CodePenEmbedOnScroll.prototype.getTemplate = function(params) {
    return "<p data-height=\"" + params.height + "\" data-theme-id=\"6678\" data-slug-hash=\"" + params.slug + "\" data-default-tab=\"result\" data-user=\"14islands\" class=\"codepen\"></p>";
  };

  CodePenEmbedOnScroll.prototype.getHeight = function() {
    var ratio;
    ratio = this.getRatio();
    return parseInt(this.$context.outerWidth() / ratio, 10);
  };

  CodePenEmbedOnScroll.prototype.getSlug = function() {
    return this.$context.data(DATA_SLUG);
  };

  CodePenEmbedOnScroll.prototype.getRatio = function() {
    var ratio;
    ratio = this.$context.data(DATA_RATIO);
    if (ratio != null ? ratio.length : void 0) {
      return parseFloat(ratio);
    } else {
      return DEFAULT_RATIO;
    }
  };

  return CodePenEmbedOnScroll;

})();
