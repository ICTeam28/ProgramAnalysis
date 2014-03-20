(function(window, $){
  'use strict'; 
  var root = window.location.href.replace(window.location.hash, '')
    , speed = 0.5 // Milliseconds per pixel.
  
  var $window = $(window);
  
  // Scroll to anchor-point code
  $('a').each(function(i, item){
    if (item.href.indexOf(root + '#') != -1) {
      var target_name;
      var target;
      target_name = item.href.split('#')[1];
  
      // No anchor specified - top of page.
      if (target_name === "") {
        target = $body;
      }
      else{
        target = $('[name=' + target_name + ']');
      }
      if (target.length == 0) return;
  
      $(item).click(function (e) {
        // Do not scroll on mobile devices (js performance
        // generally slow)
        if ($window.width() < maxMobileWidth) return;
        // Scroll to position and then set URL on completion.
        e.preventDefault();
  
        var duration;
        duration = speed * Math.abs(target.offset().top - 
                          $window.scrollTop());
        // Webkit
        $body.animate({
          scrollTop: target.offset().top
        }, { queue: true
           , duration: duration
           , complete: function() {
            window.location.hash = item.href.split('#')[1];
           }
        });
  
        // Firefox 
        $html.animate({
          scrollTop: target.offset().top
        }, { queue: true
           , duration: duration
           , complete: function() {
            window.location.hash = item.href.split('#')[1];
           }
        });
        duration = null;
        e        = null;
        // Any idea what IE does?
      });
      target_name = null;
    }
  });
  root = null;
})(window, jQuery);
