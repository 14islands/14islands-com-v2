

var firstLoad = false;

// get height of header
var el = document.querySelector('.js-hero-nav');
var rect = el.getBoundingClientRect()
var y = rect.top + document.body.scrollTop;


function bindHomeLink() {
  var aHome = document.querySelector('.js-nav-home');
  aHome.addEventListener('click', function (e) {
    e.preventDefault();
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

