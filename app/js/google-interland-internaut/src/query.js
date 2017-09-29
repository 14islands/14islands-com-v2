module.exports = qs()

function qs () {
  var obj = {}
  var query = window.location.href.substring(window.location.href.indexOf('?') + 1, window.location.href.length)

  if (query.indexOf('#') !== -1) {
    query = query.substring(0, query.indexOf('#'))
  }

  var vars = query.split('&')
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=')
    var key = decodeURIComponent(pair[0])
    var val = decodeURIComponent(pair[1])
    obj[key] = val || true // true so "?x"; if( query.x ){}
  }

  return obj
}
