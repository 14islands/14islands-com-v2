//////////////////////////////////////////////////////////////////////////////
// NAV PROTOTYPE
//////////////////////////////////////////////////////////////////////////////

var firstLoad = true;
var yFrom = document.body.scrollTop;


$(document).pjax('a', '.main-content', {
  fragment: '.main-content'
});


// bind home link to first scroll up -> then navigate
// (other wise page jumps to top since home page doesnt have content)
$('.js-nav-home').on('click', function (e) {
  e.preventDefault();
  TweenLite.to(window, .6, {
    scrollTo: {y: 0},
    ease: Circ.easeInOut,
    onComplete: function () {
      // tell pjax to nav to home page
      $.pjax({url: '/', container: '.main-content', fragment: '.main-content'})
    }
  });
});


$('.main-content').on('pjax:beforeReplace', function () {
  if (!firstLoad) {
    // always scroll from where you are
    yFrom = document.body.scrollTop;
  }

  // get scrollPosition top of navigation
  y = window.innerHeight - document.querySelector('.js-hero-nav').offsetHeight;

  TweenLite.fromTo(window, 0.6, {
    scrollTo: {y: yFrom}
  },
  {
    scrollTo: {y: y},
    ease: Circ.easeInOut,
    onComplete: function () {
      // TODO hide header?
      // addClass(document.querySelector('.hero'), 'hero--hidden');
      // window.scrollTo(0,0);
    }
  });

  firstLoad = false;
});

