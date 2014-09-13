

var firstLoad = true;
var turboLoaded = false;

// get height of header
var el = document.querySelector('.hero__nav');
var rect = el.getBoundingClientRect()
var y = rect.top + document.body.scrollTop;
var yFrom = 0;

console.log('y set to', y);

function addClass(el, className) {
  if (el.classList)
    el.classList.add(className);
  else
    el.className += ' ' + className;
}

function bindHomeLink() {
  var aHome = document.querySelector('.nav__item--home a');
  aHome.addEventListener('click', function (e) {
    console.log('click home');
    TweenLite.to(window, .6, {
      scrollTo: {y: 0},
      ease: Circ.easeInOut,
      onComplete: function () {
        Turbolinks.visit('/')
      }
    });
    return false;
  });
}
bindHomeLink();

document.addEventListener('page:load', bindHomeLink);
document.addEventListener('page:receive', function () {

  yFrom = document.body.scrollTop;
  turboLoaded = true;

});
document.addEventListener('page:load', function () {
    // if (firstLoad) {
    //   firstLoad = false;
    //   console.log('first load');
    // }
    // else {
      console.log('change: add class');
      var heroEl = document.querySelector('.hero');
      addClass(heroEl, 'hero--visible');


      setTimeout(function () {

        console.log('scroll from ', document.body.scrollTop, 'to', y)
        TweenLite.fromTo(window, .7, {
          scrollTo: {y: yFrom}
        },
        {
          scrollTo: {y: y},
          ease: Circ.easeInOut
        });

      }, 0);
    // }

});

