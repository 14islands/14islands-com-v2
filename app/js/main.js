

var firstLoad = false;

// get height of header
var el = document.querySelector('.hero__nav');
var rect = el.getBoundingClientRect()
var y = rect.top + document.body.scrollTop;


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
  if (firstLoad) {
    firstLoad = false;
  }
  else {
    TweenLite.fromTo(window, .7, {
      scrollTo: {y: document.body.scrollTop}
    },
    {
      scrollTo: {y: y},
      ease: Circ.easeInOut
    });
  }
});

