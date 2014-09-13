function addClass(el, className) {
  if (el.classList)
    el.classList.add(className);
  else
    el.className += ' ' + className;
}

function removeClass(el, className) {
  if (el.classList)
    el.classList.remove(className);
  else
    el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
}

//////////////////////////////////////////////////////////////////////////////
// NAV PROTOTYPE
//////////////////////////////////////////////////////////////////////////////
var firstLoad = true;

// get height of header
var el = document.querySelector('.js-hero-nav');
var rect = el.getBoundingClientRect()
var y = rect.top + document.body.scrollTop;
var yFrom = y;


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
document.addEventListener('page:change', function () {
  if (!firstLoad) {
    // always scroll from where you are
    yFrom = document.body.scrollTop;
  }

  TweenLite.fromTo(window, .6, {
    scrollTo: {y: yFrom}
  },
  {
    scrollTo: {y: y},
    ease: Circ.easeInOut,
    onComplete: function () {
      console.log('TODO hide header');
      // addClass(document.querySelector('.hero'), 'hero--hidden');
      // window.scrollTo(0,0);
    }
  });

  firstLoad = false;
});
// document.addEventListener('page:change', function () {
//   console.log('CHANGE');
// });
// document.addEventListener('page:load', function () {
//   console.log('LOAD');
// });
