(function () {
  var isHomePage = window.location.pathname === '/';
  var $window = $(window);
  var busy = false;
  var $nav = $('nav.navbar');
  var nav = $nav[0];

  if (!isHomePage) {
    nav.classList.add('navbar-fixed-top');
    nav.style.top = '0px';
    document.body.style.paddingTop = $nav.height() + 'px';
    return;
  }

  var $hero = $('#hero');

  var requestTick = function (f){
    if (!busy){
      requestAnimationFrame(f);
    }
    busy = true;
  };

  function resize() {
    requestTick(function() {
    var scrollTop = $window.scrollTop();
    var navOffset = $hero.offset().top + $hero.height();

    if (scrollTop > navOffset){
      nav.classList.add('navbar-fixed-top');
      nav.style.top = '0px';
    }else {
      nav.classList.remove('navbar-fixed-top');
      nav.style.top = navOffset + 'px';
    }

    busy = false;
    });
  }

  $(window)
    .scroll(resize)
    .resize(resize);

  resize();
}());
