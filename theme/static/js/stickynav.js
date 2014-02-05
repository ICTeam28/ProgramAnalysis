(function (window){
  var $window = $(window)
    , busy = false
    , $nav = $('nav.navbar')
    , navOffset = $nav.offset().top
    , nav = $nav[0];


  window.requestAnimationFrame = window.requestAnimationFrame || 
                                 window.mozRequestAnimationFrame ||
                                 window.webkitRequestAnimationFrame || 
                                 window.msRequestAnimationFrame ||
                                 function (f){setTimeout(f, 17)};

  var requestTick = function (f){
    if (!busy){
      requestAnimationFrame(f);
    }
    busy = true;
  }

  var stickyNavScroll = function (e){
    requestTick(function (){
      var scrollTop = $window.scrollTop();
      
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

  window.addEventListener('scroll', stickyNavScroll);
})(window)
