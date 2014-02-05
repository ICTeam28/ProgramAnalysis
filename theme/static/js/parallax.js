(function(window){
  var $window  = $(window)
    , busy     = false
    , pictures = document.querySelectorAll('.parallax');

  // requestAnimationFrame shim for multi-browser support.
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

  var parallaxScroll = function (e){
    requestTick(function (){
      for (var i=0; i<pictures.length; i++){
        var pic    = pictures[i];
        var top    = $window.scrollTop();
        var picTop = pic.offsetTop;

        if (picTop + pic.clientHeight < top) continue;
        if (top + $window.height() < picTop) continue;

        var y = -pic.clientHeight/3 - (picTop - top) * 0.4;

        pic.style.backgroundPosition = '50% ' + y + 'px';
      }
      busy = false;
    })
  }
  parallaxScroll(null);

  window.addEventListener('scroll', parallaxScroll);

})(window)
