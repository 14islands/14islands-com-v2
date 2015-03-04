# /* Robert Penners easing algorithms
#  * http://www.gizma.com/easing/
#  *
#  * t: current time
#  * b: start value
#  * c: total change in value
#  * d: duration
#  */

class FOURTEEN.Easing

  @easeInSine: (t, b, c, d) ->
    'use strict'
    return -c * Math.cos(t/d * (Math.PI/2)) + c + b

  @easeOutSine: (t, b, c, d) ->
    'use strict'
    return c * Math.sin(t/d * (Math.PI/2)) + b

  @easeInOutSine: (t, b, c, d) ->
    'use strict'
    return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b


  @easeInQuad: (t, b, c, d) ->
    'use strict'
    t /= d
    return c*t*t + b

  @easeOutQuad: (t, b, c, d) ->
    'use strict'
    t /= d
    return -c * t*(t-2) + b

  @easeInOutQuad: (t, b, c, d) ->
    'use strict'
    t /= d/2
    if (t < 1)
      return c/2*t*t + b
    t--
    return -c/2 * (t*(t-2) - 1) + b


  @easeOutCirc: (t, b, c, d) ->
    'use strict'
    t /= d
    t--
    return c * Math.sqrt(1 - t*t) + b

  @easeInOutCirc: (t, b, c, d) ->
    'use strict'
    t /= d/2
    if (t < 1)
      return -c/2 * (Math.sqrt(1 - t*t) - 1) + b
    t -= 2
    return c/2 * (Math.sqrt(1 - t*t) + 1) + b


  @easeInOutQuart: (t, b, c, d) ->
    'use strict'
    t /= d/2
    if (t < 1)
      return c/2*t*t*t*t + b
    t -= 2
    return -c/2 * (t*t*t*t - 2) + b
