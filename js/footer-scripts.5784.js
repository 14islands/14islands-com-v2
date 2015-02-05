(function($) {
    function fnPjax(selector, container, options) {
        var context = this;
        return this.on("click.pjax", selector, function(event) {
            var opts = $.extend({}, optionsFor(container, options));
            if (!opts.container) opts.container = $(this).attr("data-pjax") || context;
            handleClick(event, opts);
        });
    }
    function handleClick(event, container, options) {
        options = optionsFor(container, options);
        var link = event.currentTarget;
        if (link.tagName.toUpperCase() !== "A") throw "$.fn.pjax or $.pjax.click requires an anchor element";
        if (event.which > 1 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (location.protocol !== link.protocol || location.hostname !== link.hostname) return;
        if (link.href.indexOf("#") > -1 && stripHash(link) == stripHash(location)) return;
        if (event.isDefaultPrevented()) return;
        var defaults = {
            url: link.href,
            container: $(link).attr("data-pjax"),
            target: link
        };
        var opts = $.extend({}, defaults, options);
        var clickEvent = $.Event("pjax:click");
        $(link).trigger(clickEvent, [ opts ]);
        if (!clickEvent.isDefaultPrevented()) {
            pjax(opts);
            event.preventDefault();
            $(link).trigger("pjax:clicked", [ opts ]);
        }
    }
    function handleSubmit(event, container, options) {
        options = optionsFor(container, options);
        var form = event.currentTarget;
        if (form.tagName.toUpperCase() !== "FORM") throw "$.pjax.submit requires a form element";
        var defaults = {
            type: form.method.toUpperCase(),
            url: form.action,
            container: $(form).attr("data-pjax"),
            target: form
        };
        if (defaults.type !== "GET" && window.FormData !== undefined) {
            defaults.data = new FormData(form);
            defaults.processData = false;
            defaults.contentType = false;
        } else {
            if ($(form).find(":file").length) {
                return;
            }
            defaults.data = $(form).serializeArray();
        }
        pjax($.extend({}, defaults, options));
        event.preventDefault();
    }
    function pjax(options) {
        options = $.extend(true, {}, $.ajaxSettings, pjax.defaults, options);
        if ($.isFunction(options.url)) {
            options.url = options.url();
        }
        var target = options.target;
        var hash = parseURL(options.url).hash;
        var context = options.context = findContainerFor(options.container);
        if (!options.data) options.data = {};
        if ($.isArray(options.data)) {
            options.data.push({
                name: "_pjax",
                value: context.selector
            });
        } else {
            options.data._pjax = context.selector;
        }
        function fire(type, args, props) {
            if (!props) props = {};
            props.relatedTarget = target;
            var event = $.Event(type, props);
            context.trigger(event, args);
            return !event.isDefaultPrevented();
        }
        var timeoutTimer;
        options.beforeSend = function(xhr, settings) {
            if (settings.type !== "GET") {
                settings.timeout = 0;
            }
            xhr.setRequestHeader("X-PJAX", "true");
            xhr.setRequestHeader("X-PJAX-Container", context.selector);
            if (!fire("pjax:beforeSend", [ xhr, settings ])) return false;
            if (settings.timeout > 0) {
                timeoutTimer = setTimeout(function() {
                    if (fire("pjax:timeout", [ xhr, options ])) xhr.abort("timeout");
                }, settings.timeout);
                settings.timeout = 0;
            }
            options.requestUrl = parseURL(settings.url).href;
        };
        options.complete = function(xhr, textStatus) {
            if (timeoutTimer) clearTimeout(timeoutTimer);
            fire("pjax:complete", [ xhr, textStatus, options ]);
            fire("pjax:end", [ xhr, options ]);
        };
        options.error = function(xhr, textStatus, errorThrown) {
            var container = extractContainer("", xhr, options);
            var allowed = fire("pjax:error", [ xhr, textStatus, errorThrown, options ]);
            if (options.type == "GET" && textStatus !== "abort" && allowed) {
                locationReplace(container.url);
            }
        };
        options.success = function(data, status, xhr) {
            var previousState = pjax.state;
            var currentVersion = typeof $.pjax.defaults.version === "function" ? $.pjax.defaults.version() : $.pjax.defaults.version;
            var latestVersion = xhr.getResponseHeader("X-PJAX-Version");
            var container = extractContainer(data, xhr, options);
            if (currentVersion && latestVersion && currentVersion !== latestVersion) {
                locationReplace(container.url);
                return;
            }
            if (!container.contents) {
                locationReplace(container.url);
                return;
            }
            pjax.state = {
                id: options.id || uniqueId(),
                url: container.url,
                title: container.title,
                container: context.selector,
                fragment: options.fragment,
                timeout: options.timeout
            };
            if (options.push || options.replace) {
                window.history.replaceState(pjax.state, container.title, container.url);
            }
            try {
                document.activeElement.blur();
            } catch (e) {}
            if (container.title) document.title = container.title;
            fire("pjax:beforeReplace", [ container.contents, options ], {
                state: pjax.state,
                previousState: previousState
            });
            context.html(container.contents);
            var autofocusEl = context.find("input[autofocus], textarea[autofocus]").last()[0];
            if (autofocusEl && document.activeElement !== autofocusEl) {
                autofocusEl.focus();
            }
            executeScriptTags(container.scripts);
            if (typeof options.scrollTo === "number") $(window).scrollTop(options.scrollTo);
            if (hash !== "") {
                var url = parseURL(container.url);
                url.hash = hash;
                pjax.state.url = url.href;
                window.history.replaceState(pjax.state, container.title, url.href);
                var target = document.getElementById(url.hash.slice(1));
                if (target) $(window).scrollTop($(target).offset().top);
            }
            fire("pjax:success", [ data, status, xhr, options ]);
        };
        if (!pjax.state) {
            pjax.state = {
                id: uniqueId(),
                url: window.location.href,
                title: document.title,
                container: context.selector,
                fragment: options.fragment,
                timeout: options.timeout
            };
            window.history.replaceState(pjax.state, document.title);
        }
        var xhr = pjax.xhr;
        if (xhr && xhr.readyState < 4) {
            xhr.onreadystatechange = $.noop;
            xhr.abort();
        }
        pjax.options = options;
        var xhr = pjax.xhr = $.ajax(options);
        if (xhr.readyState > 0) {
            if (options.push && !options.replace) {
                cachePush(pjax.state.id, context.clone().contents());
                window.history.pushState(null, "", stripPjaxParam(options.requestUrl));
            }
            fire("pjax:start", [ xhr, options ]);
            fire("pjax:send", [ xhr, options ]);
        }
        return pjax.xhr;
    }
    function pjaxReload(container, options) {
        var defaults = {
            url: window.location.href,
            push: false,
            replace: true,
            scrollTo: false
        };
        return pjax($.extend(defaults, optionsFor(container, options)));
    }
    function locationReplace(url) {
        window.history.replaceState(null, "", pjax.state.url);
        window.location.replace(url);
    }
    var initialPop = true;
    var initialURL = window.location.href;
    var initialState = window.history.state;
    if (initialState && initialState.container) {
        pjax.state = initialState;
    }
    if ("state" in window.history) {
        initialPop = false;
    }
    function onPjaxPopstate(event) {
        var previousState = pjax.state;
        var state = event.state;
        if (state && state.container) {
            if (initialPop && initialURL == state.url) return;
            if (pjax.state && pjax.state.id === state.id) return;
            var container = $(state.container);
            if (container.length) {
                var direction, contents = cacheMapping[state.id];
                if (pjax.state) {
                    direction = pjax.state.id < state.id ? "forward" : "back";
                    cachePop(direction, pjax.state.id, container.clone().contents());
                }
                var popstateEvent = $.Event("pjax:popstate", {
                    state: state,
                    direction: direction
                });
                container.trigger(popstateEvent);
                var options = {
                    id: state.id,
                    url: state.url,
                    container: container,
                    push: false,
                    fragment: state.fragment,
                    timeout: state.timeout,
                    scrollTo: false
                };
                if (contents) {
                    container.trigger("pjax:start", [ null, options ]);
                    pjax.state = state;
                    if (state.title) document.title = state.title;
                    var beforeReplaceEvent = $.Event("pjax:beforeReplace", {
                        state: state,
                        previousState: previousState
                    });
                    container.trigger(beforeReplaceEvent, [ contents, options ]);
                    container.html(contents);
                    container.trigger("pjax:end", [ null, options ]);
                } else {
                    pjax(options);
                }
                container[0].offsetHeight;
            } else {
                locationReplace(location.href);
            }
        }
        initialPop = false;
    }
    function fallbackPjax(options) {
        var url = $.isFunction(options.url) ? options.url() : options.url, method = options.type ? options.type.toUpperCase() : "GET";
        var form = $("<form>", {
            method: method === "GET" ? "GET" : "POST",
            action: url,
            style: "display:none"
        });
        if (method !== "GET" && method !== "POST") {
            form.append($("<input>", {
                type: "hidden",
                name: "_method",
                value: method.toLowerCase()
            }));
        }
        var data = options.data;
        if (typeof data === "string") {
            $.each(data.split("&"), function(index, value) {
                var pair = value.split("=");
                form.append($("<input>", {
                    type: "hidden",
                    name: pair[0],
                    value: pair[1]
                }));
            });
        } else if (typeof data === "object") {
            for (key in data) form.append($("<input>", {
                type: "hidden",
                name: key,
                value: data[key]
            }));
        }
        $(document.body).append(form);
        form.submit();
    }
    function uniqueId() {
        return new Date().getTime();
    }
    function stripPjaxParam(url) {
        return url.replace(/\?_pjax=[^&]+&?/, "?").replace(/_pjax=[^&]+&?/, "").replace(/[\?&]$/, "");
    }
    function parseURL(url) {
        var a = document.createElement("a");
        a.href = url;
        return a;
    }
    function stripHash(location) {
        return location.href.replace(/#.*/, "");
    }
    function optionsFor(container, options) {
        if (container && options) options.container = container; else if ($.isPlainObject(container)) options = container; else options = {
            container: container
        };
        if (options.container) options.container = findContainerFor(options.container);
        return options;
    }
    function findContainerFor(container) {
        container = $(container);
        if (!container.length) {
            throw "no pjax container for " + container.selector;
        } else if (container.selector !== "" && container.context === document) {
            return container;
        } else if (container.attr("id")) {
            return $("#" + container.attr("id"));
        } else {
            throw "cant get selector for pjax container!";
        }
    }
    function findAll(elems, selector) {
        return elems.filter(selector).add(elems.find(selector));
    }
    function parseHTML(html) {
        return $.parseHTML(html, document, true);
    }
    function extractContainer(data, xhr, options) {
        var obj = {}, fullDocument = /<html/i.test(data);
        obj.url = stripPjaxParam(xhr.getResponseHeader("X-PJAX-URL") || options.requestUrl);
        if (fullDocument) {
            var $head = $(parseHTML(data.match(/<head[^>]*>([\s\S.]*)<\/head>/i)[0]));
            var $body = $(parseHTML(data.match(/<body[^>]*>([\s\S.]*)<\/body>/i)[0]));
        } else {
            var $head = $body = $(parseHTML(data));
        }
        if ($body.length === 0) return obj;
        obj.title = findAll($head, "title").last().text();
        if (options.fragment) {
            if (options.fragment === "body") {
                var $fragment = $body;
            } else {
                var $fragment = findAll($body, options.fragment).first();
            }
            if ($fragment.length) {
                obj.contents = options.fragment === "body" ? $fragment : $fragment.contents();
                if (!obj.title) obj.title = $fragment.attr("title") || $fragment.data("title");
            }
        } else if (!fullDocument) {
            obj.contents = $body;
        }
        if (obj.contents) {
            obj.contents = obj.contents.not(function() {
                return $(this).is("title");
            });
            obj.contents.find("title").remove();
            obj.scripts = findAll(obj.contents, "script[src]").remove();
            obj.contents = obj.contents.not(obj.scripts);
        }
        if (obj.title) obj.title = $.trim(obj.title);
        return obj;
    }
    function executeScriptTags(scripts) {
        if (!scripts) return;
        var existingScripts = $("script[src]");
        scripts.each(function() {
            var src = this.src;
            var matchedScripts = existingScripts.filter(function() {
                return this.src === src;
            });
            if (matchedScripts.length) return;
            var script = document.createElement("script");
            var type = $(this).attr("type");
            if (type) script.type = type;
            script.src = $(this).attr("src");
            document.head.appendChild(script);
        });
    }
    var cacheMapping = {};
    var cacheForwardStack = [];
    var cacheBackStack = [];
    function cachePush(id, value) {
        cacheMapping[id] = value;
        cacheBackStack.push(id);
        trimCacheStack(cacheForwardStack, 0);
        trimCacheStack(cacheBackStack, pjax.defaults.maxCacheLength);
    }
    function cachePop(direction, id, value) {
        var pushStack, popStack;
        cacheMapping[id] = value;
        if (direction === "forward") {
            pushStack = cacheBackStack;
            popStack = cacheForwardStack;
        } else {
            pushStack = cacheForwardStack;
            popStack = cacheBackStack;
        }
        pushStack.push(id);
        if (id = popStack.pop()) delete cacheMapping[id];
        trimCacheStack(pushStack, pjax.defaults.maxCacheLength);
    }
    function trimCacheStack(stack, length) {
        while (stack.length > length) delete cacheMapping[stack.shift()];
    }
    function findVersion() {
        return $("meta").filter(function() {
            var name = $(this).attr("http-equiv");
            return name && name.toUpperCase() === "X-PJAX-VERSION";
        }).attr("content");
    }
    function enable() {
        $.fn.pjax = fnPjax;
        $.pjax = pjax;
        $.pjax.enable = $.noop;
        $.pjax.disable = disable;
        $.pjax.click = handleClick;
        $.pjax.submit = handleSubmit;
        $.pjax.reload = pjaxReload;
        $.pjax.defaults = {
            timeout: 650,
            push: true,
            replace: false,
            type: "GET",
            dataType: "html",
            scrollTo: 0,
            maxCacheLength: 20,
            version: findVersion
        };
        $(window).on("popstate.pjax", onPjaxPopstate);
    }
    function disable() {
        $.fn.pjax = function() {
            return this;
        };
        $.pjax = fallbackPjax;
        $.pjax.enable = enable;
        $.pjax.disable = $.noop;
        $.pjax.click = $.noop;
        $.pjax.submit = $.noop;
        $.pjax.reload = function() {
            window.location.reload();
        };
        $(window).off("popstate.pjax", onPjaxPopstate);
    }
    if ($.inArray("state", $.event.props) < 0) $.event.props.push("state");
    $.support.pjax = window.history && window.history.pushState && window.history.replaceState && !navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]\D|WebApps\/.+CFNetwork)/);
    $.support.pjax ? enable() : disable();
})(jQuery);

(function() {
    "use strict";
    function FastClick(layer, options) {
        var oldOnClick;
        options = options || {};
        this.trackingClick = false;
        this.trackingClickStart = 0;
        this.targetElement = null;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.lastTouchIdentifier = 0;
        this.touchBoundary = options.touchBoundary || 10;
        this.layer = layer;
        this.tapDelay = options.tapDelay || 200;
        this.tapTimeout = options.tapTimeout || 700;
        if (FastClick.notNeeded(layer)) {
            return;
        }
        function bind(method, context) {
            return function() {
                return method.apply(context, arguments);
            };
        }
        var methods = [ "onMouse", "onClick", "onTouchStart", "onTouchMove", "onTouchEnd", "onTouchCancel" ];
        var context = this;
        for (var i = 0, l = methods.length; i < l; i++) {
            context[methods[i]] = bind(context[methods[i]], context);
        }
        if (deviceIsAndroid) {
            layer.addEventListener("mouseover", this.onMouse, true);
            layer.addEventListener("mousedown", this.onMouse, true);
            layer.addEventListener("mouseup", this.onMouse, true);
        }
        layer.addEventListener("click", this.onClick, true);
        layer.addEventListener("touchstart", this.onTouchStart, false);
        layer.addEventListener("touchmove", this.onTouchMove, false);
        layer.addEventListener("touchend", this.onTouchEnd, false);
        layer.addEventListener("touchcancel", this.onTouchCancel, false);
        if (!Event.prototype.stopImmediatePropagation) {
            layer.removeEventListener = function(type, callback, capture) {
                var rmv = Node.prototype.removeEventListener;
                if (type === "click") {
                    rmv.call(layer, type, callback.hijacked || callback, capture);
                } else {
                    rmv.call(layer, type, callback, capture);
                }
            };
            layer.addEventListener = function(type, callback, capture) {
                var adv = Node.prototype.addEventListener;
                if (type === "click") {
                    adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
                        if (!event.propagationStopped) {
                            callback(event);
                        }
                    }), capture);
                } else {
                    adv.call(layer, type, callback, capture);
                }
            };
        }
        if (typeof layer.onclick === "function") {
            oldOnClick = layer.onclick;
            layer.addEventListener("click", function(event) {
                oldOnClick(event);
            }, false);
            layer.onclick = null;
        }
    }
    var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;
    var deviceIsAndroid = navigator.userAgent.indexOf("Android") > 0 && !deviceIsWindowsPhone;
    var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;
    var deviceIsIOS4 = deviceIsIOS && /OS 4_\d(_\d)?/.test(navigator.userAgent);
    var deviceIsIOSWithBadTarget = deviceIsIOS && /OS [6-7]_\d/.test(navigator.userAgent);
    var deviceIsBlackBerry10 = navigator.userAgent.indexOf("BB10") > 0;
    FastClick.prototype.needsClick = function(target) {
        switch (target.nodeName.toLowerCase()) {
          case "button":
          case "select":
          case "textarea":
            if (target.disabled) {
                return true;
            }
            break;

          case "input":
            if (deviceIsIOS && target.type === "file" || target.disabled) {
                return true;
            }
            break;

          case "label":
          case "iframe":
          case "video":
            return true;
        }
        return /\bneedsclick\b/.test(target.className);
    };
    FastClick.prototype.needsFocus = function(target) {
        switch (target.nodeName.toLowerCase()) {
          case "textarea":
            return true;

          case "select":
            return !deviceIsAndroid;

          case "input":
            switch (target.type) {
              case "button":
              case "checkbox":
              case "file":
              case "image":
              case "radio":
              case "submit":
                return false;
            }
            return !target.disabled && !target.readOnly;

          default:
            return /\bneedsfocus\b/.test(target.className);
        }
    };
    FastClick.prototype.sendClick = function(targetElement, event) {
        var clickEvent, touch;
        if (document.activeElement && document.activeElement !== targetElement) {
            document.activeElement.blur();
        }
        touch = event.changedTouches[0];
        clickEvent = document.createEvent("MouseEvents");
        clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
        clickEvent.forwardedTouchEvent = true;
        targetElement.dispatchEvent(clickEvent);
    };
    FastClick.prototype.determineEventType = function(targetElement) {
        if (deviceIsAndroid && targetElement.tagName.toLowerCase() === "select") {
            return "mousedown";
        }
        return "click";
    };
    FastClick.prototype.focus = function(targetElement) {
        var length;
        if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf("date") !== 0 && targetElement.type !== "time" && targetElement.type !== "month") {
            length = targetElement.value.length;
            targetElement.setSelectionRange(length, length);
        } else {
            targetElement.focus();
        }
    };
    FastClick.prototype.updateScrollParent = function(targetElement) {
        var scrollParent, parentElement;
        scrollParent = targetElement.fastClickScrollParent;
        if (!scrollParent || !scrollParent.contains(targetElement)) {
            parentElement = targetElement;
            do {
                if (parentElement.scrollHeight > parentElement.offsetHeight) {
                    scrollParent = parentElement;
                    targetElement.fastClickScrollParent = parentElement;
                    break;
                }
                parentElement = parentElement.parentElement;
            } while (parentElement);
        }
        if (scrollParent) {
            scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
        }
    };
    FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {
        if (eventTarget.nodeType === Node.TEXT_NODE) {
            return eventTarget.parentNode;
        }
        return eventTarget;
    };
    FastClick.prototype.onTouchStart = function(event) {
        var targetElement, touch, selection;
        if (event.targetTouches.length > 1) {
            return true;
        }
        targetElement = this.getTargetElementFromEventTarget(event.target);
        touch = event.targetTouches[0];
        if (deviceIsIOS) {
            selection = window.getSelection();
            if (selection.rangeCount && !selection.isCollapsed) {
                return true;
            }
            if (!deviceIsIOS4) {
                if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
                    event.preventDefault();
                    return false;
                }
                this.lastTouchIdentifier = touch.identifier;
                this.updateScrollParent(targetElement);
            }
        }
        this.trackingClick = true;
        this.trackingClickStart = event.timeStamp;
        this.targetElement = targetElement;
        this.touchStartX = touch.pageX;
        this.touchStartY = touch.pageY;
        if (event.timeStamp - this.lastClickTime < this.tapDelay) {
            event.preventDefault();
        }
        return true;
    };
    FastClick.prototype.touchHasMoved = function(event) {
        var touch = event.changedTouches[0], boundary = this.touchBoundary;
        if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
            return true;
        }
        return false;
    };
    FastClick.prototype.onTouchMove = function(event) {
        if (!this.trackingClick) {
            return true;
        }
        if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
            this.trackingClick = false;
            this.targetElement = null;
        }
        return true;
    };
    FastClick.prototype.findControl = function(labelElement) {
        if (labelElement.control !== undefined) {
            return labelElement.control;
        }
        if (labelElement.htmlFor) {
            return document.getElementById(labelElement.htmlFor);
        }
        return labelElement.querySelector("button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea");
    };
    FastClick.prototype.onTouchEnd = function(event) {
        var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;
        if (!this.trackingClick) {
            return true;
        }
        if (event.timeStamp - this.lastClickTime < this.tapDelay) {
            this.cancelNextClick = true;
            return true;
        }
        if (event.timeStamp - this.trackingClickStart > this.tapTimeout) {
            return true;
        }
        this.cancelNextClick = false;
        this.lastClickTime = event.timeStamp;
        trackingClickStart = this.trackingClickStart;
        this.trackingClick = false;
        this.trackingClickStart = 0;
        if (deviceIsIOSWithBadTarget) {
            touch = event.changedTouches[0];
            targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
            targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
        }
        targetTagName = targetElement.tagName.toLowerCase();
        if (targetTagName === "label") {
            forElement = this.findControl(targetElement);
            if (forElement) {
                this.focus(targetElement);
                if (deviceIsAndroid) {
                    return false;
                }
                targetElement = forElement;
            }
        } else if (this.needsFocus(targetElement)) {
            if (event.timeStamp - trackingClickStart > 100 || deviceIsIOS && window.top !== window && targetTagName === "input") {
                this.targetElement = null;
                return false;
            }
            this.focus(targetElement);
            this.sendClick(targetElement, event);
            if (!deviceIsIOS || targetTagName !== "select") {
                this.targetElement = null;
                event.preventDefault();
            }
            return false;
        }
        if (deviceIsIOS && !deviceIsIOS4) {
            scrollParent = targetElement.fastClickScrollParent;
            if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
                return true;
            }
        }
        if (!this.needsClick(targetElement)) {
            event.preventDefault();
            this.sendClick(targetElement, event);
        }
        return false;
    };
    FastClick.prototype.onTouchCancel = function() {
        this.trackingClick = false;
        this.targetElement = null;
    };
    FastClick.prototype.onMouse = function(event) {
        if (!this.targetElement) {
            return true;
        }
        if (event.forwardedTouchEvent) {
            return true;
        }
        if (!event.cancelable) {
            return true;
        }
        if (!this.needsClick(this.targetElement) || this.cancelNextClick) {
            if (event.stopImmediatePropagation) {
                event.stopImmediatePropagation();
            } else {
                event.propagationStopped = true;
            }
            event.stopPropagation();
            event.preventDefault();
            return false;
        }
        return true;
    };
    FastClick.prototype.onClick = function(event) {
        var permitted;
        if (this.trackingClick) {
            this.targetElement = null;
            this.trackingClick = false;
            return true;
        }
        if (event.target.type === "submit" && event.detail === 0) {
            return true;
        }
        permitted = this.onMouse(event);
        if (!permitted) {
            this.targetElement = null;
        }
        return permitted;
    };
    FastClick.prototype.destroy = function() {
        var layer = this.layer;
        if (deviceIsAndroid) {
            layer.removeEventListener("mouseover", this.onMouse, true);
            layer.removeEventListener("mousedown", this.onMouse, true);
            layer.removeEventListener("mouseup", this.onMouse, true);
        }
        layer.removeEventListener("click", this.onClick, true);
        layer.removeEventListener("touchstart", this.onTouchStart, false);
        layer.removeEventListener("touchmove", this.onTouchMove, false);
        layer.removeEventListener("touchend", this.onTouchEnd, false);
        layer.removeEventListener("touchcancel", this.onTouchCancel, false);
    };
    FastClick.notNeeded = function(layer) {
        var metaViewport;
        var chromeVersion;
        var blackberryVersion;
        var firefoxVersion;
        if (typeof window.ontouchstart === "undefined") {
            return true;
        }
        chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [ , 0 ])[1];
        if (chromeVersion) {
            if (deviceIsAndroid) {
                metaViewport = document.querySelector("meta[name=viewport]");
                if (metaViewport) {
                    if (metaViewport.content.indexOf("user-scalable=no") !== -1) {
                        return true;
                    }
                    if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
                        return true;
                    }
                }
            } else {
                return true;
            }
        }
        if (deviceIsBlackBerry10) {
            blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);
            if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
                metaViewport = document.querySelector("meta[name=viewport]");
                if (metaViewport) {
                    if (metaViewport.content.indexOf("user-scalable=no") !== -1) {
                        return true;
                    }
                    if (document.documentElement.scrollWidth <= window.outerWidth) {
                        return true;
                    }
                }
            }
        }
        if (layer.style.msTouchAction === "none" || layer.style.touchAction === "manipulation") {
            return true;
        }
        firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [ , 0 ])[1];
        if (firefoxVersion >= 27) {
            metaViewport = document.querySelector("meta[name=viewport]");
            if (metaViewport && (metaViewport.content.indexOf("user-scalable=no") !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
                return true;
            }
        }
        if (layer.style.touchAction === "none" || layer.style.touchAction === "manipulation") {
            return true;
        }
        return false;
    };
    FastClick.attach = function(layer, options) {
        return new FastClick(layer, options);
    };
    if (typeof define === "function" && typeof define.amd === "object" && define.amd) {
        define(function() {
            return FastClick;
        });
    } else if (typeof module !== "undefined" && module.exports) {
        module.exports = FastClick.attach;
        module.exports.FastClick = FastClick;
    } else {
        window.FastClick = FastClick;
    }
})();

(function(factory) {
    if (typeof define !== "undefined" && define.amd) {
        define([], factory);
    } else if (typeof module !== "undefined" && module.exports) {
        module.exports = factory();
    } else {
        window.scrollMonitor = factory();
    }
})(function() {
    var scrollTop = function() {
        return window.pageYOffset || document.documentElement && document.documentElement.scrollTop || document.body.scrollTop;
    };
    var exports = {};
    var watchers = [];
    var VISIBILITYCHANGE = "visibilityChange";
    var ENTERVIEWPORT = "enterViewport";
    var FULLYENTERVIEWPORT = "fullyEnterViewport";
    var EXITVIEWPORT = "exitViewport";
    var PARTIALLYEXITVIEWPORT = "partiallyExitViewport";
    var LOCATIONCHANGE = "locationChange";
    var STATECHANGE = "stateChange";
    var eventTypes = [ VISIBILITYCHANGE, ENTERVIEWPORT, FULLYENTERVIEWPORT, EXITVIEWPORT, PARTIALLYEXITVIEWPORT, LOCATIONCHANGE, STATECHANGE ];
    var defaultOffsets = {
        top: 0,
        bottom: 0
    };
    var getViewportHeight = function() {
        return window.innerHeight || document.documentElement.clientHeight;
    };
    var getDocumentHeight = function() {
        return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight, document.documentElement.clientHeight);
    };
    exports.viewportTop = null;
    exports.viewportBottom = null;
    exports.documentHeight = null;
    exports.viewportHeight = getViewportHeight();
    var previousDocumentHeight;
    var latestEvent;
    var calculateViewportI;
    function calculateViewport() {
        exports.viewportTop = scrollTop();
        exports.viewportBottom = exports.viewportTop + exports.viewportHeight;
        exports.documentHeight = getDocumentHeight();
        if (exports.documentHeight !== previousDocumentHeight) {
            calculateViewportI = watchers.length;
            while (calculateViewportI--) {
                watchers[calculateViewportI].recalculateLocation();
            }
            previousDocumentHeight = exports.documentHeight;
        }
    }
    function recalculateWatchLocationsAndTrigger() {
        exports.viewportHeight = getViewportHeight();
        calculateViewport();
        updateAndTriggerWatchers();
    }
    var recalculateAndTriggerTimer;
    function debouncedRecalcuateAndTrigger() {
        clearTimeout(recalculateAndTriggerTimer);
        recalculateAndTriggerTimer = setTimeout(recalculateWatchLocationsAndTrigger, 100);
    }
    var updateAndTriggerWatchersI;
    function updateAndTriggerWatchers() {
        updateAndTriggerWatchersI = watchers.length;
        while (updateAndTriggerWatchersI--) {
            watchers[updateAndTriggerWatchersI].update();
        }
        updateAndTriggerWatchersI = watchers.length;
        while (updateAndTriggerWatchersI--) {
            watchers[updateAndTriggerWatchersI].triggerCallbacks();
        }
    }
    function ElementWatcher(watchItem, offsets) {
        var self = this;
        this.watchItem = watchItem;
        if (!offsets) {
            this.offsets = defaultOffsets;
        } else if (offsets === +offsets) {
            this.offsets = {
                top: offsets,
                bottom: offsets
            };
        } else {
            this.offsets = {
                top: offsets.top || defaultOffsets.top,
                bottom: offsets.bottom || defaultOffsets.bottom
            };
        }
        this.callbacks = {};
        for (var i = 0, j = eventTypes.length; i < j; i++) {
            self.callbacks[eventTypes[i]] = [];
        }
        this.locked = false;
        var wasInViewport;
        var wasFullyInViewport;
        var wasAboveViewport;
        var wasBelowViewport;
        var listenerToTriggerListI;
        var listener;
        function triggerCallbackArray(listeners) {
            if (listeners.length === 0) {
                return;
            }
            listenerToTriggerListI = listeners.length;
            while (listenerToTriggerListI--) {
                listener = listeners[listenerToTriggerListI];
                listener.callback.call(self, latestEvent);
                if (listener.isOne) {
                    listeners.splice(listenerToTriggerListI, 1);
                }
            }
        }
        this.triggerCallbacks = function triggerCallbacks() {
            if (this.isInViewport && !wasInViewport) {
                triggerCallbackArray(this.callbacks[ENTERVIEWPORT]);
            }
            if (this.isFullyInViewport && !wasFullyInViewport) {
                triggerCallbackArray(this.callbacks[FULLYENTERVIEWPORT]);
            }
            if (this.isAboveViewport !== wasAboveViewport && this.isBelowViewport !== wasBelowViewport) {
                triggerCallbackArray(this.callbacks[VISIBILITYCHANGE]);
                if (!wasFullyInViewport && !this.isFullyInViewport) {
                    triggerCallbackArray(this.callbacks[FULLYENTERVIEWPORT]);
                    triggerCallbackArray(this.callbacks[PARTIALLYEXITVIEWPORT]);
                }
                if (!wasInViewport && !this.isInViewport) {
                    triggerCallbackArray(this.callbacks[ENTERVIEWPORT]);
                    triggerCallbackArray(this.callbacks[EXITVIEWPORT]);
                }
            }
            if (!this.isFullyInViewport && wasFullyInViewport) {
                triggerCallbackArray(this.callbacks[PARTIALLYEXITVIEWPORT]);
            }
            if (!this.isInViewport && wasInViewport) {
                triggerCallbackArray(this.callbacks[EXITVIEWPORT]);
            }
            if (this.isInViewport !== wasInViewport) {
                triggerCallbackArray(this.callbacks[VISIBILITYCHANGE]);
            }
            switch (true) {
              case wasInViewport !== this.isInViewport:
              case wasFullyInViewport !== this.isFullyInViewport:
              case wasAboveViewport !== this.isAboveViewport:
              case wasBelowViewport !== this.isBelowViewport:
                triggerCallbackArray(this.callbacks[STATECHANGE]);
            }
            wasInViewport = this.isInViewport;
            wasFullyInViewport = this.isFullyInViewport;
            wasAboveViewport = this.isAboveViewport;
            wasBelowViewport = this.isBelowViewport;
        };
        this.recalculateLocation = function() {
            if (this.locked) {
                return;
            }
            var previousTop = this.top;
            var previousBottom = this.bottom;
            if (this.watchItem.nodeName) {
                var cachedDisplay = this.watchItem.style.display;
                if (cachedDisplay === "none") {
                    this.watchItem.style.display = "";
                }
                var boundingRect = this.watchItem.getBoundingClientRect();
                this.top = boundingRect.top + exports.viewportTop;
                this.bottom = boundingRect.bottom + exports.viewportTop;
                if (cachedDisplay === "none") {
                    this.watchItem.style.display = cachedDisplay;
                }
            } else if (this.watchItem === +this.watchItem) {
                if (this.watchItem > 0) {
                    this.top = this.bottom = this.watchItem;
                } else {
                    this.top = this.bottom = exports.documentHeight - this.watchItem;
                }
            } else {
                this.top = this.watchItem.top;
                this.bottom = this.watchItem.bottom;
            }
            this.top -= this.offsets.top;
            this.bottom += this.offsets.bottom;
            this.height = this.bottom - this.top;
            if ((previousTop !== undefined || previousBottom !== undefined) && (this.top !== previousTop || this.bottom !== previousBottom)) {
                triggerCallbackArray(this.callbacks[LOCATIONCHANGE]);
            }
        };
        this.recalculateLocation();
        this.update();
        wasInViewport = this.isInViewport;
        wasFullyInViewport = this.isFullyInViewport;
        wasAboveViewport = this.isAboveViewport;
        wasBelowViewport = this.isBelowViewport;
    }
    ElementWatcher.prototype = {
        on: function(event, callback, isOne) {
            switch (true) {
              case event === VISIBILITYCHANGE && !this.isInViewport && this.isAboveViewport:
              case event === ENTERVIEWPORT && this.isInViewport:
              case event === FULLYENTERVIEWPORT && this.isFullyInViewport:
              case event === EXITVIEWPORT && this.isAboveViewport && !this.isInViewport:
              case event === PARTIALLYEXITVIEWPORT && this.isAboveViewport:
                callback.call(this, latestEvent);
                if (isOne) {
                    return;
                }
            }
            if (this.callbacks[event]) {
                this.callbacks[event].push({
                    callback: callback,
                    isOne: isOne || false
                });
            } else {
                throw new Error("Tried to add a scroll monitor listener of type " + event + ". Your options are: " + eventTypes.join(", "));
            }
        },
        off: function(event, callback) {
            if (this.callbacks[event]) {
                for (var i = 0, item; item = this.callbacks[event][i]; i++) {
                    if (item.callback === callback) {
                        this.callbacks[event].splice(i, 1);
                        break;
                    }
                }
            } else {
                throw new Error("Tried to remove a scroll monitor listener of type " + event + ". Your options are: " + eventTypes.join(", "));
            }
        },
        one: function(event, callback) {
            this.on(event, callback, true);
        },
        recalculateSize: function() {
            this.height = this.watchItem.offsetHeight + this.offsets.top + this.offsets.bottom;
            this.bottom = this.top + this.height;
        },
        update: function() {
            this.isAboveViewport = this.top < exports.viewportTop;
            this.isBelowViewport = this.bottom > exports.viewportBottom;
            this.isInViewport = this.top <= exports.viewportBottom && this.bottom >= exports.viewportTop;
            this.isFullyInViewport = this.top >= exports.viewportTop && this.bottom <= exports.viewportBottom || this.isAboveViewport && this.isBelowViewport;
        },
        destroy: function() {
            var index = watchers.indexOf(this), self = this;
            watchers.splice(index, 1);
            for (var i = 0, j = eventTypes.length; i < j; i++) {
                self.callbacks[eventTypes[i]].length = 0;
            }
        },
        lock: function() {
            this.locked = true;
        },
        unlock: function() {
            this.locked = false;
        }
    };
    var eventHandlerFactory = function(type) {
        return function(callback, isOne) {
            this.on.call(this, type, callback, isOne);
        };
    };
    for (var i = 0, j = eventTypes.length; i < j; i++) {
        var type = eventTypes[i];
        ElementWatcher.prototype[type] = eventHandlerFactory(type);
    }
    try {
        calculateViewport();
    } catch (e) {
        try {
            window.$(calculateViewport);
        } catch (e) {
            throw new Error("If you must put scrollMonitor in the <head>, you must use jQuery.");
        }
    }
    function scrollMonitorListener(event) {
        latestEvent = event;
        calculateViewport();
        updateAndTriggerWatchers();
    }
    if (window.addEventListener) {
        window.addEventListener("scroll", scrollMonitorListener);
        window.addEventListener("resize", debouncedRecalcuateAndTrigger);
    } else {
        window.attachEvent("onscroll", scrollMonitorListener);
        window.attachEvent("onresize", debouncedRecalcuateAndTrigger);
    }
    exports.beget = exports.create = function(element, offsets) {
        if (typeof element === "string") {
            element = document.querySelector(element);
        } else if (element && element.length > 0) {
            element = element[0];
        }
        var watcher = new ElementWatcher(element, offsets);
        watchers.push(watcher);
        watcher.update();
        return watcher;
    };
    exports.update = function() {
        latestEvent = null;
        calculateViewport();
        updateAndTriggerWatchers();
    };
    exports.recalculateLocations = function() {
        exports.documentHeight = 0;
        exports.update();
    };
    return exports;
});

var _gsScope = typeof module !== "undefined" && module.exports && typeof global !== "undefined" ? global : this || window;

(_gsScope._gsQueue || (_gsScope._gsQueue = [])).push(function() {
    "use strict";
    _gsScope._gsDefine("plugins.CSSPlugin", [ "plugins.TweenPlugin", "TweenLite" ], function(TweenPlugin, TweenLite) {
        var CSSPlugin = function() {
            TweenPlugin.call(this, "css");
            this._overwriteProps.length = 0;
            this.setRatio = CSSPlugin.prototype.setRatio;
        }, _hasPriority, _suffixMap, _cs, _overwriteProps, _specialProps = {}, p = CSSPlugin.prototype = new TweenPlugin("css");
        p.constructor = CSSPlugin;
        CSSPlugin.version = "1.13.0";
        CSSPlugin.API = 2;
        CSSPlugin.defaultTransformPerspective = 0;
        CSSPlugin.defaultSkewType = "compensated";
        p = "px";
        CSSPlugin.suffixMap = {
            top: p,
            right: p,
            bottom: p,
            left: p,
            width: p,
            height: p,
            fontSize: p,
            padding: p,
            margin: p,
            perspective: p,
            lineHeight: ""
        };
        var _numExp = /(?:\d|\-\d|\.\d|\-\.\d)+/g, _relNumExp = /(?:\d|\-\d|\.\d|\-\.\d|\+=\d|\-=\d|\+=.\d|\-=\.\d)+/g, _valuesExp = /(?:\+=|\-=|\-|\b)[\d\-\.]+[a-zA-Z0-9]*(?:%|\b)/gi, _NaNExp = /[^\d\-\.]/g, _suffixExp = /(?:\d|\-|\+|=|#|\.)*/g, _opacityExp = /opacity *= *([^)]*)/i, _opacityValExp = /opacity:([^;]*)/i, _alphaFilterExp = /alpha\(opacity *=.+?\)/i, _rgbhslExp = /^(rgb|hsl)/, _capsExp = /([A-Z])/g, _camelExp = /-([a-z])/gi, _urlExp = /(^(?:url\(\"|url\())|(?:(\"\))$|\)$)/gi, _camelFunc = function(s, g) {
            return g.toUpperCase();
        }, _horizExp = /(?:Left|Right|Width)/i, _ieGetMatrixExp = /(M11|M12|M21|M22)=[\d\-\.e]+/gi, _ieSetMatrixExp = /progid\:DXImageTransform\.Microsoft\.Matrix\(.+?\)/i, _commasOutsideParenExp = /,(?=[^\)]*(?:\(|$))/gi, _DEG2RAD = Math.PI / 180, _RAD2DEG = 180 / Math.PI, _forcePT = {}, _doc = document, _tempDiv = _doc.createElement("div"), _tempImg = _doc.createElement("img"), _internals = CSSPlugin._internals = {
            _specialProps: _specialProps
        }, _agent = navigator.userAgent, _autoRound, _reqSafariFix, _isSafari, _isFirefox, _isSafariLT6, _ieVers, _supportsOpacity = function() {
            var i = _agent.indexOf("Android"), d = _doc.createElement("div"), a;
            _isSafari = _agent.indexOf("Safari") !== -1 && _agent.indexOf("Chrome") === -1 && (i === -1 || Number(_agent.substr(i + 8, 1)) > 3);
            _isSafariLT6 = _isSafari && Number(_agent.substr(_agent.indexOf("Version/") + 8, 1)) < 6;
            _isFirefox = _agent.indexOf("Firefox") !== -1;
            if (/MSIE ([0-9]{1,}[\.0-9]{0,})/.exec(_agent)) {
                _ieVers = parseFloat(RegExp.$1);
            }
            d.innerHTML = "<a style='top:1px;opacity:.55;'>a</a>";
            a = d.getElementsByTagName("a")[0];
            return a ? /^0.55/.test(a.style.opacity) : false;
        }(), _getIEOpacity = function(v) {
            return _opacityExp.test(typeof v === "string" ? v : (v.currentStyle ? v.currentStyle.filter : v.style.filter) || "") ? parseFloat(RegExp.$1) / 100 : 1;
        }, _log = function(s) {
            if (window.console) {
                console.log(s);
            }
        }, _prefixCSS = "", _prefix = "", _checkPropPrefix = function(p, e) {
            e = e || _tempDiv;
            var s = e.style, a, i;
            if (s[p] !== undefined) {
                return p;
            }
            p = p.charAt(0).toUpperCase() + p.substr(1);
            a = [ "O", "Moz", "ms", "Ms", "Webkit" ];
            i = 5;
            while (--i > -1 && s[a[i] + p] === undefined) {}
            if (i >= 0) {
                _prefix = i === 3 ? "ms" : a[i];
                _prefixCSS = "-" + _prefix.toLowerCase() + "-";
                return _prefix + p;
            }
            return null;
        }, _getComputedStyle = _doc.defaultView ? _doc.defaultView.getComputedStyle : function() {}, _getStyle = CSSPlugin.getStyle = function(t, p, cs, calc, dflt) {
            var rv;
            if (!_supportsOpacity) if (p === "opacity") {
                return _getIEOpacity(t);
            }
            if (!calc && t.style[p]) {
                rv = t.style[p];
            } else if (cs = cs || _getComputedStyle(t)) {
                rv = cs[p] || cs.getPropertyValue(p) || cs.getPropertyValue(p.replace(_capsExp, "-$1").toLowerCase());
            } else if (t.currentStyle) {
                rv = t.currentStyle[p];
            }
            return dflt != null && (!rv || rv === "none" || rv === "auto" || rv === "auto auto") ? dflt : rv;
        }, _convertToPixels = _internals.convertToPixels = function(t, p, v, sfx, recurse) {
            if (sfx === "px" || !sfx) {
                return v;
            }
            if (sfx === "auto" || !v) {
                return 0;
            }
            var horiz = _horizExp.test(p), node = t, style = _tempDiv.style, neg = v < 0, pix, cache, time;
            if (neg) {
                v = -v;
            }
            if (sfx === "%" && p.indexOf("border") !== -1) {
                pix = v / 100 * (horiz ? t.clientWidth : t.clientHeight);
            } else {
                style.cssText = "border:0 solid red;position:" + _getStyle(t, "position") + ";line-height:0;";
                if (sfx === "%" || !node.appendChild) {
                    node = t.parentNode || _doc.body;
                    cache = node._gsCache;
                    time = TweenLite.ticker.frame;
                    if (cache && horiz && cache.time === time) {
                        return cache.width * v / 100;
                    }
                    style[horiz ? "width" : "height"] = v + sfx;
                } else {
                    style[horiz ? "borderLeftWidth" : "borderTopWidth"] = v + sfx;
                }
                node.appendChild(_tempDiv);
                pix = parseFloat(_tempDiv[horiz ? "offsetWidth" : "offsetHeight"]);
                node.removeChild(_tempDiv);
                if (horiz && sfx === "%" && CSSPlugin.cacheWidths !== false) {
                    cache = node._gsCache = node._gsCache || {};
                    cache.time = time;
                    cache.width = pix / v * 100;
                }
                if (pix === 0 && !recurse) {
                    pix = _convertToPixels(t, p, v, sfx, true);
                }
            }
            return neg ? -pix : pix;
        }, _calculateOffset = _internals.calculateOffset = function(t, p, cs) {
            if (_getStyle(t, "position", cs) !== "absolute") {
                return 0;
            }
            var dim = p === "left" ? "Left" : "Top", v = _getStyle(t, "margin" + dim, cs);
            return t["offset" + dim] - (_convertToPixels(t, p, parseFloat(v), v.replace(_suffixExp, "")) || 0);
        }, _getAllStyles = function(t, cs) {
            var s = {}, i, tr;
            if (cs = cs || _getComputedStyle(t, null)) {
                if (i = cs.length) {
                    while (--i > -1) {
                        s[cs[i].replace(_camelExp, _camelFunc)] = cs.getPropertyValue(cs[i]);
                    }
                } else {
                    for (i in cs) {
                        s[i] = cs[i];
                    }
                }
            } else if (cs = t.currentStyle || t.style) {
                for (i in cs) {
                    if (typeof i === "string" && s[i] === undefined) {
                        s[i.replace(_camelExp, _camelFunc)] = cs[i];
                    }
                }
            }
            if (!_supportsOpacity) {
                s.opacity = _getIEOpacity(t);
            }
            tr = _getTransform(t, cs, false);
            s.rotation = tr.rotation;
            s.skewX = tr.skewX;
            s.scaleX = tr.scaleX;
            s.scaleY = tr.scaleY;
            s.x = tr.x;
            s.y = tr.y;
            if (_supports3D) {
                s.z = tr.z;
                s.rotationX = tr.rotationX;
                s.rotationY = tr.rotationY;
                s.scaleZ = tr.scaleZ;
            }
            if (s.filters) {
                delete s.filters;
            }
            return s;
        }, _cssDif = function(t, s1, s2, vars, forceLookup) {
            var difs = {}, style = t.style, val, p, mpt;
            for (p in s2) {
                if (p !== "cssText") if (p !== "length") if (isNaN(p)) if (s1[p] !== (val = s2[p]) || forceLookup && forceLookup[p]) if (p.indexOf("Origin") === -1) if (typeof val === "number" || typeof val === "string") {
                    difs[p] = val === "auto" && (p === "left" || p === "top") ? _calculateOffset(t, p) : (val === "" || val === "auto" || val === "none") && typeof s1[p] === "string" && s1[p].replace(_NaNExp, "") !== "" ? 0 : val;
                    if (style[p] !== undefined) {
                        mpt = new MiniPropTween(style, p, style[p], mpt);
                    }
                }
            }
            if (vars) {
                for (p in vars) {
                    if (p !== "className") {
                        difs[p] = vars[p];
                    }
                }
            }
            return {
                difs: difs,
                firstMPT: mpt
            };
        }, _dimensions = {
            width: [ "Left", "Right" ],
            height: [ "Top", "Bottom" ]
        }, _margins = [ "marginLeft", "marginRight", "marginTop", "marginBottom" ], _getDimension = function(t, p, cs) {
            var v = parseFloat(p === "width" ? t.offsetWidth : t.offsetHeight), a = _dimensions[p], i = a.length;
            cs = cs || _getComputedStyle(t, null);
            while (--i > -1) {
                v -= parseFloat(_getStyle(t, "padding" + a[i], cs, true)) || 0;
                v -= parseFloat(_getStyle(t, "border" + a[i] + "Width", cs, true)) || 0;
            }
            return v;
        }, _parsePosition = function(v, recObj) {
            if (v == null || v === "" || v === "auto" || v === "auto auto") {
                v = "0 0";
            }
            var a = v.split(" "), x = v.indexOf("left") !== -1 ? "0%" : v.indexOf("right") !== -1 ? "100%" : a[0], y = v.indexOf("top") !== -1 ? "0%" : v.indexOf("bottom") !== -1 ? "100%" : a[1];
            if (y == null) {
                y = "0";
            } else if (y === "center") {
                y = "50%";
            }
            if (x === "center" || isNaN(parseFloat(x)) && (x + "").indexOf("=") === -1) {
                x = "50%";
            }
            if (recObj) {
                recObj.oxp = x.indexOf("%") !== -1;
                recObj.oyp = y.indexOf("%") !== -1;
                recObj.oxr = x.charAt(1) === "=";
                recObj.oyr = y.charAt(1) === "=";
                recObj.ox = parseFloat(x.replace(_NaNExp, ""));
                recObj.oy = parseFloat(y.replace(_NaNExp, ""));
            }
            return x + " " + y + (a.length > 2 ? " " + a[2] : "");
        }, _parseChange = function(e, b) {
            return typeof e === "string" && e.charAt(1) === "=" ? parseInt(e.charAt(0) + "1", 10) * parseFloat(e.substr(2)) : parseFloat(e) - parseFloat(b);
        }, _parseVal = function(v, d) {
            return v == null ? d : typeof v === "string" && v.charAt(1) === "=" ? parseInt(v.charAt(0) + "1", 10) * Number(v.substr(2)) + d : parseFloat(v);
        }, _parseAngle = function(v, d, p, directionalEnd) {
            var min = 1e-6, cap, split, dif, result;
            if (v == null) {
                result = d;
            } else if (typeof v === "number") {
                result = v;
            } else {
                cap = 360;
                split = v.split("_");
                dif = Number(split[0].replace(_NaNExp, "")) * (v.indexOf("rad") === -1 ? 1 : _RAD2DEG) - (v.charAt(1) === "=" ? 0 : d);
                if (split.length) {
                    if (directionalEnd) {
                        directionalEnd[p] = d + dif;
                    }
                    if (v.indexOf("short") !== -1) {
                        dif = dif % cap;
                        if (dif !== dif % (cap / 2)) {
                            dif = dif < 0 ? dif + cap : dif - cap;
                        }
                    }
                    if (v.indexOf("_cw") !== -1 && dif < 0) {
                        dif = (dif + cap * 9999999999) % cap - (dif / cap | 0) * cap;
                    } else if (v.indexOf("ccw") !== -1 && dif > 0) {
                        dif = (dif - cap * 9999999999) % cap - (dif / cap | 0) * cap;
                    }
                }
                result = d + dif;
            }
            if (result < min && result > -min) {
                result = 0;
            }
            return result;
        }, _colorLookup = {
            aqua: [ 0, 255, 255 ],
            lime: [ 0, 255, 0 ],
            silver: [ 192, 192, 192 ],
            black: [ 0, 0, 0 ],
            maroon: [ 128, 0, 0 ],
            teal: [ 0, 128, 128 ],
            blue: [ 0, 0, 255 ],
            navy: [ 0, 0, 128 ],
            white: [ 255, 255, 255 ],
            fuchsia: [ 255, 0, 255 ],
            olive: [ 128, 128, 0 ],
            yellow: [ 255, 255, 0 ],
            orange: [ 255, 165, 0 ],
            gray: [ 128, 128, 128 ],
            purple: [ 128, 0, 128 ],
            green: [ 0, 128, 0 ],
            red: [ 255, 0, 0 ],
            pink: [ 255, 192, 203 ],
            cyan: [ 0, 255, 255 ],
            transparent: [ 255, 255, 255, 0 ]
        }, _hue = function(h, m1, m2) {
            h = h < 0 ? h + 1 : h > 1 ? h - 1 : h;
            return (h * 6 < 1 ? m1 + (m2 - m1) * h * 6 : h < .5 ? m2 : h * 3 < 2 ? m1 + (m2 - m1) * (2 / 3 - h) * 6 : m1) * 255 + .5 | 0;
        }, _parseColor = function(v) {
            var c1, c2, c3, h, s, l;
            if (!v || v === "") {
                return _colorLookup.black;
            }
            if (typeof v === "number") {
                return [ v >> 16, v >> 8 & 255, v & 255 ];
            }
            if (v.charAt(v.length - 1) === ",") {
                v = v.substr(0, v.length - 1);
            }
            if (_colorLookup[v]) {
                return _colorLookup[v];
            }
            if (v.charAt(0) === "#") {
                if (v.length === 4) {
                    c1 = v.charAt(1), c2 = v.charAt(2), c3 = v.charAt(3);
                    v = "#" + c1 + c1 + c2 + c2 + c3 + c3;
                }
                v = parseInt(v.substr(1), 16);
                return [ v >> 16, v >> 8 & 255, v & 255 ];
            }
            if (v.substr(0, 3) === "hsl") {
                v = v.match(_numExp);
                h = Number(v[0]) % 360 / 360;
                s = Number(v[1]) / 100;
                l = Number(v[2]) / 100;
                c2 = l <= .5 ? l * (s + 1) : l + s - l * s;
                c1 = l * 2 - c2;
                if (v.length > 3) {
                    v[3] = Number(v[3]);
                }
                v[0] = _hue(h + 1 / 3, c1, c2);
                v[1] = _hue(h, c1, c2);
                v[2] = _hue(h - 1 / 3, c1, c2);
                return v;
            }
            v = v.match(_numExp) || _colorLookup.transparent;
            v[0] = Number(v[0]);
            v[1] = Number(v[1]);
            v[2] = Number(v[2]);
            if (v.length > 3) {
                v[3] = Number(v[3]);
            }
            return v;
        }, _colorExp = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#.+?\\b";
        for (p in _colorLookup) {
            _colorExp += "|" + p + "\\b";
        }
        _colorExp = new RegExp(_colorExp + ")", "gi");
        var _getFormatter = function(dflt, clr, collapsible, multi) {
            if (dflt == null) {
                return function(v) {
                    return v;
                };
            }
            var dColor = clr ? (dflt.match(_colorExp) || [ "" ])[0] : "", dVals = dflt.split(dColor).join("").match(_valuesExp) || [], pfx = dflt.substr(0, dflt.indexOf(dVals[0])), sfx = dflt.charAt(dflt.length - 1) === ")" ? ")" : "", delim = dflt.indexOf(" ") !== -1 ? " " : ",", numVals = dVals.length, dSfx = numVals > 0 ? dVals[0].replace(_numExp, "") : "", formatter;
            if (!numVals) {
                return function(v) {
                    return v;
                };
            }
            if (clr) {
                formatter = function(v) {
                    var color, vals, i, a;
                    if (typeof v === "number") {
                        v += dSfx;
                    } else if (multi && _commasOutsideParenExp.test(v)) {
                        a = v.replace(_commasOutsideParenExp, "|").split("|");
                        for (i = 0; i < a.length; i++) {
                            a[i] = formatter(a[i]);
                        }
                        return a.join(",");
                    }
                    color = (v.match(_colorExp) || [ dColor ])[0];
                    vals = v.split(color).join("").match(_valuesExp) || [];
                    i = vals.length;
                    if (numVals > i--) {
                        while (++i < numVals) {
                            vals[i] = collapsible ? vals[(i - 1) / 2 | 0] : dVals[i];
                        }
                    }
                    return pfx + vals.join(delim) + delim + color + sfx + (v.indexOf("inset") !== -1 ? " inset" : "");
                };
                return formatter;
            }
            formatter = function(v) {
                var vals, a, i;
                if (typeof v === "number") {
                    v += dSfx;
                } else if (multi && _commasOutsideParenExp.test(v)) {
                    a = v.replace(_commasOutsideParenExp, "|").split("|");
                    for (i = 0; i < a.length; i++) {
                        a[i] = formatter(a[i]);
                    }
                    return a.join(",");
                }
                vals = v.match(_valuesExp) || [];
                i = vals.length;
                if (numVals > i--) {
                    while (++i < numVals) {
                        vals[i] = collapsible ? vals[(i - 1) / 2 | 0] : dVals[i];
                    }
                }
                return pfx + vals.join(delim) + sfx;
            };
            return formatter;
        }, _getEdgeParser = function(props) {
            props = props.split(",");
            return function(t, e, p, cssp, pt, plugin, vars) {
                var a = (e + "").split(" "), i;
                vars = {};
                for (i = 0; i < 4; i++) {
                    vars[props[i]] = a[i] = a[i] || a[(i - 1) / 2 >> 0];
                }
                return cssp.parse(t, vars, pt, plugin);
            };
        }, _setPluginRatio = _internals._setPluginRatio = function(v) {
            this.plugin.setRatio(v);
            var d = this.data, proxy = d.proxy, mpt = d.firstMPT, min = 1e-6, val, pt, i, str;
            while (mpt) {
                val = proxy[mpt.v];
                if (mpt.r) {
                    val = Math.round(val);
                } else if (val < min && val > -min) {
                    val = 0;
                }
                mpt.t[mpt.p] = val;
                mpt = mpt._next;
            }
            if (d.autoRotate) {
                d.autoRotate.rotation = proxy.rotation;
            }
            if (v === 1) {
                mpt = d.firstMPT;
                while (mpt) {
                    pt = mpt.t;
                    if (!pt.type) {
                        pt.e = pt.s + pt.xs0;
                    } else if (pt.type === 1) {
                        str = pt.xs0 + pt.s + pt.xs1;
                        for (i = 1; i < pt.l; i++) {
                            str += pt["xn" + i] + pt["xs" + (i + 1)];
                        }
                        pt.e = str;
                    }
                    mpt = mpt._next;
                }
            }
        }, MiniPropTween = function(t, p, v, next, r) {
            this.t = t;
            this.p = p;
            this.v = v;
            this.r = r;
            if (next) {
                next._prev = this;
                this._next = next;
            }
        }, _parseToProxy = _internals._parseToProxy = function(t, vars, cssp, pt, plugin, shallow) {
            var bpt = pt, start = {}, end = {}, transform = cssp._transform, oldForce = _forcePT, i, p, xp, mpt, firstPT;
            cssp._transform = null;
            _forcePT = vars;
            pt = firstPT = cssp.parse(t, vars, pt, plugin);
            _forcePT = oldForce;
            if (shallow) {
                cssp._transform = transform;
                if (bpt) {
                    bpt._prev = null;
                    if (bpt._prev) {
                        bpt._prev._next = null;
                    }
                }
            }
            while (pt && pt !== bpt) {
                if (pt.type <= 1) {
                    p = pt.p;
                    end[p] = pt.s + pt.c;
                    start[p] = pt.s;
                    if (!shallow) {
                        mpt = new MiniPropTween(pt, "s", p, mpt, pt.r);
                        pt.c = 0;
                    }
                    if (pt.type === 1) {
                        i = pt.l;
                        while (--i > 0) {
                            xp = "xn" + i;
                            p = pt.p + "_" + xp;
                            end[p] = pt.data[xp];
                            start[p] = pt[xp];
                            if (!shallow) {
                                mpt = new MiniPropTween(pt, xp, p, mpt, pt.rxp[xp]);
                            }
                        }
                    }
                }
                pt = pt._next;
            }
            return {
                proxy: start,
                end: end,
                firstMPT: mpt,
                pt: firstPT
            };
        }, CSSPropTween = _internals.CSSPropTween = function(t, p, s, c, next, type, n, r, pr, b, e) {
            this.t = t;
            this.p = p;
            this.s = s;
            this.c = c;
            this.n = n || p;
            if (!(t instanceof CSSPropTween)) {
                _overwriteProps.push(this.n);
            }
            this.r = r;
            this.type = type || 0;
            if (pr) {
                this.pr = pr;
                _hasPriority = true;
            }
            this.b = b === undefined ? s : b;
            this.e = e === undefined ? s + c : e;
            if (next) {
                this._next = next;
                next._prev = this;
            }
        }, _parseComplex = CSSPlugin.parseComplex = function(t, p, b, e, clrs, dflt, pt, pr, plugin, setRatio) {
            b = b || dflt || "";
            pt = new CSSPropTween(t, p, 0, 0, pt, setRatio ? 2 : 1, null, false, pr, b, e);
            e += "";
            var ba = b.split(", ").join(",").split(" "), ea = e.split(", ").join(",").split(" "), l = ba.length, autoRound = _autoRound !== false, i, xi, ni, bv, ev, bnums, enums, bn, rgba, temp, cv, str;
            if (e.indexOf(",") !== -1 || b.indexOf(",") !== -1) {
                ba = ba.join(" ").replace(_commasOutsideParenExp, ", ").split(" ");
                ea = ea.join(" ").replace(_commasOutsideParenExp, ", ").split(" ");
                l = ba.length;
            }
            if (l !== ea.length) {
                ba = (dflt || "").split(" ");
                l = ba.length;
            }
            pt.plugin = plugin;
            pt.setRatio = setRatio;
            for (i = 0; i < l; i++) {
                bv = ba[i];
                ev = ea[i];
                bn = parseFloat(bv);
                if (bn || bn === 0) {
                    pt.appendXtra("", bn, _parseChange(ev, bn), ev.replace(_relNumExp, ""), autoRound && ev.indexOf("px") !== -1, true);
                } else if (clrs && (bv.charAt(0) === "#" || _colorLookup[bv] || _rgbhslExp.test(bv))) {
                    str = ev.charAt(ev.length - 1) === "," ? ")," : ")";
                    bv = _parseColor(bv);
                    ev = _parseColor(ev);
                    rgba = bv.length + ev.length > 6;
                    if (rgba && !_supportsOpacity && ev[3] === 0) {
                        pt["xs" + pt.l] += pt.l ? " transparent" : "transparent";
                        pt.e = pt.e.split(ea[i]).join("transparent");
                    } else {
                        if (!_supportsOpacity) {
                            rgba = false;
                        }
                        pt.appendXtra(rgba ? "rgba(" : "rgb(", bv[0], ev[0] - bv[0], ",", true, true).appendXtra("", bv[1], ev[1] - bv[1], ",", true).appendXtra("", bv[2], ev[2] - bv[2], rgba ? "," : str, true);
                        if (rgba) {
                            bv = bv.length < 4 ? 1 : bv[3];
                            pt.appendXtra("", bv, (ev.length < 4 ? 1 : ev[3]) - bv, str, false);
                        }
                    }
                } else {
                    bnums = bv.match(_numExp);
                    if (!bnums) {
                        pt["xs" + pt.l] += pt.l ? " " + bv : bv;
                    } else {
                        enums = ev.match(_relNumExp);
                        if (!enums || enums.length !== bnums.length) {
                            return pt;
                        }
                        ni = 0;
                        for (xi = 0; xi < bnums.length; xi++) {
                            cv = bnums[xi];
                            temp = bv.indexOf(cv, ni);
                            pt.appendXtra(bv.substr(ni, temp - ni), Number(cv), _parseChange(enums[xi], cv), "", autoRound && bv.substr(temp + cv.length, 2) === "px", xi === 0);
                            ni = temp + cv.length;
                        }
                        pt["xs" + pt.l] += bv.substr(ni);
                    }
                }
            }
            if (e.indexOf("=") !== -1) if (pt.data) {
                str = pt.xs0 + pt.data.s;
                for (i = 1; i < pt.l; i++) {
                    str += pt["xs" + i] + pt.data["xn" + i];
                }
                pt.e = str + pt["xs" + i];
            }
            if (!pt.l) {
                pt.type = -1;
                pt.xs0 = pt.e;
            }
            return pt.xfirst || pt;
        }, i = 9;
        p = CSSPropTween.prototype;
        p.l = p.pr = 0;
        while (--i > 0) {
            p["xn" + i] = 0;
            p["xs" + i] = "";
        }
        p.xs0 = "";
        p._next = p._prev = p.xfirst = p.data = p.plugin = p.setRatio = p.rxp = null;
        p.appendXtra = function(pfx, s, c, sfx, r, pad) {
            var pt = this, l = pt.l;
            pt["xs" + l] += pad && l ? " " + pfx : pfx || "";
            if (!c) if (l !== 0 && !pt.plugin) {
                pt["xs" + l] += s + (sfx || "");
                return pt;
            }
            pt.l++;
            pt.type = pt.setRatio ? 2 : 1;
            pt["xs" + pt.l] = sfx || "";
            if (l > 0) {
                pt.data["xn" + l] = s + c;
                pt.rxp["xn" + l] = r;
                pt["xn" + l] = s;
                if (!pt.plugin) {
                    pt.xfirst = new CSSPropTween(pt, "xn" + l, s, c, pt.xfirst || pt, 0, pt.n, r, pt.pr);
                    pt.xfirst.xs0 = 0;
                }
                return pt;
            }
            pt.data = {
                s: s + c
            };
            pt.rxp = {};
            pt.s = s;
            pt.c = c;
            pt.r = r;
            return pt;
        };
        var SpecialProp = function(p, options) {
            options = options || {};
            this.p = options.prefix ? _checkPropPrefix(p) || p : p;
            _specialProps[p] = _specialProps[this.p] = this;
            this.format = options.formatter || _getFormatter(options.defaultValue, options.color, options.collapsible, options.multi);
            if (options.parser) {
                this.parse = options.parser;
            }
            this.clrs = options.color;
            this.multi = options.multi;
            this.keyword = options.keyword;
            this.dflt = options.defaultValue;
            this.pr = options.priority || 0;
        }, _registerComplexSpecialProp = _internals._registerComplexSpecialProp = function(p, options, defaults) {
            if (typeof options !== "object") {
                options = {
                    parser: defaults
                };
            }
            var a = p.split(","), d = options.defaultValue, i, temp;
            defaults = defaults || [ d ];
            for (i = 0; i < a.length; i++) {
                options.prefix = i === 0 && options.prefix;
                options.defaultValue = defaults[i] || d;
                temp = new SpecialProp(a[i], options);
            }
        }, _registerPluginProp = function(p) {
            if (!_specialProps[p]) {
                var pluginName = p.charAt(0).toUpperCase() + p.substr(1) + "Plugin";
                _registerComplexSpecialProp(p, {
                    parser: function(t, e, p, cssp, pt, plugin, vars) {
                        var pluginClass = (_gsScope.GreenSockGlobals || _gsScope).com.greensock.plugins[pluginName];
                        if (!pluginClass) {
                            _log("Error: " + pluginName + " js file not loaded.");
                            return pt;
                        }
                        pluginClass._cssRegister();
                        return _specialProps[p].parse(t, e, p, cssp, pt, plugin, vars);
                    }
                });
            }
        };
        p = SpecialProp.prototype;
        p.parseComplex = function(t, b, e, pt, plugin, setRatio) {
            var kwd = this.keyword, i, ba, ea, l, bi, ei;
            if (this.multi) if (_commasOutsideParenExp.test(e) || _commasOutsideParenExp.test(b)) {
                ba = b.replace(_commasOutsideParenExp, "|").split("|");
                ea = e.replace(_commasOutsideParenExp, "|").split("|");
            } else if (kwd) {
                ba = [ b ];
                ea = [ e ];
            }
            if (ea) {
                l = ea.length > ba.length ? ea.length : ba.length;
                for (i = 0; i < l; i++) {
                    b = ba[i] = ba[i] || this.dflt;
                    e = ea[i] = ea[i] || this.dflt;
                    if (kwd) {
                        bi = b.indexOf(kwd);
                        ei = e.indexOf(kwd);
                        if (bi !== ei) {
                            e = ei === -1 ? ea : ba;
                            e[i] += " " + kwd;
                        }
                    }
                }
                b = ba.join(", ");
                e = ea.join(", ");
            }
            return _parseComplex(t, this.p, b, e, this.clrs, this.dflt, pt, this.pr, plugin, setRatio);
        };
        p.parse = function(t, e, p, cssp, pt, plugin, vars) {
            return this.parseComplex(t.style, this.format(_getStyle(t, this.p, _cs, false, this.dflt)), this.format(e), pt, plugin);
        };
        CSSPlugin.registerSpecialProp = function(name, onInitTween, priority) {
            _registerComplexSpecialProp(name, {
                parser: function(t, e, p, cssp, pt, plugin, vars) {
                    var rv = new CSSPropTween(t, p, 0, 0, pt, 2, p, false, priority);
                    rv.plugin = plugin;
                    rv.setRatio = onInitTween(t, e, cssp._tween, p);
                    return rv;
                },
                priority: priority
            });
        };
        var _transformProps = "scaleX,scaleY,scaleZ,x,y,z,skewX,skewY,rotation,rotationX,rotationY,perspective,xPercent,yPercent".split(","), _transformProp = _checkPropPrefix("transform"), _transformPropCSS = _prefixCSS + "transform", _transformOriginProp = _checkPropPrefix("transformOrigin"), _supports3D = _checkPropPrefix("perspective") !== null, Transform = _internals.Transform = function() {
            this.skewY = 0;
        }, _getTransform = _internals.getTransform = function(t, cs, rec, parse) {
            if (t._gsTransform && rec && !parse) {
                return t._gsTransform;
            }
            var tm = rec ? t._gsTransform || new Transform() : new Transform(), invX = tm.scaleX < 0, min = 2e-5, rnd = 1e5, minAngle = 179.99, minPI = minAngle * _DEG2RAD, zOrigin = _supports3D ? parseFloat(_getStyle(t, _transformOriginProp, cs, false, "0 0 0").split(" ")[2]) || tm.zOrigin || 0 : 0, s, m, i, n, dec, scaleX, scaleY, rotation, skewX, difX, difY, difR, difS;
            if (_transformProp) {
                s = _getStyle(t, _transformPropCSS, cs, true);
            } else if (t.currentStyle) {
                s = t.currentStyle.filter.match(_ieGetMatrixExp);
                s = s && s.length === 4 ? [ s[0].substr(4), Number(s[2].substr(4)), Number(s[1].substr(4)), s[3].substr(4), tm.x || 0, tm.y || 0 ].join(",") : "";
            }
            if (!s || s === "none" || s === "matrix(1, 0, 0, 1, 0, 0)") {
                tm = {
                    x: 0,
                    y: 0,
                    z: 0,
                    scaleX: 1,
                    scaleY: 1,
                    scaleZ: 1,
                    skewX: 0,
                    perspective: 0,
                    rotation: 0,
                    rotationX: 0,
                    rotationY: 0,
                    zOrigin: 0
                };
            } else {
                m = (s || "").match(/(?:\-|\b)[\d\-\.e]+\b/gi) || [];
                i = m.length;
                while (--i > -1) {
                    n = Number(m[i]);
                    m[i] = (dec = n - (n |= 0)) ? (dec * rnd + (dec < 0 ? -.5 : .5) | 0) / rnd + n : n;
                }
                if (m.length === 16) {
                    var a13 = m[8], a23 = m[9], a33 = m[10], a14 = m[12], a24 = m[13], a34 = m[14];
                    if (tm.zOrigin) {
                        a34 = -tm.zOrigin;
                        a14 = a13 * a34 - m[12];
                        a24 = a23 * a34 - m[13];
                        a34 = a33 * a34 + tm.zOrigin - m[14];
                    }
                    if (!rec || parse || tm.rotationX == null) {
                        var a11 = m[0], a21 = m[1], a31 = m[2], a41 = m[3], a12 = m[4], a22 = m[5], a32 = m[6], a42 = m[7], a43 = m[11], angle = Math.atan2(a32, a33), xFlip = angle < -minPI || angle > minPI, t1, t2, t3, cos, sin, yFlip, zFlip;
                        tm.rotationX = angle * _RAD2DEG;
                        if (angle) {
                            cos = Math.cos(-angle);
                            sin = Math.sin(-angle);
                            t1 = a12 * cos + a13 * sin;
                            t2 = a22 * cos + a23 * sin;
                            t3 = a32 * cos + a33 * sin;
                            a13 = a12 * -sin + a13 * cos;
                            a23 = a22 * -sin + a23 * cos;
                            a33 = a32 * -sin + a33 * cos;
                            a43 = a42 * -sin + a43 * cos;
                            a12 = t1;
                            a22 = t2;
                            a32 = t3;
                        }
                        angle = Math.atan2(a13, a11);
                        tm.rotationY = angle * _RAD2DEG;
                        if (angle) {
                            yFlip = angle < -minPI || angle > minPI;
                            cos = Math.cos(-angle);
                            sin = Math.sin(-angle);
                            t1 = a11 * cos - a13 * sin;
                            t2 = a21 * cos - a23 * sin;
                            t3 = a31 * cos - a33 * sin;
                            a23 = a21 * sin + a23 * cos;
                            a33 = a31 * sin + a33 * cos;
                            a43 = a41 * sin + a43 * cos;
                            a11 = t1;
                            a21 = t2;
                            a31 = t3;
                        }
                        angle = Math.atan2(a21, a22);
                        tm.rotation = angle * _RAD2DEG;
                        if (angle) {
                            zFlip = angle < -minPI || angle > minPI;
                            cos = Math.cos(-angle);
                            sin = Math.sin(-angle);
                            a11 = a11 * cos + a12 * sin;
                            t2 = a21 * cos + a22 * sin;
                            a22 = a21 * -sin + a22 * cos;
                            a32 = a31 * -sin + a32 * cos;
                            a21 = t2;
                        }
                        if (zFlip && xFlip) {
                            tm.rotation = tm.rotationX = 0;
                        } else if (zFlip && yFlip) {
                            tm.rotation = tm.rotationY = 0;
                        } else if (yFlip && xFlip) {
                            tm.rotationY = tm.rotationX = 0;
                        }
                        tm.scaleX = (Math.sqrt(a11 * a11 + a21 * a21) * rnd + .5 | 0) / rnd;
                        tm.scaleY = (Math.sqrt(a22 * a22 + a23 * a23) * rnd + .5 | 0) / rnd;
                        tm.scaleZ = (Math.sqrt(a32 * a32 + a33 * a33) * rnd + .5 | 0) / rnd;
                        tm.skewX = 0;
                        tm.perspective = a43 ? 1 / (a43 < 0 ? -a43 : a43) : 0;
                        tm.x = a14;
                        tm.y = a24;
                        tm.z = a34;
                    }
                } else if ((!_supports3D || parse || !m.length || tm.x !== m[4] || tm.y !== m[5] || !tm.rotationX && !tm.rotationY) && !(tm.x !== undefined && _getStyle(t, "display", cs) === "none")) {
                    var k = m.length >= 6, a = k ? m[0] : 1, b = m[1] || 0, c = m[2] || 0, d = k ? m[3] : 1;
                    tm.x = m[4] || 0;
                    tm.y = m[5] || 0;
                    scaleX = Math.sqrt(a * a + b * b);
                    scaleY = Math.sqrt(d * d + c * c);
                    rotation = a || b ? Math.atan2(b, a) * _RAD2DEG : tm.rotation || 0;
                    skewX = c || d ? Math.atan2(c, d) * _RAD2DEG + rotation : tm.skewX || 0;
                    difX = scaleX - Math.abs(tm.scaleX || 0);
                    difY = scaleY - Math.abs(tm.scaleY || 0);
                    if (Math.abs(skewX) > 90 && Math.abs(skewX) < 270) {
                        if (invX) {
                            scaleX *= -1;
                            skewX += rotation <= 0 ? 180 : -180;
                            rotation += rotation <= 0 ? 180 : -180;
                        } else {
                            scaleY *= -1;
                            skewX += skewX <= 0 ? 180 : -180;
                        }
                    }
                    difR = (rotation - tm.rotation) % 180;
                    difS = (skewX - tm.skewX) % 180;
                    if (tm.skewX === undefined || difX > min || difX < -min || difY > min || difY < -min || difR > -minAngle && difR < minAngle && difR * rnd | 0 !== 0 || difS > -minAngle && difS < minAngle && difS * rnd | 0 !== 0) {
                        tm.scaleX = scaleX;
                        tm.scaleY = scaleY;
                        tm.rotation = rotation;
                        tm.skewX = skewX;
                    }
                    if (_supports3D) {
                        tm.rotationX = tm.rotationY = tm.z = 0;
                        tm.perspective = parseFloat(CSSPlugin.defaultTransformPerspective) || 0;
                        tm.scaleZ = 1;
                    }
                }
                tm.zOrigin = zOrigin;
                for (i in tm) {
                    if (tm[i] < min) if (tm[i] > -min) {
                        tm[i] = 0;
                    }
                }
            }
            if (rec) {
                t._gsTransform = tm;
            }
            tm.xPercent = tm.yPercent = 0;
            return tm;
        }, _setIETransformRatio = function(v) {
            var t = this.data, ang = -t.rotation * _DEG2RAD, skew = ang + t.skewX * _DEG2RAD, rnd = 1e5, a = (Math.cos(ang) * t.scaleX * rnd | 0) / rnd, b = (Math.sin(ang) * t.scaleX * rnd | 0) / rnd, c = (Math.sin(skew) * -t.scaleY * rnd | 0) / rnd, d = (Math.cos(skew) * t.scaleY * rnd | 0) / rnd, style = this.t.style, cs = this.t.currentStyle, filters, val;
            if (!cs) {
                return;
            }
            val = b;
            b = -c;
            c = -val;
            filters = cs.filter;
            style.filter = "";
            var w = this.t.offsetWidth, h = this.t.offsetHeight, clip = cs.position !== "absolute", m = "progid:DXImageTransform.Microsoft.Matrix(M11=" + a + ", M12=" + b + ", M21=" + c + ", M22=" + d, ox = t.x + w * t.xPercent / 100, oy = t.y + h * t.yPercent / 100, dx, dy;
            if (t.ox != null) {
                dx = (t.oxp ? w * t.ox * .01 : t.ox) - w / 2;
                dy = (t.oyp ? h * t.oy * .01 : t.oy) - h / 2;
                ox += dx - (dx * a + dy * b);
                oy += dy - (dx * c + dy * d);
            }
            if (!clip) {
                m += ", sizingMethod='auto expand')";
            } else {
                dx = w / 2;
                dy = h / 2;
                m += ", Dx=" + (dx - (dx * a + dy * b) + ox) + ", Dy=" + (dy - (dx * c + dy * d) + oy) + ")";
            }
            if (filters.indexOf("DXImageTransform.Microsoft.Matrix(") !== -1) {
                style.filter = filters.replace(_ieSetMatrixExp, m);
            } else {
                style.filter = m + " " + filters;
            }
            if (v === 0 || v === 1) if (a === 1) if (b === 0) if (c === 0) if (d === 1) if (!clip || m.indexOf("Dx=0, Dy=0") !== -1) if (!_opacityExp.test(filters) || parseFloat(RegExp.$1) === 100) if (filters.indexOf("gradient(" && filters.indexOf("Alpha")) === -1) {
                style.removeAttribute("filter");
            }
            if (!clip) {
                var mult = _ieVers < 8 ? 1 : -1, marg, prop, dif;
                dx = t.ieOffsetX || 0;
                dy = t.ieOffsetY || 0;
                t.ieOffsetX = Math.round((w - ((a < 0 ? -a : a) * w + (b < 0 ? -b : b) * h)) / 2 + ox);
                t.ieOffsetY = Math.round((h - ((d < 0 ? -d : d) * h + (c < 0 ? -c : c) * w)) / 2 + oy);
                for (i = 0; i < 4; i++) {
                    prop = _margins[i];
                    marg = cs[prop];
                    val = marg.indexOf("px") !== -1 ? parseFloat(marg) : _convertToPixels(this.t, prop, parseFloat(marg), marg.replace(_suffixExp, "")) || 0;
                    if (val !== t[prop]) {
                        dif = i < 2 ? -t.ieOffsetX : -t.ieOffsetY;
                    } else {
                        dif = i < 2 ? dx - t.ieOffsetX : dy - t.ieOffsetY;
                    }
                    style[prop] = (t[prop] = Math.round(val - dif * (i === 0 || i === 2 ? 1 : mult))) + "px";
                }
            }
        }, _set3DTransformRatio = _internals.set3DTransformRatio = function(v) {
            var t = this.data, style = this.t.style, angle = t.rotation * _DEG2RAD, sx = t.scaleX, sy = t.scaleY, sz = t.scaleZ, x = t.x, y = t.y, z = t.z, perspective = t.perspective, a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, zOrigin, rnd, cos, sin, t1, t2, t3, t4;
            if (v === 1 || v === 0) if (t.force3D === "auto") if (!t.rotationY && !t.rotationX && sz === 1 && !perspective && !z) {
                _set2DTransformRatio.call(this, v);
                return;
            }
            if (_isFirefox) {
                var n = 1e-4;
                if (sx < n && sx > -n) {
                    sx = sz = 2e-5;
                }
                if (sy < n && sy > -n) {
                    sy = sz = 2e-5;
                }
                if (perspective && !t.z && !t.rotationX && !t.rotationY) {
                    perspective = 0;
                }
            }
            if (angle || t.skewX) {
                cos = Math.cos(angle);
                sin = Math.sin(angle);
                a11 = cos;
                a21 = sin;
                if (t.skewX) {
                    angle -= t.skewX * _DEG2RAD;
                    cos = Math.cos(angle);
                    sin = Math.sin(angle);
                    if (t.skewType === "simple") {
                        t1 = Math.tan(t.skewX * _DEG2RAD);
                        t1 = Math.sqrt(1 + t1 * t1);
                        cos *= t1;
                        sin *= t1;
                    }
                }
                a12 = -sin;
                a22 = cos;
            } else if (!t.rotationY && !t.rotationX && sz === 1 && !perspective) {
                style[_transformProp] = (t.xPercent || t.yPercent ? "translate(" + t.xPercent + "%," + t.yPercent + "%) translate3d(" : "translate3d(") + x + "px," + y + "px," + z + "px)" + (sx !== 1 || sy !== 1 ? " scale(" + sx + "," + sy + ")" : "");
                return;
            } else {
                a11 = a22 = 1;
                a12 = a21 = 0;
            }
            a33 = 1;
            a13 = a14 = a23 = a24 = a31 = a32 = a34 = a41 = a42 = 0;
            a43 = perspective ? -1 / perspective : 0;
            zOrigin = t.zOrigin;
            rnd = 1e5;
            angle = t.rotationY * _DEG2RAD;
            if (angle) {
                cos = Math.cos(angle);
                sin = Math.sin(angle);
                a31 = a33 * -sin;
                a41 = a43 * -sin;
                a13 = a11 * sin;
                a23 = a21 * sin;
                a33 *= cos;
                a43 *= cos;
                a11 *= cos;
                a21 *= cos;
            }
            angle = t.rotationX * _DEG2RAD;
            if (angle) {
                cos = Math.cos(angle);
                sin = Math.sin(angle);
                t1 = a12 * cos + a13 * sin;
                t2 = a22 * cos + a23 * sin;
                t3 = a32 * cos + a33 * sin;
                t4 = a42 * cos + a43 * sin;
                a13 = a12 * -sin + a13 * cos;
                a23 = a22 * -sin + a23 * cos;
                a33 = a32 * -sin + a33 * cos;
                a43 = a42 * -sin + a43 * cos;
                a12 = t1;
                a22 = t2;
                a32 = t3;
                a42 = t4;
            }
            if (sz !== 1) {
                a13 *= sz;
                a23 *= sz;
                a33 *= sz;
                a43 *= sz;
            }
            if (sy !== 1) {
                a12 *= sy;
                a22 *= sy;
                a32 *= sy;
                a42 *= sy;
            }
            if (sx !== 1) {
                a11 *= sx;
                a21 *= sx;
                a31 *= sx;
                a41 *= sx;
            }
            if (zOrigin) {
                a34 -= zOrigin;
                a14 = a13 * a34;
                a24 = a23 * a34;
                a34 = a33 * a34 + zOrigin;
            }
            a14 = (t1 = (a14 += x) - (a14 |= 0)) ? (t1 * rnd + (t1 < 0 ? -.5 : .5) | 0) / rnd + a14 : a14;
            a24 = (t1 = (a24 += y) - (a24 |= 0)) ? (t1 * rnd + (t1 < 0 ? -.5 : .5) | 0) / rnd + a24 : a24;
            a34 = (t1 = (a34 += z) - (a34 |= 0)) ? (t1 * rnd + (t1 < 0 ? -.5 : .5) | 0) / rnd + a34 : a34;
            style[_transformProp] = (t.xPercent || t.yPercent ? "translate(" + t.xPercent + "%," + t.yPercent + "%) matrix3d(" : "matrix3d(") + [ (a11 * rnd | 0) / rnd, (a21 * rnd | 0) / rnd, (a31 * rnd | 0) / rnd, (a41 * rnd | 0) / rnd, (a12 * rnd | 0) / rnd, (a22 * rnd | 0) / rnd, (a32 * rnd | 0) / rnd, (a42 * rnd | 0) / rnd, (a13 * rnd | 0) / rnd, (a23 * rnd | 0) / rnd, (a33 * rnd | 0) / rnd, (a43 * rnd | 0) / rnd, a14, a24, a34, perspective ? 1 + -a34 / perspective : 1 ].join(",") + ")";
        }, _set2DTransformRatio = _internals.set2DTransformRatio = function(v) {
            var t = this.data, targ = this.t, style = targ.style, x = t.x, y = t.y, prefix = "", ang, skew, rnd, sx, sy;
            if (t.rotationX || t.rotationY || t.z || t.force3D === true || t.force3D === "auto" && v !== 1 && v !== 0) {
                this.setRatio = _set3DTransformRatio;
                _set3DTransformRatio.call(this, v);
                return;
            }
            if (!t.rotation && !t.skewX) {
                style[_transformProp] = (t.xPercent || t.yPercent ? "translate(" + t.xPercent + "%," + t.yPercent + "%) matrix(" : "matrix(") + t.scaleX + ",0,0," + t.scaleY + "," + x + "," + y + ")";
            } else {
                ang = t.rotation * _DEG2RAD;
                skew = ang - t.skewX * _DEG2RAD;
                rnd = 1e5;
                sx = t.scaleX * rnd;
                sy = t.scaleY * rnd;
                style[_transformProp] = (t.xPercent || t.yPercent ? "translate(" + t.xPercent + "%," + t.yPercent + "%) matrix(" : "matrix(") + (Math.cos(ang) * sx | 0) / rnd + "," + (Math.sin(ang) * sx | 0) / rnd + "," + (Math.sin(skew) * -sy | 0) / rnd + "," + (Math.cos(skew) * sy | 0) / rnd + "," + x + "," + y + ")";
            }
        };
        _registerComplexSpecialProp("transform,scale,scaleX,scaleY,scaleZ,x,y,z,rotation,rotationX,rotationY,rotationZ,skewX,skewY,shortRotation,shortRotationX,shortRotationY,shortRotationZ,transformOrigin,transformPerspective,directionalRotation,parseTransform,force3D,skewType,xPercent,yPercent", {
            parser: function(t, e, p, cssp, pt, plugin, vars) {
                if (cssp._transform) {
                    return pt;
                }
                var m1 = cssp._transform = _getTransform(t, _cs, true, vars.parseTransform), style = t.style, min = 1e-6, i = _transformProps.length, v = vars, endRotations = {}, m2, skewY, copy, orig, has3D, hasChange, dr;
                if (typeof v.transform === "string" && _transformProp) {
                    copy = _tempDiv.style;
                    copy[_transformProp] = v.transform;
                    copy.display = "block";
                    copy.position = "absolute";
                    _doc.body.appendChild(_tempDiv);
                    m2 = _getTransform(_tempDiv, null, false);
                    _doc.body.removeChild(_tempDiv);
                } else if (typeof v === "object") {
                    m2 = {
                        scaleX: _parseVal(v.scaleX != null ? v.scaleX : v.scale, m1.scaleX),
                        scaleY: _parseVal(v.scaleY != null ? v.scaleY : v.scale, m1.scaleY),
                        scaleZ: _parseVal(v.scaleZ, m1.scaleZ),
                        x: _parseVal(v.x, m1.x),
                        y: _parseVal(v.y, m1.y),
                        z: _parseVal(v.z, m1.z),
                        xPercent: _parseVal(v.xPercent, m1.xPercent),
                        yPercent: _parseVal(v.yPercent, m1.yPercent),
                        perspective: _parseVal(v.transformPerspective, m1.perspective)
                    };
                    dr = v.directionalRotation;
                    if (dr != null) {
                        if (typeof dr === "object") {
                            for (copy in dr) {
                                v[copy] = dr[copy];
                            }
                        } else {
                            v.rotation = dr;
                        }
                    }
                    if (typeof v.x === "string" && v.x.indexOf("%") !== -1) {
                        m2.x = 0;
                        m2.xPercent = _parseVal(v.x, m1.xPercent);
                    }
                    if (typeof v.y === "string" && v.y.indexOf("%") !== -1) {
                        m2.y = 0;
                        m2.yPercent = _parseVal(v.y, m1.yPercent);
                    }
                    m2.rotation = _parseAngle("rotation" in v ? v.rotation : "shortRotation" in v ? v.shortRotation + "_short" : "rotationZ" in v ? v.rotationZ : m1.rotation, m1.rotation, "rotation", endRotations);
                    if (_supports3D) {
                        m2.rotationX = _parseAngle("rotationX" in v ? v.rotationX : "shortRotationX" in v ? v.shortRotationX + "_short" : m1.rotationX || 0, m1.rotationX, "rotationX", endRotations);
                        m2.rotationY = _parseAngle("rotationY" in v ? v.rotationY : "shortRotationY" in v ? v.shortRotationY + "_short" : m1.rotationY || 0, m1.rotationY, "rotationY", endRotations);
                    }
                    m2.skewX = v.skewX == null ? m1.skewX : _parseAngle(v.skewX, m1.skewX);
                    m2.skewY = v.skewY == null ? m1.skewY : _parseAngle(v.skewY, m1.skewY);
                    if (skewY = m2.skewY - m1.skewY) {
                        m2.skewX += skewY;
                        m2.rotation += skewY;
                    }
                }
                if (_supports3D && v.force3D != null) {
                    m1.force3D = v.force3D;
                    hasChange = true;
                }
                m1.skewType = v.skewType || m1.skewType || CSSPlugin.defaultSkewType;
                has3D = m1.force3D || m1.z || m1.rotationX || m1.rotationY || m2.z || m2.rotationX || m2.rotationY || m2.perspective;
                if (!has3D && v.scale != null) {
                    m2.scaleZ = 1;
                }
                while (--i > -1) {
                    p = _transformProps[i];
                    orig = m2[p] - m1[p];
                    if (orig > min || orig < -min || _forcePT[p] != null) {
                        hasChange = true;
                        pt = new CSSPropTween(m1, p, m1[p], orig, pt);
                        if (p in endRotations) {
                            pt.e = endRotations[p];
                        }
                        pt.xs0 = 0;
                        pt.plugin = plugin;
                        cssp._overwriteProps.push(pt.n);
                    }
                }
                orig = v.transformOrigin;
                if (orig || _supports3D && has3D && m1.zOrigin) {
                    if (_transformProp) {
                        hasChange = true;
                        p = _transformOriginProp;
                        orig = (orig || _getStyle(t, p, _cs, false, "50% 50%")) + "";
                        pt = new CSSPropTween(style, p, 0, 0, pt, -1, "transformOrigin");
                        pt.b = style[p];
                        pt.plugin = plugin;
                        if (_supports3D) {
                            copy = m1.zOrigin;
                            orig = orig.split(" ");
                            m1.zOrigin = (orig.length > 2 && !(copy !== 0 && orig[2] === "0px") ? parseFloat(orig[2]) : copy) || 0;
                            pt.xs0 = pt.e = orig[0] + " " + (orig[1] || "50%") + " 0px";
                            pt = new CSSPropTween(m1, "zOrigin", 0, 0, pt, -1, pt.n);
                            pt.b = copy;
                            pt.xs0 = pt.e = m1.zOrigin;
                        } else {
                            pt.xs0 = pt.e = orig;
                        }
                    } else {
                        _parsePosition(orig + "", m1);
                    }
                }
                if (hasChange) {
                    cssp._transformType = has3D || this._transformType === 3 ? 3 : 2;
                }
                return pt;
            },
            prefix: true
        });
        _registerComplexSpecialProp("boxShadow", {
            defaultValue: "0px 0px 0px 0px #999",
            prefix: true,
            color: true,
            multi: true,
            keyword: "inset"
        });
        _registerComplexSpecialProp("borderRadius", {
            defaultValue: "0px",
            parser: function(t, e, p, cssp, pt, plugin) {
                e = this.format(e);
                var props = [ "borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius" ], style = t.style, ea1, i, es2, bs2, bs, es, bn, en, w, h, esfx, bsfx, rel, hn, vn, em;
                w = parseFloat(t.offsetWidth);
                h = parseFloat(t.offsetHeight);
                ea1 = e.split(" ");
                for (i = 0; i < props.length; i++) {
                    if (this.p.indexOf("border")) {
                        props[i] = _checkPropPrefix(props[i]);
                    }
                    bs = bs2 = _getStyle(t, props[i], _cs, false, "0px");
                    if (bs.indexOf(" ") !== -1) {
                        bs2 = bs.split(" ");
                        bs = bs2[0];
                        bs2 = bs2[1];
                    }
                    es = es2 = ea1[i];
                    bn = parseFloat(bs);
                    bsfx = bs.substr((bn + "").length);
                    rel = es.charAt(1) === "=";
                    if (rel) {
                        en = parseInt(es.charAt(0) + "1", 10);
                        es = es.substr(2);
                        en *= parseFloat(es);
                        esfx = es.substr((en + "").length - (en < 0 ? 1 : 0)) || "";
                    } else {
                        en = parseFloat(es);
                        esfx = es.substr((en + "").length);
                    }
                    if (esfx === "") {
                        esfx = _suffixMap[p] || bsfx;
                    }
                    if (esfx !== bsfx) {
                        hn = _convertToPixels(t, "borderLeft", bn, bsfx);
                        vn = _convertToPixels(t, "borderTop", bn, bsfx);
                        if (esfx === "%") {
                            bs = hn / w * 100 + "%";
                            bs2 = vn / h * 100 + "%";
                        } else if (esfx === "em") {
                            em = _convertToPixels(t, "borderLeft", 1, "em");
                            bs = hn / em + "em";
                            bs2 = vn / em + "em";
                        } else {
                            bs = hn + "px";
                            bs2 = vn + "px";
                        }
                        if (rel) {
                            es = parseFloat(bs) + en + esfx;
                            es2 = parseFloat(bs2) + en + esfx;
                        }
                    }
                    pt = _parseComplex(style, props[i], bs + " " + bs2, es + " " + es2, false, "0px", pt);
                }
                return pt;
            },
            prefix: true,
            formatter: _getFormatter("0px 0px 0px 0px", false, true)
        });
        _registerComplexSpecialProp("backgroundPosition", {
            defaultValue: "0 0",
            parser: function(t, e, p, cssp, pt, plugin) {
                var bp = "background-position", cs = _cs || _getComputedStyle(t, null), bs = this.format((cs ? _ieVers ? cs.getPropertyValue(bp + "-x") + " " + cs.getPropertyValue(bp + "-y") : cs.getPropertyValue(bp) : t.currentStyle.backgroundPositionX + " " + t.currentStyle.backgroundPositionY) || "0 0"), es = this.format(e), ba, ea, i, pct, overlap, src;
                if (bs.indexOf("%") !== -1 !== (es.indexOf("%") !== -1)) {
                    src = _getStyle(t, "backgroundImage").replace(_urlExp, "");
                    if (src && src !== "none") {
                        ba = bs.split(" ");
                        ea = es.split(" ");
                        _tempImg.setAttribute("src", src);
                        i = 2;
                        while (--i > -1) {
                            bs = ba[i];
                            pct = bs.indexOf("%") !== -1;
                            if (pct !== (ea[i].indexOf("%") !== -1)) {
                                overlap = i === 0 ? t.offsetWidth - _tempImg.width : t.offsetHeight - _tempImg.height;
                                ba[i] = pct ? parseFloat(bs) / 100 * overlap + "px" : parseFloat(bs) / overlap * 100 + "%";
                            }
                        }
                        bs = ba.join(" ");
                    }
                }
                return this.parseComplex(t.style, bs, es, pt, plugin);
            },
            formatter: _parsePosition
        });
        _registerComplexSpecialProp("backgroundSize", {
            defaultValue: "0 0",
            formatter: _parsePosition
        });
        _registerComplexSpecialProp("perspective", {
            defaultValue: "0px",
            prefix: true
        });
        _registerComplexSpecialProp("perspectiveOrigin", {
            defaultValue: "50% 50%",
            prefix: true
        });
        _registerComplexSpecialProp("transformStyle", {
            prefix: true
        });
        _registerComplexSpecialProp("backfaceVisibility", {
            prefix: true
        });
        _registerComplexSpecialProp("userSelect", {
            prefix: true
        });
        _registerComplexSpecialProp("margin", {
            parser: _getEdgeParser("marginTop,marginRight,marginBottom,marginLeft")
        });
        _registerComplexSpecialProp("padding", {
            parser: _getEdgeParser("paddingTop,paddingRight,paddingBottom,paddingLeft")
        });
        _registerComplexSpecialProp("clip", {
            defaultValue: "rect(0px,0px,0px,0px)",
            parser: function(t, e, p, cssp, pt, plugin) {
                var b, cs, delim;
                if (_ieVers < 9) {
                    cs = t.currentStyle;
                    delim = _ieVers < 8 ? " " : ",";
                    b = "rect(" + cs.clipTop + delim + cs.clipRight + delim + cs.clipBottom + delim + cs.clipLeft + ")";
                    e = this.format(e).split(",").join(delim);
                } else {
                    b = this.format(_getStyle(t, this.p, _cs, false, this.dflt));
                    e = this.format(e);
                }
                return this.parseComplex(t.style, b, e, pt, plugin);
            }
        });
        _registerComplexSpecialProp("textShadow", {
            defaultValue: "0px 0px 0px #999",
            color: true,
            multi: true
        });
        _registerComplexSpecialProp("autoRound,strictUnits", {
            parser: function(t, e, p, cssp, pt) {
                return pt;
            }
        });
        _registerComplexSpecialProp("border", {
            defaultValue: "0px solid #000",
            parser: function(t, e, p, cssp, pt, plugin) {
                return this.parseComplex(t.style, this.format(_getStyle(t, "borderTopWidth", _cs, false, "0px") + " " + _getStyle(t, "borderTopStyle", _cs, false, "solid") + " " + _getStyle(t, "borderTopColor", _cs, false, "#000")), this.format(e), pt, plugin);
            },
            color: true,
            formatter: function(v) {
                var a = v.split(" ");
                return a[0] + " " + (a[1] || "solid") + " " + (v.match(_colorExp) || [ "#000" ])[0];
            }
        });
        _registerComplexSpecialProp("borderWidth", {
            parser: _getEdgeParser("borderTopWidth,borderRightWidth,borderBottomWidth,borderLeftWidth")
        });
        _registerComplexSpecialProp("float,cssFloat,styleFloat", {
            parser: function(t, e, p, cssp, pt, plugin) {
                var s = t.style, prop = "cssFloat" in s ? "cssFloat" : "styleFloat";
                return new CSSPropTween(s, prop, 0, 0, pt, -1, p, false, 0, s[prop], e);
            }
        });
        var _setIEOpacityRatio = function(v) {
            var t = this.t, filters = t.filter || _getStyle(this.data, "filter"), val = this.s + this.c * v | 0, skip;
            if (val === 100) {
                if (filters.indexOf("atrix(") === -1 && filters.indexOf("radient(") === -1 && filters.indexOf("oader(") === -1) {
                    t.removeAttribute("filter");
                    skip = !_getStyle(this.data, "filter");
                } else {
                    t.filter = filters.replace(_alphaFilterExp, "");
                    skip = true;
                }
            }
            if (!skip) {
                if (this.xn1) {
                    t.filter = filters = filters || "alpha(opacity=" + val + ")";
                }
                if (filters.indexOf("pacity") === -1) {
                    if (val !== 0 || !this.xn1) {
                        t.filter = filters + " alpha(opacity=" + val + ")";
                    }
                } else {
                    t.filter = filters.replace(_opacityExp, "opacity=" + val);
                }
            }
        };
        _registerComplexSpecialProp("opacity,alpha,autoAlpha", {
            defaultValue: "1",
            parser: function(t, e, p, cssp, pt, plugin) {
                var b = parseFloat(_getStyle(t, "opacity", _cs, false, "1")), style = t.style, isAutoAlpha = p === "autoAlpha";
                if (typeof e === "string" && e.charAt(1) === "=") {
                    e = (e.charAt(0) === "-" ? -1 : 1) * parseFloat(e.substr(2)) + b;
                }
                if (isAutoAlpha && b === 1 && _getStyle(t, "visibility", _cs) === "hidden" && e !== 0) {
                    b = 0;
                }
                if (_supportsOpacity) {
                    pt = new CSSPropTween(style, "opacity", b, e - b, pt);
                } else {
                    pt = new CSSPropTween(style, "opacity", b * 100, (e - b) * 100, pt);
                    pt.xn1 = isAutoAlpha ? 1 : 0;
                    style.zoom = 1;
                    pt.type = 2;
                    pt.b = "alpha(opacity=" + pt.s + ")";
                    pt.e = "alpha(opacity=" + (pt.s + pt.c) + ")";
                    pt.data = t;
                    pt.plugin = plugin;
                    pt.setRatio = _setIEOpacityRatio;
                }
                if (isAutoAlpha) {
                    pt = new CSSPropTween(style, "visibility", 0, 0, pt, -1, null, false, 0, b !== 0 ? "inherit" : "hidden", e === 0 ? "hidden" : "inherit");
                    pt.xs0 = "inherit";
                    cssp._overwriteProps.push(pt.n);
                    cssp._overwriteProps.push(p);
                }
                return pt;
            }
        });
        var _removeProp = function(s, p) {
            if (p) {
                if (s.removeProperty) {
                    if (p.substr(0, 2) === "ms") {
                        p = "M" + p.substr(1);
                    }
                    s.removeProperty(p.replace(_capsExp, "-$1").toLowerCase());
                } else {
                    s.removeAttribute(p);
                }
            }
        }, _setClassNameRatio = function(v) {
            this.t._gsClassPT = this;
            if (v === 1 || v === 0) {
                this.t.setAttribute("class", v === 0 ? this.b : this.e);
                var mpt = this.data, s = this.t.style;
                while (mpt) {
                    if (!mpt.v) {
                        _removeProp(s, mpt.p);
                    } else {
                        s[mpt.p] = mpt.v;
                    }
                    mpt = mpt._next;
                }
                if (v === 1 && this.t._gsClassPT === this) {
                    this.t._gsClassPT = null;
                }
            } else if (this.t.getAttribute("class") !== this.e) {
                this.t.setAttribute("class", this.e);
            }
        };
        _registerComplexSpecialProp("className", {
            parser: function(t, e, p, cssp, pt, plugin, vars) {
                var b = t.getAttribute("class") || "", cssText = t.style.cssText, difData, bs, cnpt, cnptLookup, mpt;
                pt = cssp._classNamePT = new CSSPropTween(t, p, 0, 0, pt, 2);
                pt.setRatio = _setClassNameRatio;
                pt.pr = -11;
                _hasPriority = true;
                pt.b = b;
                bs = _getAllStyles(t, _cs);
                cnpt = t._gsClassPT;
                if (cnpt) {
                    cnptLookup = {};
                    mpt = cnpt.data;
                    while (mpt) {
                        cnptLookup[mpt.p] = 1;
                        mpt = mpt._next;
                    }
                    cnpt.setRatio(1);
                }
                t._gsClassPT = pt;
                pt.e = e.charAt(1) !== "=" ? e : b.replace(new RegExp("\\s*\\b" + e.substr(2) + "\\b"), "") + (e.charAt(0) === "+" ? " " + e.substr(2) : "");
                if (cssp._tween._duration) {
                    t.setAttribute("class", pt.e);
                    difData = _cssDif(t, bs, _getAllStyles(t), vars, cnptLookup);
                    t.setAttribute("class", b);
                    pt.data = difData.firstMPT;
                    t.style.cssText = cssText;
                    pt = pt.xfirst = cssp.parse(t, difData.difs, pt, plugin);
                }
                return pt;
            }
        });
        var _setClearPropsRatio = function(v) {
            if (v === 1 || v === 0) if (this.data._totalTime === this.data._totalDuration && this.data.data !== "isFromStart") {
                var s = this.t.style, transformParse = _specialProps.transform.parse, a, p, i, clearTransform;
                if (this.e === "all") {
                    s.cssText = "";
                    clearTransform = true;
                } else {
                    a = this.e.split(",");
                    i = a.length;
                    while (--i > -1) {
                        p = a[i];
                        if (_specialProps[p]) {
                            if (_specialProps[p].parse === transformParse) {
                                clearTransform = true;
                            } else {
                                p = p === "transformOrigin" ? _transformOriginProp : _specialProps[p].p;
                            }
                        }
                        _removeProp(s, p);
                    }
                }
                if (clearTransform) {
                    _removeProp(s, _transformProp);
                    if (this.t._gsTransform) {
                        delete this.t._gsTransform;
                    }
                }
            }
        };
        _registerComplexSpecialProp("clearProps", {
            parser: function(t, e, p, cssp, pt) {
                pt = new CSSPropTween(t, p, 0, 0, pt, 2);
                pt.setRatio = _setClearPropsRatio;
                pt.e = e;
                pt.pr = -10;
                pt.data = cssp._tween;
                _hasPriority = true;
                return pt;
            }
        });
        p = "bezier,throwProps,physicsProps,physics2D".split(",");
        i = p.length;
        while (i--) {
            _registerPluginProp(p[i]);
        }
        p = CSSPlugin.prototype;
        p._firstPT = null;
        p._onInitTween = function(target, vars, tween) {
            if (!target.nodeType) {
                return false;
            }
            this._target = target;
            this._tween = tween;
            this._vars = vars;
            _autoRound = vars.autoRound;
            _hasPriority = false;
            _suffixMap = vars.suffixMap || CSSPlugin.suffixMap;
            _cs = _getComputedStyle(target, "");
            _overwriteProps = this._overwriteProps;
            var style = target.style, v, pt, pt2, first, last, next, zIndex, tpt, threeD;
            if (_reqSafariFix) if (style.zIndex === "") {
                v = _getStyle(target, "zIndex", _cs);
                if (v === "auto" || v === "") {
                    this._addLazySet(style, "zIndex", 0);
                }
            }
            if (typeof vars === "string") {
                first = style.cssText;
                v = _getAllStyles(target, _cs);
                style.cssText = first + ";" + vars;
                v = _cssDif(target, v, _getAllStyles(target)).difs;
                if (!_supportsOpacity && _opacityValExp.test(vars)) {
                    v.opacity = parseFloat(RegExp.$1);
                }
                vars = v;
                style.cssText = first;
            }
            this._firstPT = pt = this.parse(target, vars, null);
            if (this._transformType) {
                threeD = this._transformType === 3;
                if (!_transformProp) {
                    style.zoom = 1;
                } else if (_isSafari) {
                    _reqSafariFix = true;
                    if (style.zIndex === "") {
                        zIndex = _getStyle(target, "zIndex", _cs);
                        if (zIndex === "auto" || zIndex === "") {
                            this._addLazySet(style, "zIndex", 0);
                        }
                    }
                    if (_isSafariLT6) {
                        this._addLazySet(style, "WebkitBackfaceVisibility", this._vars.WebkitBackfaceVisibility || (threeD ? "visible" : "hidden"));
                    }
                }
                pt2 = pt;
                while (pt2 && pt2._next) {
                    pt2 = pt2._next;
                }
                tpt = new CSSPropTween(target, "transform", 0, 0, null, 2);
                this._linkCSSP(tpt, null, pt2);
                tpt.setRatio = threeD && _supports3D ? _set3DTransformRatio : _transformProp ? _set2DTransformRatio : _setIETransformRatio;
                tpt.data = this._transform || _getTransform(target, _cs, true);
                _overwriteProps.pop();
            }
            if (_hasPriority) {
                while (pt) {
                    next = pt._next;
                    pt2 = first;
                    while (pt2 && pt2.pr > pt.pr) {
                        pt2 = pt2._next;
                    }
                    if (pt._prev = pt2 ? pt2._prev : last) {
                        pt._prev._next = pt;
                    } else {
                        first = pt;
                    }
                    if (pt._next = pt2) {
                        pt2._prev = pt;
                    } else {
                        last = pt;
                    }
                    pt = next;
                }
                this._firstPT = first;
            }
            return true;
        };
        p.parse = function(target, vars, pt, plugin) {
            var style = target.style, p, sp, bn, en, bs, es, bsfx, esfx, isStr, rel;
            for (p in vars) {
                es = vars[p];
                sp = _specialProps[p];
                if (sp) {
                    pt = sp.parse(target, es, p, this, pt, plugin, vars);
                } else {
                    bs = _getStyle(target, p, _cs) + "";
                    isStr = typeof es === "string";
                    if (p === "color" || p === "fill" || p === "stroke" || p.indexOf("Color") !== -1 || isStr && _rgbhslExp.test(es)) {
                        if (!isStr) {
                            es = _parseColor(es);
                            es = (es.length > 3 ? "rgba(" : "rgb(") + es.join(",") + ")";
                        }
                        pt = _parseComplex(style, p, bs, es, true, "transparent", pt, 0, plugin);
                    } else if (isStr && (es.indexOf(" ") !== -1 || es.indexOf(",") !== -1)) {
                        pt = _parseComplex(style, p, bs, es, true, null, pt, 0, plugin);
                    } else {
                        bn = parseFloat(bs);
                        bsfx = bn || bn === 0 ? bs.substr((bn + "").length) : "";
                        if (bs === "" || bs === "auto") {
                            if (p === "width" || p === "height") {
                                bn = _getDimension(target, p, _cs);
                                bsfx = "px";
                            } else if (p === "left" || p === "top") {
                                bn = _calculateOffset(target, p, _cs);
                                bsfx = "px";
                            } else {
                                bn = p !== "opacity" ? 0 : 1;
                                bsfx = "";
                            }
                        }
                        rel = isStr && es.charAt(1) === "=";
                        if (rel) {
                            en = parseInt(es.charAt(0) + "1", 10);
                            es = es.substr(2);
                            en *= parseFloat(es);
                            esfx = es.replace(_suffixExp, "");
                        } else {
                            en = parseFloat(es);
                            esfx = isStr ? es.substr((en + "").length) || "" : "";
                        }
                        if (esfx === "") {
                            esfx = p in _suffixMap ? _suffixMap[p] : bsfx;
                        }
                        es = en || en === 0 ? (rel ? en + bn : en) + esfx : vars[p];
                        if (bsfx !== esfx) if (esfx !== "") if (en || en === 0) if (bn) {
                            bn = _convertToPixels(target, p, bn, bsfx);
                            if (esfx === "%") {
                                bn /= _convertToPixels(target, p, 100, "%") / 100;
                                if (vars.strictUnits !== true) {
                                    bs = bn + "%";
                                }
                            } else if (esfx === "em") {
                                bn /= _convertToPixels(target, p, 1, "em");
                            } else if (esfx !== "px") {
                                en = _convertToPixels(target, p, en, esfx);
                                esfx = "px";
                            }
                            if (rel) if (en || en === 0) {
                                es = en + bn + esfx;
                            }
                        }
                        if (rel) {
                            en += bn;
                        }
                        if ((bn || bn === 0) && (en || en === 0)) {
                            pt = new CSSPropTween(style, p, bn, en - bn, pt, 0, p, _autoRound !== false && (esfx === "px" || p === "zIndex"), 0, bs, es);
                            pt.xs0 = esfx;
                        } else if (style[p] === undefined || !es && (es + "" === "NaN" || es == null)) {
                            _log("invalid " + p + " tween value: " + vars[p]);
                        } else {
                            pt = new CSSPropTween(style, p, en || bn || 0, 0, pt, -1, p, false, 0, bs, es);
                            pt.xs0 = es === "none" && (p === "display" || p.indexOf("Style") !== -1) ? bs : es;
                        }
                    }
                }
                if (plugin) if (pt && !pt.plugin) {
                    pt.plugin = plugin;
                }
            }
            return pt;
        };
        p.setRatio = function(v) {
            var pt = this._firstPT, min = 1e-6, val, str, i;
            if (v === 1 && (this._tween._time === this._tween._duration || this._tween._time === 0)) {
                while (pt) {
                    if (pt.type !== 2) {
                        pt.t[pt.p] = pt.e;
                    } else {
                        pt.setRatio(v);
                    }
                    pt = pt._next;
                }
            } else if (v || !(this._tween._time === this._tween._duration || this._tween._time === 0) || this._tween._rawPrevTime === -1e-6) {
                while (pt) {
                    val = pt.c * v + pt.s;
                    if (pt.r) {
                        val = Math.round(val);
                    } else if (val < min) if (val > -min) {
                        val = 0;
                    }
                    if (!pt.type) {
                        pt.t[pt.p] = val + pt.xs0;
                    } else if (pt.type === 1) {
                        i = pt.l;
                        if (i === 2) {
                            pt.t[pt.p] = pt.xs0 + val + pt.xs1 + pt.xn1 + pt.xs2;
                        } else if (i === 3) {
                            pt.t[pt.p] = pt.xs0 + val + pt.xs1 + pt.xn1 + pt.xs2 + pt.xn2 + pt.xs3;
                        } else if (i === 4) {
                            pt.t[pt.p] = pt.xs0 + val + pt.xs1 + pt.xn1 + pt.xs2 + pt.xn2 + pt.xs3 + pt.xn3 + pt.xs4;
                        } else if (i === 5) {
                            pt.t[pt.p] = pt.xs0 + val + pt.xs1 + pt.xn1 + pt.xs2 + pt.xn2 + pt.xs3 + pt.xn3 + pt.xs4 + pt.xn4 + pt.xs5;
                        } else {
                            str = pt.xs0 + val + pt.xs1;
                            for (i = 1; i < pt.l; i++) {
                                str += pt["xn" + i] + pt["xs" + (i + 1)];
                            }
                            pt.t[pt.p] = str;
                        }
                    } else if (pt.type === -1) {
                        pt.t[pt.p] = pt.xs0;
                    } else if (pt.setRatio) {
                        pt.setRatio(v);
                    }
                    pt = pt._next;
                }
            } else {
                while (pt) {
                    if (pt.type !== 2) {
                        pt.t[pt.p] = pt.b;
                    } else {
                        pt.setRatio(v);
                    }
                    pt = pt._next;
                }
            }
        };
        p._enableTransforms = function(threeD) {
            this._transformType = threeD || this._transformType === 3 ? 3 : 2;
            this._transform = this._transform || _getTransform(this._target, _cs, true);
        };
        var lazySet = function(v) {
            this.t[this.p] = this.e;
            this.data._linkCSSP(this, this._next, null, true);
        };
        p._addLazySet = function(t, p, v) {
            var pt = this._firstPT = new CSSPropTween(t, p, 0, 0, this._firstPT, 2);
            pt.e = v;
            pt.setRatio = lazySet;
            pt.data = this;
        };
        p._linkCSSP = function(pt, next, prev, remove) {
            if (pt) {
                if (next) {
                    next._prev = pt;
                }
                if (pt._next) {
                    pt._next._prev = pt._prev;
                }
                if (pt._prev) {
                    pt._prev._next = pt._next;
                } else if (this._firstPT === pt) {
                    this._firstPT = pt._next;
                    remove = true;
                }
                if (prev) {
                    prev._next = pt;
                } else if (!remove && this._firstPT === null) {
                    this._firstPT = pt;
                }
                pt._next = next;
                pt._prev = prev;
            }
            return pt;
        };
        p._kill = function(lookup) {
            var copy = lookup, pt, p, xfirst;
            if (lookup.autoAlpha || lookup.alpha) {
                copy = {};
                for (p in lookup) {
                    copy[p] = lookup[p];
                }
                copy.opacity = 1;
                if (copy.autoAlpha) {
                    copy.visibility = 1;
                }
            }
            if (lookup.className && (pt = this._classNamePT)) {
                xfirst = pt.xfirst;
                if (xfirst && xfirst._prev) {
                    this._linkCSSP(xfirst._prev, pt._next, xfirst._prev._prev);
                } else if (xfirst === this._firstPT) {
                    this._firstPT = pt._next;
                }
                if (pt._next) {
                    this._linkCSSP(pt._next, pt._next._next, xfirst._prev);
                }
                this._classNamePT = null;
            }
            return TweenPlugin.prototype._kill.call(this, copy);
        };
        var _getChildStyles = function(e, props, targets) {
            var children, i, child, type;
            if (e.slice) {
                i = e.length;
                while (--i > -1) {
                    _getChildStyles(e[i], props, targets);
                }
                return;
            }
            children = e.childNodes;
            i = children.length;
            while (--i > -1) {
                child = children[i];
                type = child.type;
                if (child.style) {
                    props.push(_getAllStyles(child));
                    if (targets) {
                        targets.push(child);
                    }
                }
                if ((type === 1 || type === 9 || type === 11) && child.childNodes.length) {
                    _getChildStyles(child, props, targets);
                }
            }
        };
        CSSPlugin.cascadeTo = function(target, duration, vars) {
            var tween = TweenLite.to(target, duration, vars), results = [ tween ], b = [], e = [], targets = [], _reservedProps = TweenLite._internals.reservedProps, i, difs, p;
            target = tween._targets || tween.target;
            _getChildStyles(target, b, targets);
            tween.render(duration, true);
            _getChildStyles(target, e);
            tween.render(0, true);
            tween._enabled(true);
            i = targets.length;
            while (--i > -1) {
                difs = _cssDif(targets[i], b[i], e[i]);
                if (difs.firstMPT) {
                    difs = difs.difs;
                    for (p in vars) {
                        if (_reservedProps[p]) {
                            difs[p] = vars[p];
                        }
                    }
                    results.push(TweenLite.to(targets[i], duration, difs));
                }
            }
            return results;
        };
        TweenPlugin.activate([ CSSPlugin ]);
        return CSSPlugin;
    }, true);
});

if (_gsScope._gsDefine) {
    _gsScope._gsQueue.pop()();
}

(function(name) {
    "use strict";
    var getGlobal = function() {
        return (_gsScope.GreenSockGlobals || _gsScope)[name];
    };
    if (typeof define === "function" && define.amd) {
        define([ "TweenLite" ], getGlobal);
    } else if (typeof module !== "undefined" && module.exports) {
        require("../TweenLite.js");
        module.exports = getGlobal();
    }
})("CSSPlugin");

var _gsScope = typeof module !== "undefined" && module.exports && typeof global !== "undefined" ? global : this || window;

(_gsScope._gsQueue || (_gsScope._gsQueue = [])).push(function() {
    "use strict";
    _gsScope._gsDefine("easing.Back", [ "easing.Ease" ], function(Ease) {
        var w = _gsScope.GreenSockGlobals || _gsScope, gs = w.com.greensock, _2PI = Math.PI * 2, _HALF_PI = Math.PI / 2, _class = gs._class, _create = function(n, f) {
            var C = _class("easing." + n, function() {}, true), p = C.prototype = new Ease();
            p.constructor = C;
            p.getRatio = f;
            return C;
        }, _easeReg = Ease.register || function() {}, _wrap = function(name, EaseOut, EaseIn, EaseInOut, aliases) {
            var C = _class("easing." + name, {
                easeOut: new EaseOut(),
                easeIn: new EaseIn(),
                easeInOut: new EaseInOut()
            }, true);
            _easeReg(C, name);
            return C;
        }, EasePoint = function(time, value, next) {
            this.t = time;
            this.v = value;
            if (next) {
                this.next = next;
                next.prev = this;
                this.c = next.v - value;
                this.gap = next.t - time;
            }
        }, _createBack = function(n, f) {
            var C = _class("easing." + n, function(overshoot) {
                this._p1 = overshoot || overshoot === 0 ? overshoot : 1.70158;
                this._p2 = this._p1 * 1.525;
            }, true), p = C.prototype = new Ease();
            p.constructor = C;
            p.getRatio = f;
            p.config = function(overshoot) {
                return new C(overshoot);
            };
            return C;
        }, Back = _wrap("Back", _createBack("BackOut", function(p) {
            return (p = p - 1) * p * ((this._p1 + 1) * p + this._p1) + 1;
        }), _createBack("BackIn", function(p) {
            return p * p * ((this._p1 + 1) * p - this._p1);
        }), _createBack("BackInOut", function(p) {
            return (p *= 2) < 1 ? .5 * p * p * ((this._p2 + 1) * p - this._p2) : .5 * ((p -= 2) * p * ((this._p2 + 1) * p + this._p2) + 2);
        })), SlowMo = _class("easing.SlowMo", function(linearRatio, power, yoyoMode) {
            power = power || power === 0 ? power : .7;
            if (linearRatio == null) {
                linearRatio = .7;
            } else if (linearRatio > 1) {
                linearRatio = 1;
            }
            this._p = linearRatio !== 1 ? power : 0;
            this._p1 = (1 - linearRatio) / 2;
            this._p2 = linearRatio;
            this._p3 = this._p1 + this._p2;
            this._calcEnd = yoyoMode === true;
        }, true), p = SlowMo.prototype = new Ease(), SteppedEase, RoughEase, _createElastic;
        p.constructor = SlowMo;
        p.getRatio = function(p) {
            var r = p + (.5 - p) * this._p;
            if (p < this._p1) {
                return this._calcEnd ? 1 - (p = 1 - p / this._p1) * p : r - (p = 1 - p / this._p1) * p * p * p * r;
            } else if (p > this._p3) {
                return this._calcEnd ? 1 - (p = (p - this._p3) / this._p1) * p : r + (p - r) * (p = (p - this._p3) / this._p1) * p * p * p;
            }
            return this._calcEnd ? 1 : r;
        };
        SlowMo.ease = new SlowMo(.7, .7);
        p.config = SlowMo.config = function(linearRatio, power, yoyoMode) {
            return new SlowMo(linearRatio, power, yoyoMode);
        };
        SteppedEase = _class("easing.SteppedEase", function(steps) {
            steps = steps || 1;
            this._p1 = 1 / steps;
            this._p2 = steps + 1;
        }, true);
        p = SteppedEase.prototype = new Ease();
        p.constructor = SteppedEase;
        p.getRatio = function(p) {
            if (p < 0) {
                p = 0;
            } else if (p >= 1) {
                p = .999999999;
            }
            return (this._p2 * p >> 0) * this._p1;
        };
        p.config = SteppedEase.config = function(steps) {
            return new SteppedEase(steps);
        };
        RoughEase = _class("easing.RoughEase", function(vars) {
            vars = vars || {};
            var taper = vars.taper || "none", a = [], cnt = 0, points = (vars.points || 20) | 0, i = points, randomize = vars.randomize !== false, clamp = vars.clamp === true, template = vars.template instanceof Ease ? vars.template : null, strength = typeof vars.strength === "number" ? vars.strength * .4 : .4, x, y, bump, invX, obj, pnt;
            while (--i > -1) {
                x = randomize ? Math.random() : 1 / points * i;
                y = template ? template.getRatio(x) : x;
                if (taper === "none") {
                    bump = strength;
                } else if (taper === "out") {
                    invX = 1 - x;
                    bump = invX * invX * strength;
                } else if (taper === "in") {
                    bump = x * x * strength;
                } else if (x < .5) {
                    invX = x * 2;
                    bump = invX * invX * .5 * strength;
                } else {
                    invX = (1 - x) * 2;
                    bump = invX * invX * .5 * strength;
                }
                if (randomize) {
                    y += Math.random() * bump - bump * .5;
                } else if (i % 2) {
                    y += bump * .5;
                } else {
                    y -= bump * .5;
                }
                if (clamp) {
                    if (y > 1) {
                        y = 1;
                    } else if (y < 0) {
                        y = 0;
                    }
                }
                a[cnt++] = {
                    x: x,
                    y: y
                };
            }
            a.sort(function(a, b) {
                return a.x - b.x;
            });
            pnt = new EasePoint(1, 1, null);
            i = points;
            while (--i > -1) {
                obj = a[i];
                pnt = new EasePoint(obj.x, obj.y, pnt);
            }
            this._prev = new EasePoint(0, 0, pnt.t !== 0 ? pnt : pnt.next);
        }, true);
        p = RoughEase.prototype = new Ease();
        p.constructor = RoughEase;
        p.getRatio = function(p) {
            var pnt = this._prev;
            if (p > pnt.t) {
                while (pnt.next && p >= pnt.t) {
                    pnt = pnt.next;
                }
                pnt = pnt.prev;
            } else {
                while (pnt.prev && p <= pnt.t) {
                    pnt = pnt.prev;
                }
            }
            this._prev = pnt;
            return pnt.v + (p - pnt.t) / pnt.gap * pnt.c;
        };
        p.config = function(vars) {
            return new RoughEase(vars);
        };
        RoughEase.ease = new RoughEase();
        _wrap("Bounce", _create("BounceOut", function(p) {
            if (p < 1 / 2.75) {
                return 7.5625 * p * p;
            } else if (p < 2 / 2.75) {
                return 7.5625 * (p -= 1.5 / 2.75) * p + .75;
            } else if (p < 2.5 / 2.75) {
                return 7.5625 * (p -= 2.25 / 2.75) * p + .9375;
            }
            return 7.5625 * (p -= 2.625 / 2.75) * p + .984375;
        }), _create("BounceIn", function(p) {
            if ((p = 1 - p) < 1 / 2.75) {
                return 1 - 7.5625 * p * p;
            } else if (p < 2 / 2.75) {
                return 1 - (7.5625 * (p -= 1.5 / 2.75) * p + .75);
            } else if (p < 2.5 / 2.75) {
                return 1 - (7.5625 * (p -= 2.25 / 2.75) * p + .9375);
            }
            return 1 - (7.5625 * (p -= 2.625 / 2.75) * p + .984375);
        }), _create("BounceInOut", function(p) {
            var invert = p < .5;
            if (invert) {
                p = 1 - p * 2;
            } else {
                p = p * 2 - 1;
            }
            if (p < 1 / 2.75) {
                p = 7.5625 * p * p;
            } else if (p < 2 / 2.75) {
                p = 7.5625 * (p -= 1.5 / 2.75) * p + .75;
            } else if (p < 2.5 / 2.75) {
                p = 7.5625 * (p -= 2.25 / 2.75) * p + .9375;
            } else {
                p = 7.5625 * (p -= 2.625 / 2.75) * p + .984375;
            }
            return invert ? (1 - p) * .5 : p * .5 + .5;
        }));
        _wrap("Circ", _create("CircOut", function(p) {
            return Math.sqrt(1 - (p = p - 1) * p);
        }), _create("CircIn", function(p) {
            return -(Math.sqrt(1 - p * p) - 1);
        }), _create("CircInOut", function(p) {
            return (p *= 2) < 1 ? -.5 * (Math.sqrt(1 - p * p) - 1) : .5 * (Math.sqrt(1 - (p -= 2) * p) + 1);
        }));
        _createElastic = function(n, f, def) {
            var C = _class("easing." + n, function(amplitude, period) {
                this._p1 = amplitude || 1;
                this._p2 = period || def;
                this._p3 = this._p2 / _2PI * (Math.asin(1 / this._p1) || 0);
            }, true), p = C.prototype = new Ease();
            p.constructor = C;
            p.getRatio = f;
            p.config = function(amplitude, period) {
                return new C(amplitude, period);
            };
            return C;
        };
        _wrap("Elastic", _createElastic("ElasticOut", function(p) {
            return this._p1 * Math.pow(2, -10 * p) * Math.sin((p - this._p3) * _2PI / this._p2) + 1;
        }, .3), _createElastic("ElasticIn", function(p) {
            return -(this._p1 * Math.pow(2, 10 * (p -= 1)) * Math.sin((p - this._p3) * _2PI / this._p2));
        }, .3), _createElastic("ElasticInOut", function(p) {
            return (p *= 2) < 1 ? -.5 * (this._p1 * Math.pow(2, 10 * (p -= 1)) * Math.sin((p - this._p3) * _2PI / this._p2)) : this._p1 * Math.pow(2, -10 * (p -= 1)) * Math.sin((p - this._p3) * _2PI / this._p2) * .5 + 1;
        }, .45));
        _wrap("Expo", _create("ExpoOut", function(p) {
            return 1 - Math.pow(2, -10 * p);
        }), _create("ExpoIn", function(p) {
            return Math.pow(2, 10 * (p - 1)) - .001;
        }), _create("ExpoInOut", function(p) {
            return (p *= 2) < 1 ? .5 * Math.pow(2, 10 * (p - 1)) : .5 * (2 - Math.pow(2, -10 * (p - 1)));
        }));
        _wrap("Sine", _create("SineOut", function(p) {
            return Math.sin(p * _HALF_PI);
        }), _create("SineIn", function(p) {
            return -Math.cos(p * _HALF_PI) + 1;
        }), _create("SineInOut", function(p) {
            return -.5 * (Math.cos(Math.PI * p) - 1);
        }));
        _class("easing.EaseLookup", {
            find: function(s) {
                return Ease.map[s];
            }
        }, true);
        _easeReg(w.SlowMo, "SlowMo", "ease,");
        _easeReg(RoughEase, "RoughEase", "ease,");
        _easeReg(SteppedEase, "SteppedEase", "ease,");
        return Back;
    }, true);
});

if (_gsScope._gsDefine) {
    _gsScope._gsQueue.pop()();
}

var _gsScope = typeof module !== "undefined" && module.exports && typeof global !== "undefined" ? global : this || window;

(_gsScope._gsQueue || (_gsScope._gsQueue = [])).push(function() {
    "use strict";
    var _doc = document.documentElement, _window = window, _max = function(element, axis) {
        var dim = axis === "x" ? "Width" : "Height", scroll = "scroll" + dim, client = "client" + dim, body = document.body;
        return element === _window || element === _doc || element === body ? Math.max(_doc[scroll], body[scroll]) - (_window["inner" + dim] || Math.max(_doc[client], body[client])) : element[scroll] - element["offset" + dim];
    }, ScrollToPlugin = _gsScope._gsDefine.plugin({
        propName: "scrollTo",
        API: 2,
        version: "1.7.4",
        init: function(target, value, tween) {
            this._wdw = target === _window;
            this._target = target;
            this._tween = tween;
            if (typeof value !== "object") {
                value = {
                    y: value
                };
            }
            this.vars = value;
            this._autoKill = value.autoKill !== false;
            this.x = this.xPrev = this.getX();
            this.y = this.yPrev = this.getY();
            if (value.x != null) {
                this._addTween(this, "x", this.x, value.x === "max" ? _max(target, "x") : value.x, "scrollTo_x", true);
                this._overwriteProps.push("scrollTo_x");
            } else {
                this.skipX = true;
            }
            if (value.y != null) {
                this._addTween(this, "y", this.y, value.y === "max" ? _max(target, "y") : value.y, "scrollTo_y", true);
                this._overwriteProps.push("scrollTo_y");
            } else {
                this.skipY = true;
            }
            return true;
        },
        set: function(v) {
            this._super.setRatio.call(this, v);
            var x = this._wdw || !this.skipX ? this.getX() : this.xPrev, y = this._wdw || !this.skipY ? this.getY() : this.yPrev, yDif = y - this.yPrev, xDif = x - this.xPrev;
            if (this._autoKill) {
                if (!this.skipX && (xDif > 7 || xDif < -7) && x < _max(this._target, "x")) {
                    this.skipX = true;
                }
                if (!this.skipY && (yDif > 7 || yDif < -7) && y < _max(this._target, "y")) {
                    this.skipY = true;
                }
                if (this.skipX && this.skipY) {
                    this._tween.kill();
                    if (this.vars.onAutoKill) {
                        this.vars.onAutoKill.apply(this.vars.onAutoKillScope || this._tween, this.vars.onAutoKillParams || []);
                    }
                }
            }
            if (this._wdw) {
                _window.scrollTo(!this.skipX ? this.x : x, !this.skipY ? this.y : y);
            } else {
                if (!this.skipY) {
                    this._target.scrollTop = this.y;
                }
                if (!this.skipX) {
                    this._target.scrollLeft = this.x;
                }
            }
            this.xPrev = this.x;
            this.yPrev = this.y;
        }
    }), p = ScrollToPlugin.prototype;
    ScrollToPlugin.max = _max;
    p.getX = function() {
        return !this._wdw ? this._target.scrollLeft : _window.pageXOffset != null ? _window.pageXOffset : _doc.scrollLeft != null ? _doc.scrollLeft : document.body.scrollLeft;
    };
    p.getY = function() {
        return !this._wdw ? this._target.scrollTop : _window.pageYOffset != null ? _window.pageYOffset : _doc.scrollTop != null ? _doc.scrollTop : document.body.scrollTop;
    };
    p._kill = function(lookup) {
        if (lookup.scrollTo_x) {
            this.skipX = true;
        }
        if (lookup.scrollTo_y) {
            this.skipY = true;
        }
        return this._super._kill.call(this, lookup);
    };
});

if (_gsScope._gsDefine) {
    _gsScope._gsQueue.pop()();
}

(function(window, moduleName) {
    "use strict";
    var _globals = window.GreenSockGlobals = window.GreenSockGlobals || window;
    if (_globals.TweenLite) {
        return;
    }
    var _namespace = function(ns) {
        var a = ns.split("."), p = _globals, i;
        for (i = 0; i < a.length; i++) {
            p[a[i]] = p = p[a[i]] || {};
        }
        return p;
    }, gs = _namespace("com.greensock"), _tinyNum = 1e-10, _slice = function(a) {
        var b = [], l = a.length, i;
        for (i = 0; i !== l; b.push(a[i++])) ;
        return b;
    }, _emptyFunc = function() {}, _isArray = function() {
        var toString = Object.prototype.toString, array = toString.call([]);
        return function(obj) {
            return obj != null && (obj instanceof Array || typeof obj === "object" && !!obj.push && toString.call(obj) === array);
        };
    }(), a, i, p, _ticker, _tickerActive, _defLookup = {}, Definition = function(ns, dependencies, func, global) {
        this.sc = _defLookup[ns] ? _defLookup[ns].sc : [];
        _defLookup[ns] = this;
        this.gsClass = null;
        this.func = func;
        var _classes = [];
        this.check = function(init) {
            var i = dependencies.length, missing = i, cur, a, n, cl;
            while (--i > -1) {
                if ((cur = _defLookup[dependencies[i]] || new Definition(dependencies[i], [])).gsClass) {
                    _classes[i] = cur.gsClass;
                    missing--;
                } else if (init) {
                    cur.sc.push(this);
                }
            }
            if (missing === 0 && func) {
                a = ("com.greensock." + ns).split(".");
                n = a.pop();
                cl = _namespace(a.join("."))[n] = this.gsClass = func.apply(func, _classes);
                if (global) {
                    _globals[n] = cl;
                    if (typeof define === "function" && define.amd) {
                        define((window.GreenSockAMDPath ? window.GreenSockAMDPath + "/" : "") + ns.split(".").pop(), [], function() {
                            return cl;
                        });
                    } else if (ns === moduleName && typeof module !== "undefined" && module.exports) {
                        module.exports = cl;
                    }
                }
                for (i = 0; i < this.sc.length; i++) {
                    this.sc[i].check();
                }
            }
        };
        this.check(true);
    }, _gsDefine = window._gsDefine = function(ns, dependencies, func, global) {
        return new Definition(ns, dependencies, func, global);
    }, _class = gs._class = function(ns, func, global) {
        func = func || function() {};
        _gsDefine(ns, [], function() {
            return func;
        }, global);
        return func;
    };
    _gsDefine.globals = _globals;
    var _baseParams = [ 0, 0, 1, 1 ], _blankArray = [], Ease = _class("easing.Ease", function(func, extraParams, type, power) {
        this._func = func;
        this._type = type || 0;
        this._power = power || 0;
        this._params = extraParams ? _baseParams.concat(extraParams) : _baseParams;
    }, true), _easeMap = Ease.map = {}, _easeReg = Ease.register = function(ease, names, types, create) {
        var na = names.split(","), i = na.length, ta = (types || "easeIn,easeOut,easeInOut").split(","), e, name, j, type;
        while (--i > -1) {
            name = na[i];
            e = create ? _class("easing." + name, null, true) : gs.easing[name] || {};
            j = ta.length;
            while (--j > -1) {
                type = ta[j];
                _easeMap[name + "." + type] = _easeMap[type + name] = e[type] = ease.getRatio ? ease : ease[type] || new ease();
            }
        }
    };
    p = Ease.prototype;
    p._calcEnd = false;
    p.getRatio = function(p) {
        if (this._func) {
            this._params[0] = p;
            return this._func.apply(null, this._params);
        }
        var t = this._type, pw = this._power, r = t === 1 ? 1 - p : t === 2 ? p : p < .5 ? p * 2 : (1 - p) * 2;
        if (pw === 1) {
            r *= r;
        } else if (pw === 2) {
            r *= r * r;
        } else if (pw === 3) {
            r *= r * r * r;
        } else if (pw === 4) {
            r *= r * r * r * r;
        }
        return t === 1 ? 1 - r : t === 2 ? r : p < .5 ? r / 2 : 1 - r / 2;
    };
    a = [ "Linear", "Quad", "Cubic", "Quart", "Quint,Strong" ];
    i = a.length;
    while (--i > -1) {
        p = a[i] + ",Power" + i;
        _easeReg(new Ease(null, null, 1, i), p, "easeOut", true);
        _easeReg(new Ease(null, null, 2, i), p, "easeIn" + (i === 0 ? ",easeNone" : ""));
        _easeReg(new Ease(null, null, 3, i), p, "easeInOut");
    }
    _easeMap.linear = gs.easing.Linear.easeIn;
    _easeMap.swing = gs.easing.Quad.easeInOut;
    var EventDispatcher = _class("events.EventDispatcher", function(target) {
        this._listeners = {};
        this._eventTarget = target || this;
    });
    p = EventDispatcher.prototype;
    p.addEventListener = function(type, callback, scope, useParam, priority) {
        priority = priority || 0;
        var list = this._listeners[type], index = 0, listener, i;
        if (list == null) {
            this._listeners[type] = list = [];
        }
        i = list.length;
        while (--i > -1) {
            listener = list[i];
            if (listener.c === callback && listener.s === scope) {
                list.splice(i, 1);
            } else if (index === 0 && listener.pr < priority) {
                index = i + 1;
            }
        }
        list.splice(index, 0, {
            c: callback,
            s: scope,
            up: useParam,
            pr: priority
        });
        if (this === _ticker && !_tickerActive) {
            _ticker.wake();
        }
    };
    p.removeEventListener = function(type, callback) {
        var list = this._listeners[type], i;
        if (list) {
            i = list.length;
            while (--i > -1) {
                if (list[i].c === callback) {
                    list.splice(i, 1);
                    return;
                }
            }
        }
    };
    p.dispatchEvent = function(type) {
        var list = this._listeners[type], i, t, listener;
        if (list) {
            i = list.length;
            t = this._eventTarget;
            while (--i > -1) {
                listener = list[i];
                if (listener.up) {
                    listener.c.call(listener.s || t, {
                        type: type,
                        target: t
                    });
                } else {
                    listener.c.call(listener.s || t);
                }
            }
        }
    };
    var _reqAnimFrame = window.requestAnimationFrame, _cancelAnimFrame = window.cancelAnimationFrame, _getTime = Date.now || function() {
        return new Date().getTime();
    }, _lastUpdate = _getTime();
    a = [ "ms", "moz", "webkit", "o" ];
    i = a.length;
    while (--i > -1 && !_reqAnimFrame) {
        _reqAnimFrame = window[a[i] + "RequestAnimationFrame"];
        _cancelAnimFrame = window[a[i] + "CancelAnimationFrame"] || window[a[i] + "CancelRequestAnimationFrame"];
    }
    _class("Ticker", function(fps, useRAF) {
        var _self = this, _startTime = _getTime(), _useRAF = useRAF !== false && _reqAnimFrame, _lagThreshold = 500, _adjustedLag = 33, _fps, _req, _id, _gap, _nextTime, _tick = function(manual) {
            var elapsed = _getTime() - _lastUpdate, overlap, dispatch;
            if (elapsed > _lagThreshold) {
                _startTime += elapsed - _adjustedLag;
            }
            _lastUpdate += elapsed;
            _self.time = (_lastUpdate - _startTime) / 1e3;
            overlap = _self.time - _nextTime;
            if (!_fps || overlap > 0 || manual === true) {
                _self.frame++;
                _nextTime += overlap + (overlap >= _gap ? .004 : _gap - overlap);
                dispatch = true;
            }
            if (manual !== true) {
                _id = _req(_tick);
            }
            if (dispatch) {
                _self.dispatchEvent("tick");
            }
        };
        EventDispatcher.call(_self);
        _self.time = _self.frame = 0;
        _self.tick = function() {
            _tick(true);
        };
        _self.lagSmoothing = function(threshold, adjustedLag) {
            _lagThreshold = threshold || 1 / _tinyNum;
            _adjustedLag = Math.min(adjustedLag, _lagThreshold, 0);
        };
        _self.sleep = function() {
            if (_id == null) {
                return;
            }
            if (!_useRAF || !_cancelAnimFrame) {
                clearTimeout(_id);
            } else {
                _cancelAnimFrame(_id);
            }
            _req = _emptyFunc;
            _id = null;
            if (_self === _ticker) {
                _tickerActive = false;
            }
        };
        _self.wake = function() {
            if (_id !== null) {
                _self.sleep();
            } else if (_self.frame > 10) {
                _lastUpdate = _getTime() - _lagThreshold + 5;
            }
            _req = _fps === 0 ? _emptyFunc : !_useRAF || !_reqAnimFrame ? function(f) {
                return setTimeout(f, (_nextTime - _self.time) * 1e3 + 1 | 0);
            } : _reqAnimFrame;
            if (_self === _ticker) {
                _tickerActive = true;
            }
            _tick(2);
        };
        _self.fps = function(value) {
            if (!arguments.length) {
                return _fps;
            }
            _fps = value;
            _gap = 1 / (_fps || 60);
            _nextTime = this.time + _gap;
            _self.wake();
        };
        _self.useRAF = function(value) {
            if (!arguments.length) {
                return _useRAF;
            }
            _self.sleep();
            _useRAF = value;
            _self.fps(_fps);
        };
        _self.fps(fps);
        setTimeout(function() {
            if (_useRAF && (!_id || _self.frame < 5)) {
                _self.useRAF(false);
            }
        }, 1500);
    });
    p = gs.Ticker.prototype = new gs.events.EventDispatcher();
    p.constructor = gs.Ticker;
    var Animation = _class("core.Animation", function(duration, vars) {
        this.vars = vars = vars || {};
        this._duration = this._totalDuration = duration || 0;
        this._delay = Number(vars.delay) || 0;
        this._timeScale = 1;
        this._active = vars.immediateRender === true;
        this.data = vars.data;
        this._reversed = vars.reversed === true;
        if (!_rootTimeline) {
            return;
        }
        if (!_tickerActive) {
            _ticker.wake();
        }
        var tl = this.vars.useFrames ? _rootFramesTimeline : _rootTimeline;
        tl.add(this, tl._time);
        if (this.vars.paused) {
            this.paused(true);
        }
    });
    _ticker = Animation.ticker = new gs.Ticker();
    p = Animation.prototype;
    p._dirty = p._gc = p._initted = p._paused = false;
    p._totalTime = p._time = 0;
    p._rawPrevTime = -1;
    p._next = p._last = p._onUpdate = p._timeline = p.timeline = null;
    p._paused = false;
    var _checkTimeout = function() {
        if (_tickerActive && _getTime() - _lastUpdate > 2e3) {
            _ticker.wake();
        }
        setTimeout(_checkTimeout, 2e3);
    };
    _checkTimeout();
    p.play = function(from, suppressEvents) {
        if (from != null) {
            this.seek(from, suppressEvents);
        }
        return this.reversed(false).paused(false);
    };
    p.pause = function(atTime, suppressEvents) {
        if (atTime != null) {
            this.seek(atTime, suppressEvents);
        }
        return this.paused(true);
    };
    p.resume = function(from, suppressEvents) {
        if (from != null) {
            this.seek(from, suppressEvents);
        }
        return this.paused(false);
    };
    p.seek = function(time, suppressEvents) {
        return this.totalTime(Number(time), suppressEvents !== false);
    };
    p.restart = function(includeDelay, suppressEvents) {
        return this.reversed(false).paused(false).totalTime(includeDelay ? -this._delay : 0, suppressEvents !== false, true);
    };
    p.reverse = function(from, suppressEvents) {
        if (from != null) {
            this.seek(from || this.totalDuration(), suppressEvents);
        }
        return this.reversed(true).paused(false);
    };
    p.render = function(time, suppressEvents, force) {};
    p.invalidate = function() {
        return this;
    };
    p.isActive = function() {
        var tl = this._timeline, startTime = this._startTime, rawTime;
        return !tl || !this._gc && !this._paused && tl.isActive() && (rawTime = tl.rawTime()) >= startTime && rawTime < startTime + this.totalDuration() / this._timeScale;
    };
    p._enabled = function(enabled, ignoreTimeline) {
        if (!_tickerActive) {
            _ticker.wake();
        }
        this._gc = !enabled;
        this._active = this.isActive();
        if (ignoreTimeline !== true) {
            if (enabled && !this.timeline) {
                this._timeline.add(this, this._startTime - this._delay);
            } else if (!enabled && this.timeline) {
                this._timeline._remove(this, true);
            }
        }
        return false;
    };
    p._kill = function(vars, target) {
        return this._enabled(false, false);
    };
    p.kill = function(vars, target) {
        this._kill(vars, target);
        return this;
    };
    p._uncache = function(includeSelf) {
        var tween = includeSelf ? this : this.timeline;
        while (tween) {
            tween._dirty = true;
            tween = tween.timeline;
        }
        return this;
    };
    p._swapSelfInParams = function(params) {
        var i = params.length, copy = params.concat();
        while (--i > -1) {
            if (params[i] === "{self}") {
                copy[i] = this;
            }
        }
        return copy;
    };
    p.eventCallback = function(type, callback, params, scope) {
        if ((type || "").substr(0, 2) === "on") {
            var v = this.vars;
            if (arguments.length === 1) {
                return v[type];
            }
            if (callback == null) {
                delete v[type];
            } else {
                v[type] = callback;
                v[type + "Params"] = _isArray(params) && params.join("").indexOf("{self}") !== -1 ? this._swapSelfInParams(params) : params;
                v[type + "Scope"] = scope;
            }
            if (type === "onUpdate") {
                this._onUpdate = callback;
            }
        }
        return this;
    };
    p.delay = function(value) {
        if (!arguments.length) {
            return this._delay;
        }
        if (this._timeline.smoothChildTiming) {
            this.startTime(this._startTime + value - this._delay);
        }
        this._delay = value;
        return this;
    };
    p.duration = function(value) {
        if (!arguments.length) {
            this._dirty = false;
            return this._duration;
        }
        this._duration = this._totalDuration = value;
        this._uncache(true);
        if (this._timeline.smoothChildTiming) if (this._time > 0) if (this._time < this._duration) if (value !== 0) {
            this.totalTime(this._totalTime * (value / this._duration), true);
        }
        return this;
    };
    p.totalDuration = function(value) {
        this._dirty = false;
        return !arguments.length ? this._totalDuration : this.duration(value);
    };
    p.time = function(value, suppressEvents) {
        if (!arguments.length) {
            return this._time;
        }
        if (this._dirty) {
            this.totalDuration();
        }
        return this.totalTime(value > this._duration ? this._duration : value, suppressEvents);
    };
    p.totalTime = function(time, suppressEvents, uncapped) {
        if (!_tickerActive) {
            _ticker.wake();
        }
        if (!arguments.length) {
            return this._totalTime;
        }
        if (this._timeline) {
            if (time < 0 && !uncapped) {
                time += this.totalDuration();
            }
            if (this._timeline.smoothChildTiming) {
                if (this._dirty) {
                    this.totalDuration();
                }
                var totalDuration = this._totalDuration, tl = this._timeline;
                if (time > totalDuration && !uncapped) {
                    time = totalDuration;
                }
                this._startTime = (this._paused ? this._pauseTime : tl._time) - (!this._reversed ? time : totalDuration - time) / this._timeScale;
                if (!tl._dirty) {
                    this._uncache(false);
                }
                if (tl._timeline) {
                    while (tl._timeline) {
                        if (tl._timeline._time !== (tl._startTime + tl._totalTime) / tl._timeScale) {
                            tl.totalTime(tl._totalTime, true);
                        }
                        tl = tl._timeline;
                    }
                }
            }
            if (this._gc) {
                this._enabled(true, false);
            }
            if (this._totalTime !== time || this._duration === 0) {
                this.render(time, suppressEvents, false);
                if (_lazyTweens.length) {
                    _lazyRender();
                }
            }
        }
        return this;
    };
    p.progress = p.totalProgress = function(value, suppressEvents) {
        return !arguments.length ? this._time / this.duration() : this.totalTime(this.duration() * value, suppressEvents);
    };
    p.startTime = function(value) {
        if (!arguments.length) {
            return this._startTime;
        }
        if (value !== this._startTime) {
            this._startTime = value;
            if (this.timeline) if (this.timeline._sortChildren) {
                this.timeline.add(this, value - this._delay);
            }
        }
        return this;
    };
    p.timeScale = function(value) {
        if (!arguments.length) {
            return this._timeScale;
        }
        value = value || _tinyNum;
        if (this._timeline && this._timeline.smoothChildTiming) {
            var pauseTime = this._pauseTime, t = pauseTime || pauseTime === 0 ? pauseTime : this._timeline.totalTime();
            this._startTime = t - (t - this._startTime) * this._timeScale / value;
        }
        this._timeScale = value;
        return this._uncache(false);
    };
    p.reversed = function(value) {
        if (!arguments.length) {
            return this._reversed;
        }
        if (value != this._reversed) {
            this._reversed = value;
            this.totalTime(this._timeline && !this._timeline.smoothChildTiming ? this.totalDuration() - this._totalTime : this._totalTime, true);
        }
        return this;
    };
    p.paused = function(value) {
        if (!arguments.length) {
            return this._paused;
        }
        if (value != this._paused) if (this._timeline) {
            if (!_tickerActive && !value) {
                _ticker.wake();
            }
            var tl = this._timeline, raw = tl.rawTime(), elapsed = raw - this._pauseTime;
            if (!value && tl.smoothChildTiming) {
                this._startTime += elapsed;
                this._uncache(false);
            }
            this._pauseTime = value ? raw : null;
            this._paused = value;
            this._active = this.isActive();
            if (!value && elapsed !== 0 && this._initted && this.duration()) {
                this.render(tl.smoothChildTiming ? this._totalTime : (raw - this._startTime) / this._timeScale, true, true);
            }
        }
        if (this._gc && !value) {
            this._enabled(true, false);
        }
        return this;
    };
    var SimpleTimeline = _class("core.SimpleTimeline", function(vars) {
        Animation.call(this, 0, vars);
        this.autoRemoveChildren = this.smoothChildTiming = true;
    });
    p = SimpleTimeline.prototype = new Animation();
    p.constructor = SimpleTimeline;
    p.kill()._gc = false;
    p._first = p._last = null;
    p._sortChildren = false;
    p.add = p.insert = function(child, position, align, stagger) {
        var prevTween, st;
        child._startTime = Number(position || 0) + child._delay;
        if (child._paused) if (this !== child._timeline) {
            child._pauseTime = child._startTime + (this.rawTime() - child._startTime) / child._timeScale;
        }
        if (child.timeline) {
            child.timeline._remove(child, true);
        }
        child.timeline = child._timeline = this;
        if (child._gc) {
            child._enabled(true, true);
        }
        prevTween = this._last;
        if (this._sortChildren) {
            st = child._startTime;
            while (prevTween && prevTween._startTime > st) {
                prevTween = prevTween._prev;
            }
        }
        if (prevTween) {
            child._next = prevTween._next;
            prevTween._next = child;
        } else {
            child._next = this._first;
            this._first = child;
        }
        if (child._next) {
            child._next._prev = child;
        } else {
            this._last = child;
        }
        child._prev = prevTween;
        if (this._timeline) {
            this._uncache(true);
        }
        return this;
    };
    p._remove = function(tween, skipDisable) {
        if (tween.timeline === this) {
            if (!skipDisable) {
                tween._enabled(false, true);
            }
            if (tween._prev) {
                tween._prev._next = tween._next;
            } else if (this._first === tween) {
                this._first = tween._next;
            }
            if (tween._next) {
                tween._next._prev = tween._prev;
            } else if (this._last === tween) {
                this._last = tween._prev;
            }
            tween._next = tween._prev = tween.timeline = null;
            if (this._timeline) {
                this._uncache(true);
            }
        }
        return this;
    };
    p.render = function(time, suppressEvents, force) {
        var tween = this._first, next;
        this._totalTime = this._time = this._rawPrevTime = time;
        while (tween) {
            next = tween._next;
            if (tween._active || time >= tween._startTime && !tween._paused) {
                if (!tween._reversed) {
                    tween.render((time - tween._startTime) * tween._timeScale, suppressEvents, force);
                } else {
                    tween.render((!tween._dirty ? tween._totalDuration : tween.totalDuration()) - (time - tween._startTime) * tween._timeScale, suppressEvents, force);
                }
            }
            tween = next;
        }
    };
    p.rawTime = function() {
        if (!_tickerActive) {
            _ticker.wake();
        }
        return this._totalTime;
    };
    var TweenLite = _class("TweenLite", function(target, duration, vars) {
        Animation.call(this, duration, vars);
        this.render = TweenLite.prototype.render;
        if (target == null) {
            throw "Cannot tween a null target.";
        }
        this.target = target = typeof target !== "string" ? target : TweenLite.selector(target) || target;
        var isSelector = target.jquery || target.length && target !== window && target[0] && (target[0] === window || target[0].nodeType && target[0].style && !target.nodeType), overwrite = this.vars.overwrite, i, targ, targets;
        this._overwrite = overwrite = overwrite == null ? _overwriteLookup[TweenLite.defaultOverwrite] : typeof overwrite === "number" ? overwrite >> 0 : _overwriteLookup[overwrite];
        if ((isSelector || target instanceof Array || target.push && _isArray(target)) && typeof target[0] !== "number") {
            this._targets = targets = _slice(target);
            this._propLookup = [];
            this._siblings = [];
            for (i = 0; i < targets.length; i++) {
                targ = targets[i];
                if (!targ) {
                    targets.splice(i--, 1);
                    continue;
                } else if (typeof targ === "string") {
                    targ = targets[i--] = TweenLite.selector(targ);
                    if (typeof targ === "string") {
                        targets.splice(i + 1, 1);
                    }
                    continue;
                } else if (targ.length && targ !== window && targ[0] && (targ[0] === window || targ[0].nodeType && targ[0].style && !targ.nodeType)) {
                    targets.splice(i--, 1);
                    this._targets = targets = targets.concat(_slice(targ));
                    continue;
                }
                this._siblings[i] = _register(targ, this, false);
                if (overwrite === 1) if (this._siblings[i].length > 1) {
                    _applyOverwrite(targ, this, null, 1, this._siblings[i]);
                }
            }
        } else {
            this._propLookup = {};
            this._siblings = _register(target, this, false);
            if (overwrite === 1) if (this._siblings.length > 1) {
                _applyOverwrite(target, this, null, 1, this._siblings);
            }
        }
        if (this.vars.immediateRender || duration === 0 && this._delay === 0 && this.vars.immediateRender !== false) {
            this._time = -_tinyNum;
            this.render(-this._delay);
        }
    }, true), _isSelector = function(v) {
        return v.length && v !== window && v[0] && (v[0] === window || v[0].nodeType && v[0].style && !v.nodeType);
    }, _autoCSS = function(vars, target) {
        var css = {}, p;
        for (p in vars) {
            if (!_reservedProps[p] && (!(p in target) || p === "transform" || p === "x" || p === "y" || p === "width" || p === "height" || p === "className" || p === "border") && (!_plugins[p] || _plugins[p] && _plugins[p]._autoCSS)) {
                css[p] = vars[p];
                delete vars[p];
            }
        }
        vars.css = css;
    };
    p = TweenLite.prototype = new Animation();
    p.constructor = TweenLite;
    p.kill()._gc = false;
    p.ratio = 0;
    p._firstPT = p._targets = p._overwrittenProps = p._startAt = null;
    p._notifyPluginsOfEnabled = p._lazy = false;
    TweenLite.version = "1.13.1";
    TweenLite.defaultEase = p._ease = new Ease(null, null, 1, 1);
    TweenLite.defaultOverwrite = "auto";
    TweenLite.ticker = _ticker;
    TweenLite.autoSleep = true;
    TweenLite.lagSmoothing = function(threshold, adjustedLag) {
        _ticker.lagSmoothing(threshold, adjustedLag);
    };
    TweenLite.selector = window.$ || window.jQuery || function(e) {
        var selector = window.$ || window.jQuery;
        if (selector) {
            TweenLite.selector = selector;
            return selector(e);
        }
        return typeof document === "undefined" ? e : document.querySelectorAll ? document.querySelectorAll(e) : document.getElementById(e.charAt(0) === "#" ? e.substr(1) : e);
    };
    var _lazyTweens = [], _lazyLookup = {}, _internals = TweenLite._internals = {
        isArray: _isArray,
        isSelector: _isSelector,
        lazyTweens: _lazyTweens
    }, _plugins = TweenLite._plugins = {}, _tweenLookup = _internals.tweenLookup = {}, _tweenLookupNum = 0, _reservedProps = _internals.reservedProps = {
        ease: 1,
        delay: 1,
        overwrite: 1,
        onComplete: 1,
        onCompleteParams: 1,
        onCompleteScope: 1,
        useFrames: 1,
        runBackwards: 1,
        startAt: 1,
        onUpdate: 1,
        onUpdateParams: 1,
        onUpdateScope: 1,
        onStart: 1,
        onStartParams: 1,
        onStartScope: 1,
        onReverseComplete: 1,
        onReverseCompleteParams: 1,
        onReverseCompleteScope: 1,
        onRepeat: 1,
        onRepeatParams: 1,
        onRepeatScope: 1,
        easeParams: 1,
        yoyo: 1,
        immediateRender: 1,
        repeat: 1,
        repeatDelay: 1,
        data: 1,
        paused: 1,
        reversed: 1,
        autoCSS: 1,
        lazy: 1
    }, _overwriteLookup = {
        none: 0,
        all: 1,
        auto: 2,
        concurrent: 3,
        allOnStart: 4,
        preexisting: 5,
        "true": 1,
        "false": 0
    }, _rootFramesTimeline = Animation._rootFramesTimeline = new SimpleTimeline(), _rootTimeline = Animation._rootTimeline = new SimpleTimeline(), _lazyRender = _internals.lazyRender = function() {
        var i = _lazyTweens.length;
        _lazyLookup = {};
        while (--i > -1) {
            a = _lazyTweens[i];
            if (a && a._lazy !== false) {
                a.render(a._lazy, false, true);
                a._lazy = false;
            }
        }
        _lazyTweens.length = 0;
    };
    _rootTimeline._startTime = _ticker.time;
    _rootFramesTimeline._startTime = _ticker.frame;
    _rootTimeline._active = _rootFramesTimeline._active = true;
    setTimeout(_lazyRender, 1);
    Animation._updateRoot = TweenLite.render = function() {
        var i, a, p;
        if (_lazyTweens.length) {
            _lazyRender();
        }
        _rootTimeline.render((_ticker.time - _rootTimeline._startTime) * _rootTimeline._timeScale, false, false);
        _rootFramesTimeline.render((_ticker.frame - _rootFramesTimeline._startTime) * _rootFramesTimeline._timeScale, false, false);
        if (_lazyTweens.length) {
            _lazyRender();
        }
        if (!(_ticker.frame % 120)) {
            for (p in _tweenLookup) {
                a = _tweenLookup[p].tweens;
                i = a.length;
                while (--i > -1) {
                    if (a[i]._gc) {
                        a.splice(i, 1);
                    }
                }
                if (a.length === 0) {
                    delete _tweenLookup[p];
                }
            }
            p = _rootTimeline._first;
            if (!p || p._paused) if (TweenLite.autoSleep && !_rootFramesTimeline._first && _ticker._listeners.tick.length === 1) {
                while (p && p._paused) {
                    p = p._next;
                }
                if (!p) {
                    _ticker.sleep();
                }
            }
        }
    };
    _ticker.addEventListener("tick", Animation._updateRoot);
    var _register = function(target, tween, scrub) {
        var id = target._gsTweenID, a, i;
        if (!_tweenLookup[id || (target._gsTweenID = id = "t" + _tweenLookupNum++)]) {
            _tweenLookup[id] = {
                target: target,
                tweens: []
            };
        }
        if (tween) {
            a = _tweenLookup[id].tweens;
            a[i = a.length] = tween;
            if (scrub) {
                while (--i > -1) {
                    if (a[i] === tween) {
                        a.splice(i, 1);
                    }
                }
            }
        }
        return _tweenLookup[id].tweens;
    }, _applyOverwrite = function(target, tween, props, mode, siblings) {
        var i, changed, curTween, l;
        if (mode === 1 || mode >= 4) {
            l = siblings.length;
            for (i = 0; i < l; i++) {
                if ((curTween = siblings[i]) !== tween) {
                    if (!curTween._gc) if (curTween._enabled(false, false)) {
                        changed = true;
                    }
                } else if (mode === 5) {
                    break;
                }
            }
            return changed;
        }
        var startTime = tween._startTime + _tinyNum, overlaps = [], oCount = 0, zeroDur = tween._duration === 0, globalStart;
        i = siblings.length;
        while (--i > -1) {
            if ((curTween = siblings[i]) === tween || curTween._gc || curTween._paused) {} else if (curTween._timeline !== tween._timeline) {
                globalStart = globalStart || _checkOverlap(tween, 0, zeroDur);
                if (_checkOverlap(curTween, globalStart, zeroDur) === 0) {
                    overlaps[oCount++] = curTween;
                }
            } else if (curTween._startTime <= startTime) if (curTween._startTime + curTween.totalDuration() / curTween._timeScale > startTime) if (!((zeroDur || !curTween._initted) && startTime - curTween._startTime <= 2e-10)) {
                overlaps[oCount++] = curTween;
            }
        }
        i = oCount;
        while (--i > -1) {
            curTween = overlaps[i];
            if (mode === 2) if (curTween._kill(props, target)) {
                changed = true;
            }
            if (mode !== 2 || !curTween._firstPT && curTween._initted) {
                if (curTween._enabled(false, false)) {
                    changed = true;
                }
            }
        }
        return changed;
    }, _checkOverlap = function(tween, reference, zeroDur) {
        var tl = tween._timeline, ts = tl._timeScale, t = tween._startTime;
        while (tl._timeline) {
            t += tl._startTime;
            ts *= tl._timeScale;
            if (tl._paused) {
                return -100;
            }
            tl = tl._timeline;
        }
        t /= ts;
        return t > reference ? t - reference : zeroDur && t === reference || !tween._initted && t - reference < 2 * _tinyNum ? _tinyNum : (t += tween.totalDuration() / tween._timeScale / ts) > reference + _tinyNum ? 0 : t - reference - _tinyNum;
    };
    p._init = function() {
        var v = this.vars, op = this._overwrittenProps, dur = this._duration, immediate = !!v.immediateRender, ease = v.ease, i, initPlugins, pt, p, startVars;
        if (v.startAt) {
            if (this._startAt) {
                this._startAt.render(-1, true);
                this._startAt.kill();
            }
            startVars = {};
            for (p in v.startAt) {
                startVars[p] = v.startAt[p];
            }
            startVars.overwrite = false;
            startVars.immediateRender = true;
            startVars.lazy = immediate && v.lazy !== false;
            startVars.startAt = startVars.delay = null;
            this._startAt = TweenLite.to(this.target, 0, startVars);
            if (immediate) {
                if (this._time > 0) {
                    this._startAt = null;
                } else if (dur !== 0) {
                    return;
                }
            }
        } else if (v.runBackwards && dur !== 0) {
            if (this._startAt) {
                this._startAt.render(-1, true);
                this._startAt.kill();
                this._startAt = null;
            } else {
                pt = {};
                for (p in v) {
                    if (!_reservedProps[p] || p === "autoCSS") {
                        pt[p] = v[p];
                    }
                }
                pt.overwrite = 0;
                pt.data = "isFromStart";
                pt.lazy = immediate && v.lazy !== false;
                pt.immediateRender = immediate;
                this._startAt = TweenLite.to(this.target, 0, pt);
                if (!immediate) {
                    this._startAt._init();
                    this._startAt._enabled(false);
                } else if (this._time === 0) {
                    return;
                }
            }
        }
        this._ease = ease = !ease ? TweenLite.defaultEase : ease instanceof Ease ? ease : typeof ease === "function" ? new Ease(ease, v.easeParams) : _easeMap[ease] || TweenLite.defaultEase;
        if (v.easeParams instanceof Array && ease.config) {
            this._ease = ease.config.apply(ease, v.easeParams);
        }
        this._easeType = this._ease._type;
        this._easePower = this._ease._power;
        this._firstPT = null;
        if (this._targets) {
            i = this._targets.length;
            while (--i > -1) {
                if (this._initProps(this._targets[i], this._propLookup[i] = {}, this._siblings[i], op ? op[i] : null)) {
                    initPlugins = true;
                }
            }
        } else {
            initPlugins = this._initProps(this.target, this._propLookup, this._siblings, op);
        }
        if (initPlugins) {
            TweenLite._onPluginEvent("_onInitAllProps", this);
        }
        if (op) if (!this._firstPT) if (typeof this.target !== "function") {
            this._enabled(false, false);
        }
        if (v.runBackwards) {
            pt = this._firstPT;
            while (pt) {
                pt.s += pt.c;
                pt.c = -pt.c;
                pt = pt._next;
            }
        }
        this._onUpdate = v.onUpdate;
        this._initted = true;
    };
    p._initProps = function(target, propLookup, siblings, overwrittenProps) {
        var p, i, initPlugins, plugin, pt, v;
        if (target == null) {
            return false;
        }
        if (_lazyLookup[target._gsTweenID]) {
            _lazyRender();
        }
        if (!this.vars.css) if (target.style) if (target !== window && target.nodeType) if (_plugins.css) if (this.vars.autoCSS !== false) {
            _autoCSS(this.vars, target);
        }
        for (p in this.vars) {
            v = this.vars[p];
            if (_reservedProps[p]) {
                if (v) if (v instanceof Array || v.push && _isArray(v)) if (v.join("").indexOf("{self}") !== -1) {
                    this.vars[p] = v = this._swapSelfInParams(v, this);
                }
            } else if (_plugins[p] && (plugin = new _plugins[p]())._onInitTween(target, this.vars[p], this)) {
                this._firstPT = pt = {
                    _next: this._firstPT,
                    t: plugin,
                    p: "setRatio",
                    s: 0,
                    c: 1,
                    f: true,
                    n: p,
                    pg: true,
                    pr: plugin._priority
                };
                i = plugin._overwriteProps.length;
                while (--i > -1) {
                    propLookup[plugin._overwriteProps[i]] = this._firstPT;
                }
                if (plugin._priority || plugin._onInitAllProps) {
                    initPlugins = true;
                }
                if (plugin._onDisable || plugin._onEnable) {
                    this._notifyPluginsOfEnabled = true;
                }
            } else {
                this._firstPT = propLookup[p] = pt = {
                    _next: this._firstPT,
                    t: target,
                    p: p,
                    f: typeof target[p] === "function",
                    n: p,
                    pg: false,
                    pr: 0
                };
                pt.s = !pt.f ? parseFloat(target[p]) : target[p.indexOf("set") || typeof target["get" + p.substr(3)] !== "function" ? p : "get" + p.substr(3)]();
                pt.c = typeof v === "string" && v.charAt(1) === "=" ? parseInt(v.charAt(0) + "1", 10) * Number(v.substr(2)) : Number(v) - pt.s || 0;
            }
            if (pt) if (pt._next) {
                pt._next._prev = pt;
            }
        }
        if (overwrittenProps) if (this._kill(overwrittenProps, target)) {
            return this._initProps(target, propLookup, siblings, overwrittenProps);
        }
        if (this._overwrite > 1) if (this._firstPT) if (siblings.length > 1) if (_applyOverwrite(target, this, propLookup, this._overwrite, siblings)) {
            this._kill(propLookup, target);
            return this._initProps(target, propLookup, siblings, overwrittenProps);
        }
        if (this._firstPT) if (this.vars.lazy !== false && this._duration || this.vars.lazy && !this._duration) {
            _lazyLookup[target._gsTweenID] = true;
        }
        return initPlugins;
    };
    p.render = function(time, suppressEvents, force) {
        var prevTime = this._time, duration = this._duration, prevRawPrevTime = this._rawPrevTime, isComplete, callback, pt, rawPrevTime;
        if (time >= duration) {
            this._totalTime = this._time = duration;
            this.ratio = this._ease._calcEnd ? this._ease.getRatio(1) : 1;
            if (!this._reversed) {
                isComplete = true;
                callback = "onComplete";
            }
            if (duration === 0) if (this._initted || !this.vars.lazy || force) {
                if (this._startTime === this._timeline._duration) {
                    time = 0;
                }
                if (time === 0 || prevRawPrevTime < 0 || prevRawPrevTime === _tinyNum) if (prevRawPrevTime !== time) {
                    force = true;
                    if (prevRawPrevTime > _tinyNum) {
                        callback = "onReverseComplete";
                    }
                }
                this._rawPrevTime = rawPrevTime = !suppressEvents || time || prevRawPrevTime === time ? time : _tinyNum;
            }
        } else if (time < 1e-7) {
            this._totalTime = this._time = 0;
            this.ratio = this._ease._calcEnd ? this._ease.getRatio(0) : 0;
            if (prevTime !== 0 || duration === 0 && prevRawPrevTime > 0 && prevRawPrevTime !== _tinyNum) {
                callback = "onReverseComplete";
                isComplete = this._reversed;
            }
            if (time < 0) {
                this._active = false;
                if (duration === 0) if (this._initted || !this.vars.lazy || force) {
                    if (prevRawPrevTime >= 0) {
                        force = true;
                    }
                    this._rawPrevTime = rawPrevTime = !suppressEvents || time || prevRawPrevTime === time ? time : _tinyNum;
                }
            } else if (!this._initted) {
                force = true;
            }
        } else {
            this._totalTime = this._time = time;
            if (this._easeType) {
                var r = time / duration, type = this._easeType, pow = this._easePower;
                if (type === 1 || type === 3 && r >= .5) {
                    r = 1 - r;
                }
                if (type === 3) {
                    r *= 2;
                }
                if (pow === 1) {
                    r *= r;
                } else if (pow === 2) {
                    r *= r * r;
                } else if (pow === 3) {
                    r *= r * r * r;
                } else if (pow === 4) {
                    r *= r * r * r * r;
                }
                if (type === 1) {
                    this.ratio = 1 - r;
                } else if (type === 2) {
                    this.ratio = r;
                } else if (time / duration < .5) {
                    this.ratio = r / 2;
                } else {
                    this.ratio = 1 - r / 2;
                }
            } else {
                this.ratio = this._ease.getRatio(time / duration);
            }
        }
        if (this._time === prevTime && !force) {
            return;
        } else if (!this._initted) {
            this._init();
            if (!this._initted || this._gc) {
                return;
            } else if (!force && this._firstPT && (this.vars.lazy !== false && this._duration || this.vars.lazy && !this._duration)) {
                this._time = this._totalTime = prevTime;
                this._rawPrevTime = prevRawPrevTime;
                _lazyTweens.push(this);
                this._lazy = time;
                return;
            }
            if (this._time && !isComplete) {
                this.ratio = this._ease.getRatio(this._time / duration);
            } else if (isComplete && this._ease._calcEnd) {
                this.ratio = this._ease.getRatio(this._time === 0 ? 0 : 1);
            }
        }
        if (this._lazy !== false) {
            this._lazy = false;
        }
        if (!this._active) if (!this._paused && this._time !== prevTime && time >= 0) {
            this._active = true;
        }
        if (prevTime === 0) {
            if (this._startAt) {
                if (time >= 0) {
                    this._startAt.render(time, suppressEvents, force);
                } else if (!callback) {
                    callback = "_dummyGS";
                }
            }
            if (this.vars.onStart) if (this._time !== 0 || duration === 0) if (!suppressEvents) {
                this.vars.onStart.apply(this.vars.onStartScope || this, this.vars.onStartParams || _blankArray);
            }
        }
        pt = this._firstPT;
        while (pt) {
            if (pt.f) {
                pt.t[pt.p](pt.c * this.ratio + pt.s);
            } else {
                pt.t[pt.p] = pt.c * this.ratio + pt.s;
            }
            pt = pt._next;
        }
        if (this._onUpdate) {
            if (time < 0) if (this._startAt && this._startTime) {
                this._startAt.render(time, suppressEvents, force);
            }
            if (!suppressEvents) if (this._time !== prevTime || isComplete) {
                this._onUpdate.apply(this.vars.onUpdateScope || this, this.vars.onUpdateParams || _blankArray);
            }
        }
        if (callback) if (!this._gc || force) {
            if (time < 0 && this._startAt && !this._onUpdate && this._startTime) {
                this._startAt.render(time, suppressEvents, force);
            }
            if (isComplete) {
                if (this._timeline.autoRemoveChildren) {
                    this._enabled(false, false);
                }
                this._active = false;
            }
            if (!suppressEvents && this.vars[callback]) {
                this.vars[callback].apply(this.vars[callback + "Scope"] || this, this.vars[callback + "Params"] || _blankArray);
            }
            if (duration === 0 && this._rawPrevTime === _tinyNum && rawPrevTime !== _tinyNum) {
                this._rawPrevTime = 0;
            }
        }
    };
    p._kill = function(vars, target) {
        if (vars === "all") {
            vars = null;
        }
        if (vars == null) if (target == null || target === this.target) {
            this._lazy = false;
            return this._enabled(false, false);
        }
        target = typeof target !== "string" ? target || this._targets || this.target : TweenLite.selector(target) || target;
        var i, overwrittenProps, p, pt, propLookup, changed, killProps, record;
        if ((_isArray(target) || _isSelector(target)) && typeof target[0] !== "number") {
            i = target.length;
            while (--i > -1) {
                if (this._kill(vars, target[i])) {
                    changed = true;
                }
            }
        } else {
            if (this._targets) {
                i = this._targets.length;
                while (--i > -1) {
                    if (target === this._targets[i]) {
                        propLookup = this._propLookup[i] || {};
                        this._overwrittenProps = this._overwrittenProps || [];
                        overwrittenProps = this._overwrittenProps[i] = vars ? this._overwrittenProps[i] || {} : "all";
                        break;
                    }
                }
            } else if (target !== this.target) {
                return false;
            } else {
                propLookup = this._propLookup;
                overwrittenProps = this._overwrittenProps = vars ? this._overwrittenProps || {} : "all";
            }
            if (propLookup) {
                killProps = vars || propLookup;
                record = vars !== overwrittenProps && overwrittenProps !== "all" && vars !== propLookup && (typeof vars !== "object" || !vars._tempKill);
                for (p in killProps) {
                    if (pt = propLookup[p]) {
                        if (pt.pg && pt.t._kill(killProps)) {
                            changed = true;
                        }
                        if (!pt.pg || pt.t._overwriteProps.length === 0) {
                            if (pt._prev) {
                                pt._prev._next = pt._next;
                            } else if (pt === this._firstPT) {
                                this._firstPT = pt._next;
                            }
                            if (pt._next) {
                                pt._next._prev = pt._prev;
                            }
                            pt._next = pt._prev = null;
                        }
                        delete propLookup[p];
                    }
                    if (record) {
                        overwrittenProps[p] = 1;
                    }
                }
                if (!this._firstPT && this._initted) {
                    this._enabled(false, false);
                }
            }
        }
        return changed;
    };
    p.invalidate = function() {
        if (this._notifyPluginsOfEnabled) {
            TweenLite._onPluginEvent("_onDisable", this);
        }
        this._firstPT = null;
        this._overwrittenProps = null;
        this._onUpdate = null;
        this._startAt = null;
        this._initted = this._active = this._notifyPluginsOfEnabled = this._lazy = false;
        this._propLookup = this._targets ? {} : [];
        return this;
    };
    p._enabled = function(enabled, ignoreTimeline) {
        if (!_tickerActive) {
            _ticker.wake();
        }
        if (enabled && this._gc) {
            var targets = this._targets, i;
            if (targets) {
                i = targets.length;
                while (--i > -1) {
                    this._siblings[i] = _register(targets[i], this, true);
                }
            } else {
                this._siblings = _register(this.target, this, true);
            }
        }
        Animation.prototype._enabled.call(this, enabled, ignoreTimeline);
        if (this._notifyPluginsOfEnabled) if (this._firstPT) {
            return TweenLite._onPluginEvent(enabled ? "_onEnable" : "_onDisable", this);
        }
        return false;
    };
    TweenLite.to = function(target, duration, vars) {
        return new TweenLite(target, duration, vars);
    };
    TweenLite.from = function(target, duration, vars) {
        vars.runBackwards = true;
        vars.immediateRender = vars.immediateRender != false;
        return new TweenLite(target, duration, vars);
    };
    TweenLite.fromTo = function(target, duration, fromVars, toVars) {
        toVars.startAt = fromVars;
        toVars.immediateRender = toVars.immediateRender != false && fromVars.immediateRender != false;
        return new TweenLite(target, duration, toVars);
    };
    TweenLite.delayedCall = function(delay, callback, params, scope, useFrames) {
        return new TweenLite(callback, 0, {
            delay: delay,
            onComplete: callback,
            onCompleteParams: params,
            onCompleteScope: scope,
            onReverseComplete: callback,
            onReverseCompleteParams: params,
            onReverseCompleteScope: scope,
            immediateRender: false,
            useFrames: useFrames,
            overwrite: 0
        });
    };
    TweenLite.set = function(target, vars) {
        return new TweenLite(target, 0, vars);
    };
    TweenLite.getTweensOf = function(target, onlyActive) {
        if (target == null) {
            return [];
        }
        target = typeof target !== "string" ? target : TweenLite.selector(target) || target;
        var i, a, j, t;
        if ((_isArray(target) || _isSelector(target)) && typeof target[0] !== "number") {
            i = target.length;
            a = [];
            while (--i > -1) {
                a = a.concat(TweenLite.getTweensOf(target[i], onlyActive));
            }
            i = a.length;
            while (--i > -1) {
                t = a[i];
                j = i;
                while (--j > -1) {
                    if (t === a[j]) {
                        a.splice(i, 1);
                    }
                }
            }
        } else {
            a = _register(target).concat();
            i = a.length;
            while (--i > -1) {
                if (a[i]._gc || onlyActive && !a[i].isActive()) {
                    a.splice(i, 1);
                }
            }
        }
        return a;
    };
    TweenLite.killTweensOf = TweenLite.killDelayedCallsTo = function(target, onlyActive, vars) {
        if (typeof onlyActive === "object") {
            vars = onlyActive;
            onlyActive = false;
        }
        var a = TweenLite.getTweensOf(target, onlyActive), i = a.length;
        while (--i > -1) {
            a[i]._kill(vars, target);
        }
    };
    var TweenPlugin = _class("plugins.TweenPlugin", function(props, priority) {
        this._overwriteProps = (props || "").split(",");
        this._propName = this._overwriteProps[0];
        this._priority = priority || 0;
        this._super = TweenPlugin.prototype;
    }, true);
    p = TweenPlugin.prototype;
    TweenPlugin.version = "1.10.1";
    TweenPlugin.API = 2;
    p._firstPT = null;
    p._addTween = function(target, prop, start, end, overwriteProp, round) {
        var c, pt;
        if (end != null && (c = typeof end === "number" || end.charAt(1) !== "=" ? Number(end) - start : parseInt(end.charAt(0) + "1", 10) * Number(end.substr(2)))) {
            this._firstPT = pt = {
                _next: this._firstPT,
                t: target,
                p: prop,
                s: start,
                c: c,
                f: typeof target[prop] === "function",
                n: overwriteProp || prop,
                r: round
            };
            if (pt._next) {
                pt._next._prev = pt;
            }
            return pt;
        }
    };
    p.setRatio = function(v) {
        var pt = this._firstPT, min = 1e-6, val;
        while (pt) {
            val = pt.c * v + pt.s;
            if (pt.r) {
                val = Math.round(val);
            } else if (val < min) if (val > -min) {
                val = 0;
            }
            if (pt.f) {
                pt.t[pt.p](val);
            } else {
                pt.t[pt.p] = val;
            }
            pt = pt._next;
        }
    };
    p._kill = function(lookup) {
        var a = this._overwriteProps, pt = this._firstPT, i;
        if (lookup[this._propName] != null) {
            this._overwriteProps = [];
        } else {
            i = a.length;
            while (--i > -1) {
                if (lookup[a[i]] != null) {
                    a.splice(i, 1);
                }
            }
        }
        while (pt) {
            if (lookup[pt.n] != null) {
                if (pt._next) {
                    pt._next._prev = pt._prev;
                }
                if (pt._prev) {
                    pt._prev._next = pt._next;
                    pt._prev = null;
                } else if (this._firstPT === pt) {
                    this._firstPT = pt._next;
                }
            }
            pt = pt._next;
        }
        return false;
    };
    p._roundProps = function(lookup, value) {
        var pt = this._firstPT;
        while (pt) {
            if (lookup[this._propName] || pt.n != null && lookup[pt.n.split(this._propName + "_").join("")]) {
                pt.r = value;
            }
            pt = pt._next;
        }
    };
    TweenLite._onPluginEvent = function(type, tween) {
        var pt = tween._firstPT, changed, pt2, first, last, next;
        if (type === "_onInitAllProps") {
            while (pt) {
                next = pt._next;
                pt2 = first;
                while (pt2 && pt2.pr > pt.pr) {
                    pt2 = pt2._next;
                }
                if (pt._prev = pt2 ? pt2._prev : last) {
                    pt._prev._next = pt;
                } else {
                    first = pt;
                }
                if (pt._next = pt2) {
                    pt2._prev = pt;
                } else {
                    last = pt;
                }
                pt = next;
            }
            pt = tween._firstPT = first;
        }
        while (pt) {
            if (pt.pg) if (typeof pt.t[type] === "function") if (pt.t[type]()) {
                changed = true;
            }
            pt = pt._next;
        }
        return changed;
    };
    TweenPlugin.activate = function(plugins) {
        var i = plugins.length;
        while (--i > -1) {
            if (plugins[i].API === TweenPlugin.API) {
                _plugins[new plugins[i]()._propName] = plugins[i];
            }
        }
        return true;
    };
    _gsDefine.plugin = function(config) {
        if (!config || !config.propName || !config.init || !config.API) {
            throw "illegal plugin definition.";
        }
        var propName = config.propName, priority = config.priority || 0, overwriteProps = config.overwriteProps, map = {
            init: "_onInitTween",
            set: "setRatio",
            kill: "_kill",
            round: "_roundProps",
            initAll: "_onInitAllProps"
        }, Plugin = _class("plugins." + propName.charAt(0).toUpperCase() + propName.substr(1) + "Plugin", function() {
            TweenPlugin.call(this, propName, priority);
            this._overwriteProps = overwriteProps || [];
        }, config.global === true), p = Plugin.prototype = new TweenPlugin(propName), prop;
        p.constructor = Plugin;
        Plugin.API = config.API;
        for (prop in map) {
            if (typeof config[prop] === "function") {
                p[map[prop]] = config[prop];
            }
        }
        Plugin.version = config.version;
        TweenPlugin.activate([ Plugin ]);
        return Plugin;
    };
    a = window._gsQueue;
    if (a) {
        for (i = 0; i < a.length; i++) {
            a[i]();
        }
        for (p in _defLookup) {
            if (!_defLookup[p].func) {
                window.console.log("GSAP encountered missing dependency: com.greensock." + p);
            }
        }
    }
    _tickerActive = false;
})(typeof module !== "undefined" && module.exports && typeof global !== "undefined" ? global : this || window, "TweenLite");

(function() {
    var method;
    var noop = function() {};
    var methods = [ "assert", "clear", "count", "debug", "dir", "dirxml", "error", "exception", "group", "groupCollapsed", "groupEnd", "info", "log", "markTimeline", "profile", "profileEnd", "table", "time", "timeEnd", "timeStamp", "trace", "warn" ];
    var length = methods.length;
    var console = window.console = window.console || {};
    while (length--) {
        method = methods[length];
        if (!console[method]) {
            console[method] = noop;
        }
    }
})();

(function() {
    var __bind = function(fn, me) {
        return function() {
            return fn.apply(me, arguments);
        };
    };
    window.ComponentLoader = function() {
        var COMPONENT_PREFIX;
        COMPONENT_PREFIX = "js-component";
        function ComponentLoader(namespace) {
            this.namespace = namespace != null ? namespace : "";
            this.cleanUp = __bind(this.cleanUp, this);
            this.registeredComponents = {};
        }
        ComponentLoader.prototype.start = function() {
            return this.scan(document.body, false);
        };
        ComponentLoader.prototype.scan = function(context, doCleanUp, data) {
            var $element, $elements, classList, componentId, currentComponents, dashedName, el, index, instance, name, ob, reference, _i, _j, _len, _len1;
            if (context == null) {
                context = document.body;
            }
            if (doCleanUp == null) {
                doCleanUp = true;
            }
            currentComponents = {};
            $elements = $("[class*='" + COMPONENT_PREFIX + "']", context);
            for (_i = 0, _len = $elements.length; _i < _len; _i++) {
                el = $elements[_i];
                $element = $(el);
                componentId = -1;
                if (!$element.data("componentized")) {
                    $element.data("componentized", true);
                    classList = $element.attr("class").split(" ");
                    for (_j = 0, _len1 = classList.length; _j < _len1; _j++) {
                        ob = classList[_j];
                        index = ob.indexOf(COMPONENT_PREFIX);
                        if (index > -1) {
                            dashedName = ob.slice(COMPONENT_PREFIX.length);
                            name = this.dashedNameToLetterCase(dashedName);
                            reference = window[this.namespace][name];
                            if ($.isFunction(reference)) {
                                componentId = "i14-" + Math.floor(Math.random() * 1e7);
                                $element.data("component-id", componentId);
                                currentComponents[componentId] = true;
                                instance = new reference($element, data);
                                if (typeof instance.open === "function") {
                                    instance.open();
                                }
                                this.registeredComponents[componentId] = instance;
                            }
                        }
                    }
                } else {
                    componentId = $element.data("component-id");
                    currentComponents[componentId] = true;
                }
            }
            if (doCleanUp) {
                return this.cleanUp(currentComponents);
            }
        };
        ComponentLoader.prototype.cleanUp = function(currentComponents) {
            var componentsToCleanUp, exists, id, instance, _i, _len, _ref, _results;
            if (currentComponents == null) {
                currentComponents = {};
            }
            componentsToCleanUp = [];
            _ref = this.registeredComponents;
            for (id in _ref) {
                instance = _ref[id];
                exists = currentComponents[id] === true;
                if (!exists) {
                    if (typeof instance.destroy === "function") {
                        instance.destroy();
                    }
                    componentsToCleanUp.push(id);
                }
            }
            _results = [];
            for (_i = 0, _len = componentsToCleanUp.length; _i < _len; _i++) {
                id = componentsToCleanUp[_i];
                _results.push(delete this.registeredComponents[id]);
            }
            return _results;
        };
        ComponentLoader.prototype.dashedNameToLetterCase = function(name) {
            if ((name != null ? name.length : void 0) > 0) {
                return ("" + name).replace(/-([a-z])/g, function(g) {
                    return g[1].toUpperCase();
                });
            }
            return "";
        };
        return ComponentLoader;
    }();
}).call(this);

(function() {
    if (window.FOURTEEN == null) {
        window.FOURTEEN = {};
    }
    FOURTEEN.componentLoader = new ComponentLoader("FOURTEEN");
}).call(this);

(function() {
    var __bind = function(fn, me) {
        return function() {
            return fn.apply(me, arguments);
        };
    };
    FOURTEEN.RIOImagesLoaded = function() {
        var DATA_RIO_WIDTH, DATA_SRC;
        DATA_RIO_WIDTH = "rio-width";
        DATA_SRC = "src";
        function RIOImagesLoaded($images) {
            this.$images = $images;
            this.getState = __bind(this.getState, this);
            this.resolveDeffered = __bind(this.resolveDeffered, this);
            this.addLoadListener = __bind(this.addLoadListener, this);
            this.init = __bind(this.init, this);
            this.deffereds = [];
            this.mainDeffered = jQuery.Deferred();
            this.numResolved = 0;
            this.numImages = this.$images.length;
            this.init();
        }
        RIOImagesLoaded.prototype.init = function() {
            var $image, i, _i, _ref, _results;
            _results = [];
            for (i = _i = 0, _ref = this.numImages; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
                $image = this.$images.eq(i);
                this.deffereds.push(jQuery.Deferred());
                if ($image.data(DATA_RIO_WIDTH) === void 0) {
                    _results.push(this.addLoadListener(this.$images.eq(i), i));
                } else {
                    _results.push(this.resolveDeffered(i));
                }
            }
            return _results;
        };
        RIOImagesLoaded.prototype.addLoadListener = function($image, i) {
            var _this = this;
            return $image.one("load", function() {
                return _this.resolveDeffered(i);
            });
        };
        RIOImagesLoaded.prototype.resolveDeffered = function(index) {
            this.deffereds[index].resolve();
            this.numResolved++;
            if (this.numResolved === this.numImages) {
                return this.mainDeffered.resolve();
            }
        };
        RIOImagesLoaded.prototype.getState = function() {
            return this.mainDeffered;
        };
        return RIOImagesLoaded;
    }();
}).call(this);

(function() {
    var ScrollState, __bind = function(fn, me) {
        return function() {
            return fn.apply(me, arguments);
        };
    };
    ScrollState = function() {
        var $document, latestFrame, updating;
        $document = $(document);
        updating = false;
        latestFrame = Date.now();
        ScrollState.scrollDiff = 0;
        ScrollState.prototype.scrollDistance = 0;
        ScrollState.prototype.scrollDirection = 0;
        ScrollState.prototype.msSinceLatestChange = 0;
        ScrollState.prototype.scrollSpeed = 0;
        ScrollState.prototype.documentHeight = void 0;
        ScrollState.prototype.viewportHeight = void 0;
        ScrollState.prototype.viewportTop = 0;
        ScrollState.prototype.viewportBottom = void 0;
        ScrollState.prototype.isScrollingUp = void 0;
        ScrollState.prototype.isScrollingDown = void 0;
        ScrollState.prototype.isScrolledToTop = void 0;
        ScrollState.prototype.isScrolledToBottom = void 0;
        function ScrollState() {
            this.updateState = __bind(this.updateState, this);
            this.updateState();
            $(window).on("scroll", this.updateState);
        }
        ScrollState.prototype.updateState = function() {
            var now;
            if (!updating) {
                updating = true;
                now = Date.now();
                this.scrollDiff = this.viewportTop - scrollMonitor.viewportTop;
                this.scrollDistance = Math.abs(this.scrollDiff);
                this.scrollDirection = Math.max(-1, Math.min(1, this.scrollDiff));
                this.msSinceLatestChange = now - this.latestFrame;
                this.scrollSpeed = this.scrollDistance / this.msSinceLatestChange * 1e3;
                this.documentHeight = scrollMonitor.documentHeight;
                this.viewportHeight = scrollMonitor.viewportHeight;
                this.viewportTop = scrollMonitor.viewportTop;
                this.viewportBottom = scrollMonitor.viewportBottom;
                this.isScrollingUp = this.scrollDirection > 0;
                this.isScrollingDown = this.scrollDirection < 0;
                this.isScrolledToTop = this.viewportTop <= 0;
                this.isScrolledToBottom = this.viewportBottom >= this.documentHeight;
                this.latestFrame = now;
                $document.trigger("state:change", this);
                return updating = false;
            }
        };
        return ScrollState;
    }();
    FOURTEEN.ScrollState = new ScrollState();
}).call(this);

(function() {
    FOURTEEN.Utils = function() {
        function Utils() {}
        Utils.debounce = function(func, threshold, execAsap) {
            var debounced, timeout;
            timeout = false;
            return debounced = function() {
                var args, delayed, obj;
                obj = this;
                args = arguments;
                delayed = function() {
                    if (!execAsap) {
                        func.apply(obj, args);
                    }
                    return timeout = null;
                };
                if (timeout) {
                    clearTimeout(timeout);
                } else if (execAsap) {
                    func.apply(obj, args);
                }
                return timeout = setTimeout(delayed, threshold || 100);
            };
        };
        Utils.isLocalhost = function() {
            var hosts;
            hosts = [ "localhost", "0.0.0.0", "127.0.0.1" ];
            return hosts.indexOf(document.location.hostname) !== -1;
        };
        Utils.getRandomNumber = function(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        };
        Utils.getRoundUp = function(n) {
            var result;
            result = n;
            if (n % 10) {
                result = n + (10 - n % 10);
            }
            return result;
        };
        Utils.showSpinner = function($spinner) {
            if (!$spinner) {
                return;
            }
            return $spinner.removeClass("spinner--inactive");
        };
        Utils.hideSpinner = function($spinner) {
            if (!$spinner) {
                return;
            }
            return TweenLite.to($spinner, .3, {
                opacity: 0,
                ease: Power4.EaseOut,
                onComplete: function() {
                    return $spinner.addClass("spinner--inactive");
                }
            });
        };
        Utils.whichAnimationEvent = function() {
            var animationNames, el, t;
            t = void 0;
            el = document.createElement("div");
            animationNames = {
                WebkitAnimation: "webkitAnimationEnd",
                MozAnimation: "animationend",
                OAnimation: "oAnimationEnd oanimationend",
                animation: "animationend"
            };
            for (t in animationNames) {
                if (el.style[t] !== void 0) {
                    return animationNames[t];
                }
            }
        };
        return Utils;
    }();
}).call(this);

(function() {
    FOURTEEN.ABOUT_GRID_PATTERN_BLOCKS = {
        b1: {
            mq: "(min-width: 1080px)",
            types: [ [ 0, 0, 0, 0, 1, 1, 2, 0, 1, 1, 0, 0, 1, 1 ], [ 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1 ], [ 2, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1 ], [ 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0 ], [ 0, 0, 0, 0, 1, 1, 2, 0, 1, 0, 0, 1, 0, 1 ], [ 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1 ] ],
            sizes: {
                0: 180,
                1: 180,
                2: 360
            }
        }
    };
}).call(this);

(function() {
    var __bind = function(fn, me) {
        return function() {
            return fn.apply(me, arguments);
        };
    };
    FOURTEEN.StickyNav = function() {
        var HIDDEN_CLASS, MIN_SCROLL_DISTANCE, MIN_SCROLL_SPEED, THROTTLE_DELAY;
        HIDDEN_CLASS = "sticky-nav--hidden";
        THROTTLE_DELAY = 50;
        MIN_SCROLL_SPEED = 600;
        MIN_SCROLL_DISTANCE = 20;
        function StickyNav($context) {
            this.$context = $context;
            this.destroy = __bind(this.destroy, this);
            this.checkScrollState = __bind(this.checkScrollState, this);
            this.hide = __bind(this.hide, this);
            this.show = __bind(this.show, this);
            this.onStateChanged = __bind(this.onStateChanged, this);
            this.$document = $(document);
            this.isHidden = false;
            this.isBusyChecking = false;
            this.init();
        }
        StickyNav.prototype.init = function() {
            return this.$document.on("state:change", this.onStateChanged);
        };
        StickyNav.prototype.onStateChanged = function(e, state) {
            var _this = this;
            if (!this.isBusyChecking) {
                this.isBusyChecking = true;
                return setTimeout(function() {
                    return _this.checkScrollState(state);
                }, THROTTLE_DELAY);
            }
        };
        StickyNav.prototype.show = function() {
            if (this.isHidden) {
                this.$context.removeClass(HIDDEN_CLASS);
                return this.isHidden = false;
            }
        };
        StickyNav.prototype.hide = function() {
            if (!this.isHidden) {
                this.$context.addClass(HIDDEN_CLASS);
                return this.isHidden = true;
            }
        };
        StickyNav.prototype.checkScrollState = function(state) {
            if (state.isScrolledToTop || state.isScrolledToBottom) {
                this.show();
            } else if (state.scrollSpeed > MIN_SCROLL_SPEED || state.scrollDistance > MIN_SCROLL_DISTANCE) {
                if (state.isScrollingUp) {
                    this.show();
                } else if (state.isScrollingDown) {
                    this.hide();
                }
            }
            return this.isBusyChecking = false;
        };
        StickyNav.prototype.destroy = function() {
            this.show();
            return this.$document.off("state:change", this.onScrollDebounced);
        };
        return StickyNav;
    }();
}).call(this);

(function() {
    var __bind = function(fn, me) {
        return function() {
            return fn.apply(me, arguments);
        };
    };
    FOURTEEN.OfficeStreetView = function() {
        var CLASSES_FALLBACK, CLASS_MAP_LOADED, CLASS_SPINNER_INACTIVE, DATA_FALLBACK, DATA_TOUCH_DISABLED, LOADED_CLASS_TIMEOUT, SELECTOR_SPINNER;
        DATA_FALLBACK = "fallback";
        DATA_TOUCH_DISABLED = "is-touch-disabled";
        CLASSES_FALLBACK = "bg-cover bg-color--blank";
        CLASS_SPINNER_INACTIVE = "spinner--inactive";
        CLASS_MAP_LOADED = "map-loaded";
        SELECTOR_SPINNER = ".spinner";
        LOADED_CLASS_TIMEOUT = 700;
        function OfficeStreetView($context) {
            this.$context = $context;
            this.destroy = __bind(this.destroy, this);
            this.initializeMap = __bind(this.initializeMap, this);
            this.context = this.$context.get(0);
            this.$body = $("body");
            this.mapsLoadListener = null;
            this.$spinner = this.$context.find(SELECTOR_SPINNER);
            this.isDisabledOnTouch = this.$context.data(DATA_TOUCH_DISABLED) || false;
            if (this.isDisabledOnTouch && (Modernizr.touch || navigator.msMaxTouchPoints)) {
                this.setFallback(this.$context.data(DATA_FALLBACK));
            } else {
                this.showSpinner();
                this.mapsLoadListener = google.maps.event.addDomListener(window, "load", this.initializeMap);
                this.$body.on("pjax:done", this.initializeMap);
            }
        }
        OfficeStreetView.prototype.initializeMap = function() {
            var latLong, _this = this;
            latLong = new google.maps.LatLng(this.$context.data("latitude"), this.$context.data("longitude"));
            this.panoramaOptions = {
                position: latLong,
                disableDefaultUI: true,
                scrollwheel: false,
                pov: {
                    heading: this.$context.data("heading"),
                    pitch: this.$context.data("pitch")
                },
                zoom: this.$context.data("zoom")
            };
            this.pano = new google.maps.StreetViewPanorama(this.context, this.panoramaOptions);
            this.pano.setVisible(true);
            this.hideSpinner();
            setTimeout(function() {
                return _this.$context.addClass(CLASS_MAP_LOADED);
            }, LOADED_CLASS_TIMEOUT);
            return google.maps.event.trigger(this.context, "resize");
        };
        OfficeStreetView.prototype.destroy = function() {
            console.log("map destroy");
            google.maps.event.clearInstanceListeners(window);
            google.maps.event.clearInstanceListeners(document);
            google.maps.event.clearInstanceListeners(this.context);
            return this.$body.off("pjax:done");
        };
        OfficeStreetView.prototype.setFallback = function(url) {
            if (!url) {
                return;
            }
            this.$context.attr("data-bg-src", url);
            this.$context.addClass(CLASSES_FALLBACK);
            return ResponsiveIO.refresh(this.$context.get(0));
        };
        OfficeStreetView.prototype.showSpinner = function() {
            if (!this.$spinner) {
                return;
            }
            this.$spinner.css({
                display: "block",
                visibility: "visible"
            });
            return this.$spinner.removeClass(CLASS_SPINNER_INACTIVE);
        };
        OfficeStreetView.prototype.hideSpinner = function() {
            var _this = this;
            if (!this.$spinner) {
                return;
            }
            return this.$spinner.fadeOut(300, function() {
                return _this.$spinner.addClass(CLASS_SPINNER_INACTIVE);
            });
        };
        return OfficeStreetView;
    }();
}).call(this);

(function() {
    var __bind = function(fn, me) {
        return function() {
            return fn.apply(me, arguments);
        };
    };
    FOURTEEN.Grid = function() {
        var CLASS_ANCHOR, CLASS_ANIMATE_ITEM, CLASS_CELL_ITEM, CLASS_IMG, CLASS_READY, CLASS_SPINNER_INACTIVE, DATA_GAP, DATA_IS_REPEATABLE, DATA_MAP_MODEL, DATA_MAP_PATTERN, DATA_MAP_SIZES, DATA_NUM_ROWS, DEBOUNCE_THRESHOLD, DOMModel, GRID_CELL_GAP, GRID_PATTERN, IS_GRID_REPEATABLE, SELECTOR_IMAGES, SELECTOR_SPINNER, SELETOR_CELL_APPENDED_ITEM, SELETOR_CELL_ITEM, SPINNER_TIMEOUT_MS, currentBreakpointKey, data, debouncedResizeFn, hasChangedBreakpoint, imagesLoaded, numAvailable, spinnerTimerId, watcher;
        DEBOUNCE_THRESHOLD = 200;
        DATA_NUM_ROWS = "num-rows";
        DATA_GAP = "gap";
        DATA_MAP_MODEL = "map-model";
        DATA_MAP_PATTERN = "map-pattern";
        DATA_MAP_SIZES = "map-sizes";
        DATA_IS_REPEATABLE = "is-repeatable";
        SELECTOR_SPINNER = ".js-spinner";
        SELETOR_CELL_ITEM = ".team-grid__item";
        SELETOR_CELL_APPENDED_ITEM = ".team-grid__item--appended";
        SELECTOR_SPINNER = ".spinner";
        SELECTOR_IMAGES = ".team-grid__image";
        CLASS_CELL_ITEM = "team-grid__item team-grid__item--appended";
        CLASS_IMG = "team-grid__image";
        CLASS_ANCHOR = "team-grid__link";
        CLASS_ANIMATE_ITEM = "team-grid__item--animate";
        CLASS_SPINNER_INACTIVE = "spinner--inactive";
        CLASS_READY = "grid-show";
        IS_GRID_REPEATABLE = false;
        SPINNER_TIMEOUT_MS = 1500;
        GRID_CELL_GAP = 0;
        GRID_PATTERN = {};
        data = {
            1: [],
            2: []
        };
        numAvailable = {
            rows: 0,
            cols: 0,
            cells: 0
        };
        hasChangedBreakpoint = false;
        currentBreakpointKey = null;
        debouncedResizeFn = null;
        spinnerTimerId = null;
        watcher = null;
        imagesLoaded = null;
        DOMModel = [];
        function Grid($context, data) {
            this.$context = $context;
            this.getObjFromKey = __bind(this.getObjFromKey, this);
            this.setGridModel = __bind(this.setGridModel, this);
            this.gridSetup = __bind(this.gridSetup, this);
            this.getSizeValue = __bind(this.getSizeValue, this);
            this.updateContextHeight = __bind(this.updateContextHeight, this);
            this.addGridRows = __bind(this.addGridRows, this);
            this.onWindowResize = __bind(this.onWindowResize, this);
            this.onExitViewport = __bind(this.onExitViewport, this);
            this.hideSpinner = __bind(this.hideSpinner, this);
            this.showSpinner = __bind(this.showSpinner, this);
            this.showGrid = __bind(this.showGrid, this);
            this.onEnterViewport = __bind(this.onEnterViewport, this);
            this.removeEventListeners = __bind(this.removeEventListeners, this);
            this.addEventListeners = __bind(this.addEventListeners, this);
            this.removeWatcherListeners = __bind(this.removeWatcherListeners, this);
            this.addWatcherListeners = __bind(this.addWatcherListeners, this);
            this.initializeGrid = __bind(this.initializeGrid, this);
            this.destroy = __bind(this.destroy, this);
            this.context = this.$context.get(0);
            this.$body = $("body");
            this.$spinner = this.$context.find(SELECTOR_SPINNER);
            if (data != null ? data.isPjax : void 0) {
                this.$body.one(FOURTEEN.PjaxNavigation.EVENT_ANIMATION_SHOWN, this.initializeGrid);
            } else {
                this.initializeGrid();
            }
        }
        Grid.prototype.destroy = function() {
            this.removeWatcherListeners();
            this.removeEventListeners();
            if (spinnerTimerId !== null) {
                return clearTimeout(spinnerTimerId);
            }
        };
        Grid.prototype.initializeGrid = function() {
            this.setGridModel();
            this.checkBreakpoint();
            if (currentBreakpointKey !== null) {
                this.gridSetup();
                this.createGrid();
            }
            if (Modernizr.touch || navigator.msMaxTouchPoints || typeof scrollMonitor !== "object") {
                return this.onEnterViewport();
            } else {
                watcher = scrollMonitor.create(this.$context, -300);
                watcher.recalculateLocation();
                return this.addWatcherListeners();
            }
        };
        Grid.prototype.addWatcherListeners = function() {
            if (watcher !== null) {
                watcher.enterViewport(this.onEnterViewport);
                return watcher.exitViewport(this.onExitViewport);
            }
        };
        Grid.prototype.removeWatcherListeners = function() {
            watcher.destroy();
            return watcher = null;
        };
        Grid.prototype.addEventListeners = function() {
            if (debouncedResizeFn !== null) {
                return;
            }
            debouncedResizeFn = FOURTEEN.Utils.debounce(this.onWindowResize, DEBOUNCE_THRESHOLD);
            $(window).on("resize", debouncedResizeFn);
            return this;
        };
        Grid.prototype.removeEventListeners = function() {
            $(window).off("resize", debouncedResizeFn);
            return debouncedResizeFn = null;
        };
        Grid.prototype.checkBreakpoint = function() {
            var key, _results;
            currentBreakpointKey = null;
            _results = [];
            for (key in GRID_PATTERN) {
                if (GRID_PATTERN[key].hasOwnProperty("mq") === false) {
                    continue;
                }
                if (Modernizr.mq(GRID_PATTERN[key]["mq"]) && currentBreakpointKey !== key) {
                    currentBreakpointKey = key;
                    if (currentBreakpointKey !== key && currentBreakpointKey !== null) {
                        hasChangedBreakpoint = true;
                    }
                    _results.push(this);
                } else {
                    _results.push(void 0);
                }
            }
            return _results;
        };
        Grid.prototype.removeWatcherListeners = function() {
            if (watcher !== null) {
                return watcher.destroy();
            }
        };
        Grid.prototype.removeEventListeners = function() {
            return $(window).off("resize", debouncedResizeFn);
        };
        Grid.prototype.onEnterViewport = function() {
            if (this.hasBeenShown) {
                return;
            }
            this.showGrid();
            this.addEventListeners();
            this.onWindowResize();
            return this.hasBeenShown = true;
        };
        Grid.prototype.showGrid = function() {
            var _this = this;
            if (currentBreakpointKey === null) {
                return;
            }
            spinnerTimerId = setTimeout(this.showSpinner, SPINNER_TIMEOUT_MS);
            return $.when(imagesLoaded.getState()).done(function() {
                if (spinnerTimerId !== null) {
                    _this.hideSpinner();
                }
                _this.$context.addClass(CLASS_READY);
                return _this.showItems(_this.$context.find(SELETOR_CELL_APPENDED_ITEM));
            });
        };
        Grid.prototype.resetDOMModel = function() {
            return DOMModel.length = 0;
        };
        Grid.prototype.changeGridLayout = function() {
            this.$context.empty();
            this.resetDOMModel();
            this.createGrid();
            this.showGrid();
            return hasChangedBreakpoint = false;
        };
        Grid.prototype.showSpinner = function() {
            return FOURTEEN.Utils.showSpinner(this.$spinner);
        };
        Grid.prototype.hideSpinner = function() {
            return FOURTEEN.Utils.hideSpinner(this.$spinner);
        };
        Grid.prototype.isUsingRIO = function() {
            return typeof ResponsiveIO === "object";
        };
        Grid.prototype.onExitViewport = function() {
            if (this.hasBeenShown) {
                return this.removeWatcherListeners();
            }
        };
        Grid.prototype.onWindowResize = function() {
            var currentNumberOfCols, row, _this = this;
            this.checkBreakpoint();
            if (currentBreakpointKey === null) {
                this.updateContextHeight(true);
                return;
            }
            currentNumberOfCols = DOMModel[0] !== void 0 ? DOMModel[0].length : 0;
            row = 0;
            this.gridSetup();
            if (hasChangedBreakpoint) {
                return this.changeGridLayout();
            }
            if (numAvailable.cols > currentNumberOfCols) {
                spinnerTimerId = setTimeout(this.showSpinner, SPINNER_TIMEOUT_MS);
                while (row < numAvailable.rows) {
                    this.addGridCols(row, currentNumberOfCols, numAvailable.cols);
                    row++;
                }
                this.refreshImages(currentNumberOfCols);
            }
            this.updateContextHeight();
            return $.when(imagesLoaded.getState()).done(function() {
                if (spinnerTimerId !== null) {
                    _this.hideSpinner();
                }
                return _this.showItems(_this.$context.find(SELETOR_CELL_ITEM + ":gt(" + currentNumberOfCols + ")"));
            });
        };
        Grid.prototype.refreshImages = function(startColumn) {
            var $images, i, imagesLen, _i, _results, _startColumn;
            $images = this.$context.find(SELETOR_CELL_APPENDED_ITEM + " img");
            _startColumn = startColumn || 0;
            i = 0;
            imagesLen = $images.length;
            $images.slice(_startColumn, imagesLen);
            imagesLoaded = new FOURTEEN.RIOImagesLoaded($images);
            _results = [];
            for (i = _i = 0; 0 <= imagesLen ? _i <= imagesLen : _i >= imagesLen; i = 0 <= imagesLen ? ++_i : --_i) {
                _results.push(ResponsiveIO.refresh($images[i]));
            }
            return _results;
        };
        Grid.prototype.createImgTagString = function(item) {
            var img;
            img = "";
            if (!item || !item.hasOwnProperty("src") || !item.hasOwnProperty("alt")) {
                console.warn("Missing src or alt attribute in object.");
                return "";
            }
            if (this.isUsingRIO()) {
                img = '<img class="' + CLASS_IMG + '" data-src="' + decodeURIComponent(item.src) + '" alt="' + item.alt + '" />';
            } else {
                img = '<img class="' + CLASS_IMG + '" src="' + decodeURIComponent(item.src) + '" alt="' + item.alt + '" />';
            }
            return img;
        };
        Grid.prototype.createDivTagString = function(child, type, left, top) {
            var _child, _style;
            _child = child || "";
            _style = "";
            _style = "visibility: hidden;";
            _style += "top: " + top + "px;";
            _style += "left: " + left + "px;";
            if (GRID_PATTERN[currentBreakpointKey]["sizes"].hasOwnProperty(type)) {
                _style += "width: " + GRID_PATTERN[currentBreakpointKey]["sizes"][type] + "px;";
                _style += "height: " + GRID_PATTERN[currentBreakpointKey]["sizes"][type] + "px;";
            }
            return '<div class="' + CLASS_CELL_ITEM + '" style="' + _style + '">' + _child + "</div>";
        };
        Grid.prototype.createAnchorTagString = function(item, child) {
            var href;
            href = item.href || "#";
            return '<a class="' + CLASS_ANCHOR + '" href="' + href + '" target="_blank">' + child + "</a>";
        };
        Grid.prototype.createGrid = function() {
            this.addGridRows();
            this.updateContextHeight();
            return this.refreshImages();
        };
        Grid.prototype.addGridRows = function(start, end) {
            var row, _end, _results, _start;
            _start = start || 0;
            _end = end || numAvailable.rows;
            row = _start;
            _results = [];
            while (row < _end) {
                this.addGridCols(row);
                _results.push(row++);
            }
            return _results;
        };
        Grid.prototype.updateContextHeight = function(reset) {
            if (reset === true) {
                return this.$context.height("auto");
            } else {
                return this.$context.height(numAvailable.rows * (this.getCellHeight("1") + GRID_CELL_GAP));
            }
        };
        Grid.prototype.addGridCols = function(row, start, end) {
            var col, strItems, type, _end, _start;
            type = null;
            strItems = "";
            _start = start || 0;
            _end = end || numAvailable.cols;
            col = _start;
            while (col < _end) {
                type = this.getItemType(col, row);
                if (!DOMModel[row]) {
                    DOMModel.push([]);
                }
                DOMModel[row][col] = type;
                strItems += this.addGridCell(type, col, row);
                col++;
            }
            return this.$context.append(strItems);
        };
        Grid.prototype.getItemType = function(col, row) {
            var colMod;
            colMod = col % GRID_PATTERN[currentBreakpointKey]["types"][row].length;
            return GRID_PATTERN[currentBreakpointKey]["types"][row][colMod];
        };
        Grid.prototype.isUnrepetableItem = function(item) {
            if (item.hasOwnProperty("unrepeatable") !== true) {
                return false;
            }
            return JSON.parse(item.unrepeatable);
        };
        Grid.prototype.getItem = function(type) {
            var item;
            item = false;
            if (type && data.hasOwnProperty(type) && data[type] && data[type].length > 0) {
                item = data[type].shift();
                if (IS_GRID_REPEATABLE && this.isUnrepetableItem(item) !== true) {
                    data[type].push(item);
                }
            }
            return item;
        };
        Grid.prototype.addGridCell = function(type, col, row) {
            var anchor, img, item, x, y;
            item = null;
            anchor = "";
            img = "";
            x = 0;
            y = 0;
            if (type === 0) {
                return "";
            }
            item = this.getItem(type);
            if (item) {
                img = this.createImgTagString(item);
                if (item.hasOwnProperty("href")) {
                    anchor = this.createAnchorTagString(item, img);
                }
            }
            x = this.calculateX(col, row);
            y = this.calculateY(row);
            if (anchor) {
                return this.createDivTagString(anchor, type, x, y);
            } else {
                return this.createDivTagString(img, type, x, y);
            }
        };
        Grid.prototype.calculateX = function(col, row) {
            var currentType, i, numPreviousCols, previousCols, previousType, totalX;
            totalX = 0;
            previousCols = null;
            numPreviousCols = null;
            previousType = 0;
            currentType = 0;
            i = 0;
            if (col === 0) {
                return 0;
            }
            previousCols = DOMModel[row].slice(0, col);
            numPreviousCols = previousCols.length;
            while (i < numPreviousCols) {
                currentType = previousCols[i];
                previousType = previousCols[i - 1];
                i += 1;
                if (currentType === 0 && previousType === 2) {
                    continue;
                }
                totalX += this.getCellWidth(currentType) + GRID_CELL_GAP;
            }
            return totalX;
        };
        Grid.prototype.calculateY = function(row) {
            return (this.getCellHeight("1") + GRID_CELL_GAP) * row;
        };
        Grid.prototype.getCellWidth = function(type) {
            return this.getSizeValue(type, "w");
        };
        Grid.prototype.getCellHeight = function(type) {
            return this.getSizeValue(type, "h");
        };
        Grid.prototype.getSizeValue = function(type, key) {
            var value;
            value = 0;
            if (typeof GRID_PATTERN[currentBreakpointKey]["sizes"][type] === "object" && GRID_PATTERN[currentBreakpointKey]["sizes"][type].hasOwnProperty(key)) {
                value = GRID_PATTERN[currentBreakpointKey]["sizes"][type][key];
            } else {
                value = GRID_PATTERN[currentBreakpointKey]["sizes"][type];
            }
            return parseInt(value, 10);
        };
        Grid.prototype.showItems = function($items) {
            var i, numItems, _results;
            numItems = $items.length;
            i = 0;
            _results = [];
            while (i < numItems) {
                this.showItem($items.eq(i));
                _results.push(i++);
            }
            return _results;
        };
        Grid.prototype.showItem = function($item) {
            var delay;
            if ($item.length === 0 || typeof $item !== "object") {
                throw new Error("showItem: Object missing to display");
            }
            delay = FOURTEEN.Utils.getRoundUp(FOURTEEN.Utils.getRandomNumber(100, 400));
            $item.css("visibility", "visible");
            setTimeout(function() {
                return $item.addClass(CLASS_ANIMATE_ITEM).css(Modernizr.prefixed("transitionDelay"), delay + "ms");
            }, 50);
            return this;
        };
        Grid.prototype.gridSetup = function() {
            var totalAvailableWidth;
            if (GRID_PATTERN.hasOwnProperty(currentBreakpointKey) === false) {
                throw new Error("GRID_PATTERN doesn't have the given " + currentBreakpointKey + " key or is empty.");
            }
            totalAvailableWidth = this.$context.outerWidth();
            numAvailable.rows = GRID_PATTERN[currentBreakpointKey]["types"].length;
            numAvailable.cols = Math.ceil(totalAvailableWidth / this.getCellWidth("1"));
            return numAvailable.cells = numAvailable.cols * numAvailable.rows;
        };
        Grid.prototype.setGridModel = function() {
            var cellSizesKey, modelKey, patternKey;
            patternKey = this.$context.data(DATA_MAP_PATTERN);
            cellSizesKey = this.$context.data(DATA_MAP_SIZES);
            modelKey = this.$context.data(DATA_MAP_MODEL);
            GRID_CELL_GAP = this.$context.data(DATA_GAP) || 0;
            IS_GRID_REPEATABLE = parseInt(this.$context.data(DATA_IS_REPEATABLE), 10) || 1;
            GRID_PATTERN = this.getObjFromKey(patternKey);
            return data = this.getObjFromKey(modelKey);
        };
        Grid.prototype.getObjFromKey = function(key) {
            if (!key) {
                throw new Error("Model missing for the grid " + this.$context);
            } else {
                if (FOURTEEN.hasOwnProperty(key) === false) {
                    throw new Error("Key for the model is incorrect: " + key);
                } else {
                    return FOURTEEN[key];
                }
            }
            return false;
        };
        return Grid;
    }();
}).call(this);

(function() {
    var __bind = function(fn, me) {
        return function() {
            return fn.apply(me, arguments);
        };
    };
    FOURTEEN.ElementScrollVisibility = function() {
        var CSS_ANIMATED_CLASS, CSS_ANIMATE_CLASS, CSS_EXIT_CLASS, CSS_FULLY_VISIBLE_CLASS, CSS_PARTIALLY_VISIBLE_CLASS, DATA_OFFSET;
        CSS_PARTIALLY_VISIBLE_CLASS = "is-partially-visible";
        CSS_FULLY_VISIBLE_CLASS = "is-fully-visible";
        CSS_ANIMATE_CLASS = "animate";
        CSS_ANIMATED_CLASS = "has-animated";
        CSS_EXIT_CLASS = "has-exited";
        DATA_OFFSET = "offset";
        function ElementScrollVisibility($context, data) {
            this.$context = $context;
            this.onExitViewport = __bind(this.onExitViewport, this);
            this.onFullyEnterViewport = __bind(this.onFullyEnterViewport, this);
            this.onEnterViewport = __bind(this.onEnterViewport, this);
            this.removeEventListeners = __bind(this.removeEventListeners, this);
            this.addEventListeners = __bind(this.addEventListeners, this);
            this.destroy = __bind(this.destroy, this);
            this.context = this.$context.get(0);
            this.$body = $(document.body);
            if (data != null ? data.isPjax : void 0) {
                this.$body.one(FOURTEEN.PjaxNavigation.EVENT_ANIMATION_SHOWN, this.addEventListeners);
            } else {
                this.addEventListeners();
            }
        }
        ElementScrollVisibility.prototype.destroy = function() {
            return this.removeEventListeners();
        };
        ElementScrollVisibility.prototype.addEventListeners = function() {
            var offset;
            offset = this.$context.data("offset") || -100;
            if (typeof scrollMonitor !== "undefined" && scrollMonitor !== null) {
                this.watcher = scrollMonitor.create(this.$context, offset);
                this.watcher.enterViewport(this.onEnterViewport);
                this.watcher.fullyEnterViewport(this.onFullyEnterViewport);
                this.watcher.exitViewport(this.onExitViewport);
                return this.watcher.recalculateLocation();
            }
        };
        ElementScrollVisibility.prototype.removeEventListeners = function() {
            if (this.watcher) {
                this.watcher.destroy();
                return this.watcher = null;
            }
        };
        ElementScrollVisibility.prototype.onEnterViewport = function() {
            if (this.hasPartiallyPlayed) {
                return;
            }
            this.hasPartiallyPlayed = true;
            return this.$context.addClass(CSS_PARTIALLY_VISIBLE_CLASS);
        };
        ElementScrollVisibility.prototype.onFullyEnterViewport = function() {
            var animationEnd;
            if (this.hasFullyPlayed) {
                return;
            }
            this.hasFullyPlayed = true;
            this.$context.addClass(CSS_FULLY_VISIBLE_CLASS + " " + CSS_ANIMATE_CLASS);
            animationEnd = FOURTEEN.Utils.whichAnimationEvent();
            if (animationEnd) {
                return this.$context.on(animationEnd, function() {
                    this.$context.addClass(CSS_ANIMATED_CLASS);
                    return setTimeout(function() {
                        return this.$context.addClass(CSS_ANIMATE_CLASS);
                    }, 50);
                });
            }
        };
        ElementScrollVisibility.prototype.onExitViewport = function() {
            if (this.hasExited) {
                return;
            }
            this.hasExited = true;
            this.$context.addClass(CSS_EXIT_CLASS);
            if (this.hasPartiallyPlayed && this.hasFullyPlayed) {
                return this.removeEventListeners();
            }
        };
        return ElementScrollVisibility;
    }();
}).call(this);

(function() {
    var __bind = function(fn, me) {
        return function() {
            return fn.apply(me, arguments);
        };
    };
    if (window.FOURTEEN == null) {
        window.FOURTEEN = {};
    }
    FOURTEEN.PjaxNavigation = function() {
        PjaxNavigation.EVENT_ANIMATION_SHOWN = "pjax-animation:shown";
        PjaxNavigation.prototype.HOMEPAGE_ID = "home";
        PjaxNavigation.prototype.SPINNER_DELAY = 650;
        function PjaxNavigation(navigationSelector, btnNavLinks, btnHomeSelector, contentSelector, onEndCallback) {
            this.navigationSelector = navigationSelector;
            this.btnNavLinks = btnNavLinks;
            this.btnHomeSelector = btnHomeSelector;
            this.contentSelector = contentSelector;
            this.onEndCallback = onEndCallback;
            this.showContent = __bind(this.showContent, this);
            this.slideInContent = __bind(this.slideInContent, this);
            this.slideOutContent = __bind(this.slideOutContent, this);
            this.hideContent = __bind(this.hideContent, this);
            this.showHero = __bind(this.showHero, this);
            this.hideHero = __bind(this.hideHero, this);
            this.showSpinner = __bind(this.showSpinner, this);
            this.cancelSpinner = __bind(this.cancelSpinner, this);
            this.startSpinnerTimer = __bind(this.startSpinnerTimer, this);
            this.updateBodyPageId = __bind(this.updateBodyPageId, this);
            this.onPjaxEnd = __bind(this.onPjaxEnd, this);
            this.onPjaxStart = __bind(this.onPjaxStart, this);
            this.onPjaxSend = __bind(this.onPjaxSend, this);
            this.calculateY = __bind(this.calculateY, this);
            this.onPopState = __bind(this.onPopState, this);
            this.onNavigateToPage = __bind(this.onNavigateToPage, this);
            this.onNavigateToHome = __bind(this.onNavigateToHome, this);
            this.$content = $(this.contentSelector);
            this.$navigation = $(this.navigationSelector);
            this.$btnNavLinks = $(this.btnNavLinks);
            this.$btnHome = $(this.btnHomeSelector);
            this.$hero = $(".hero");
            this.$body = $("body");
            this.$spinner = $('<div class="spinner spinner--center"></div>');
            this.spinnerTimer = null;
            this.init();
        }
        PjaxNavigation.prototype.init = function() {
            this.currentPageId = this.$body.attr("class").match(/page-(\S*)/)[1];
            $.pjax.defaults.timeout = 1e4;
            $(document).pjax("a", this.contentSelector, {
                fragment: this.contentSelector
            });
            this.$btnHome.on("click", this.onNavigateToHome);
            this.$btnNavLinks.on("click", this.onNavigateToPage);
            this.$content.on("pjax:send", this.onPjaxSend);
            this.$content.on("pjax:start", this.onPjaxStart);
            this.$content.on("pjax:popstate", this.onPopState);
            this.$content.on("pjax:end", this.onPjaxEnd);
            return this.$content.on("pjax:end", this.onEndCallback);
        };
        PjaxNavigation.prototype.onNavigateToHome = function(e, popState) {
            var url, _this = this;
            e.preventDefault();
            if (this.currentPageId !== this.HOMEPAGE_ID) {
                this.calculateY();
                this.showHero();
                url = $(e.currentTarget).attr("href");
                return this.slideOutContent(function() {
                    if (!popState) {
                        return $.pjax({
                            url: url,
                            container: _this.contentSelector,
                            fragment: _this.contentSelector
                        });
                    }
                });
            }
        };
        PjaxNavigation.prototype.onNavigateToPage = function(e, popState) {
            var $link, pageId, url;
            e.preventDefault();
            $link = $(e.currentTarget);
            url = $(e.currentTarget).attr("href");
            pageId = this.getPageIdFromUrl(url);
            if (this.currentPageId !== pageId) {
                return $.pjax({
                    url: url,
                    container: this.contentSelector,
                    fragment: this.contentSelector
                });
            }
        };
        PjaxNavigation.prototype.onPopState = function(e) {
            if (this.getPageIdFromUrl(e.state.url) === this.HOMEPAGE_ID) {
                return this.onNavigateToHome(e, true);
            }
        };
        PjaxNavigation.prototype.getPageIdFromUrl = function(url) {
            var index, name;
            index = url.lastIndexOf("/");
            name = url.slice(index + 1);
            if (name && name.length) {
                return name;
            }
            return this.HOMEPAGE_ID;
        };
        PjaxNavigation.prototype.calculateY = function() {
            return this.yTo = window.innerHeight - this.$navigation.outerHeight();
        };
        PjaxNavigation.prototype.onPjaxSend = function(e, xhr, options) {
            return this.startSpinnerTimer();
        };
        PjaxNavigation.prototype.onPjaxStart = function(e, unused, options) {
            this.calculateY();
            if (this.currentPageId === this.HOMEPAGE_ID) {
                this.hideHero();
            }
            if (this.getPageIdFromUrl(options.url) !== this.HOMEPAGE_ID) {
                return this.hideContent();
            }
        };
        PjaxNavigation.prototype.onPjaxEnd = function(e, unused, options) {
            this.cancelSpinner();
            if (this.getPageIdFromUrl(options.url) !== this.HOMEPAGE_ID) {
                if (this.currentPageId === this.HOMEPAGE_ID) {
                    this.slideInContent();
                } else {
                    this.showContent();
                }
            }
            return this.updateBodyPageId(options);
        };
        PjaxNavigation.prototype.updateBodyPageId = function(options) {
            var pageId;
            pageId = this.getPageIdFromUrl(options.url);
            this.$body.removeClass("page-" + this.currentPageId);
            if (pageId) {
                this.currentPageId = pageId;
            } else {
                this.currentPageId = this.HOMEPAGE_ID;
            }
            return this.$body.addClass("page-" + this.currentPageId);
        };
        PjaxNavigation.prototype.startSpinnerTimer = function() {
            clearTimeout(this.spinnerTimer);
            return this.spinnerTimer = setTimeout(this.showSpinner, this.SPINNER_DELAY);
        };
        PjaxNavigation.prototype.cancelSpinner = function() {
            clearTimeout(this.spinnerTimer);
            return this.$spinner.remove();
        };
        PjaxNavigation.prototype.showSpinner = function() {
            return this.$content.after(this.$spinner);
        };
        PjaxNavigation.prototype.hideHero = function() {
            var _this = this;
            return TweenLite.to(this.$hero[0], .8, {
                y: this.yTo * -1,
                ease: Circ.easeInOut,
                clearProps: "all",
                onComplete: function() {
                    return _this.$hero.addClass("hero--hidden");
                }
            });
        };
        PjaxNavigation.prototype.showHero = function() {
            TweenLite.set(this.$hero[0], {
                y: this.yTo * -1
            });
            this.$hero.removeClass("hero--hidden");
            return TweenLite.fromTo(this.$hero[0], .6, {
                y: this.yTo * -1
            }, {
                y: 0,
                delay: .2,
                ease: Circ.easeInOut,
                clearProps: "all"
            });
        };
        PjaxNavigation.prototype.hideContent = function() {
            return TweenLite.set(this.$content[0], {
                display: "none"
            });
        };
        PjaxNavigation.prototype.slideOutContent = function(callback) {
            return TweenLite.fromTo(this.$content[0], .8, {
                y: 0,
                display: "block"
            }, {
                y: this.yTo,
                ease: Circ.easeInOut,
                display: "none",
                onComplete: callback
            });
        };
        PjaxNavigation.prototype.slideInContent = function() {
            var _this = this;
            TweenLite.set(this.$content[0], {
                display: "block",
                clearProps: "all"
            });
            return TweenLite.fromTo(this.$content.find(".pjax-animate"), .8, {
                y: this.yTo,
                display: "block"
            }, {
                y: 0,
                ease: Circ.easeInOut,
                delay: .1,
                clearProps: "all",
                onComplete: function(param) {
                    return _this.$body.trigger(_this.constructor.EVENT_ANIMATION_SHOWN);
                }
            });
        };
        PjaxNavigation.prototype.showContent = function() {
            var _this = this;
            TweenLite.set(this.$content[0], {
                display: "block",
                clearProps: "all"
            });
            return TweenLite.fromTo(this.$content.find(".pjax-animate"), .5, {
                y: this.yTo / 3,
                display: "block"
            }, {
                y: 0,
                ease: Circ.easeOut,
                clearProps: "all",
                onComplete: function(param) {
                    return _this.$body.trigger(_this.constructor.EVENT_ANIMATION_SHOWN);
                }
            });
        };
        return PjaxNavigation;
    }();
}).call(this);

(function() {
    $(function() {
        return FastClick.attach(document.body);
    });
    FOURTEEN.listenForResponsive_ioImageLoad = function() {
        return $("img[data-src]").one("load", function() {
            $(this).addClass("image-loaded");
            return $(this).closest(".content-image").addClass("image-loaded");
        }).each(function() {});
    };
    FOURTEEN.onPjaxEnd = function() {
        FOURTEEN.listenForResponsive_ioImageLoad();
        ResponsiveIO.refresh();
        FOURTEEN.componentLoader.scan(document.body, true, {
            isPjax: true
        });
        return $(document.body).trigger("pjax:done");
    };
    FOURTEEN.listenForResponsive_ioImageLoad();
    new FOURTEEN.PjaxNavigation(".js-hero-nav", ".js-nav-link", ".js-nav-home", ".js-pjax-container", FOURTEEN.onPjaxEnd);
    FOURTEEN.componentLoader.start();
    new FOURTEEN.StickyNav($(".hero__nav"));
}).call(this);