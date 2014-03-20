/*global requestAnimationFrame */
(function () {
  "use strict";

  if (window.chrome)  {
    var canvas = $("#hero-background").get(0);
    var ctx = canvas.getContext('2d');

    (function render() {
      canvas.width = $(canvas.parentNode).outerWidth();
      canvas.height = $(canvas.parentNode).outerHeight();

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "24px Courier New";
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      var columnCount = Math.floor(canvas.width / 300);
      var off = (canvas.width - columnCount * 300) / 2;

      var renderColumn = function (i, j) {
        var k0 = Math.floor(j / 130);
        var offX = off + i * 300 + 50.5;
        var rowCount = Math.floor(canvas.height + 300) / 130, k;

        for (k = k0 - 9; k <= k0 + rowCount + 9; ++k) {
          var offY = k * 130 - j;
          var reg = "r" + (k % 50);
          var text;

          if (k >= k0) {
            ctx.strokeRect(offX, offY, 200, 70);

            ctx.beginPath();
            ctx.moveTo(offX + 100, offY + 70);
            ctx.lineTo(offX + 100, offY + 125);
            ctx.stroke();

            ctx.beginPath();
            ctx.lineTo(offX +  95, offY + 125);
            ctx.lineTo(offX + 100, offY + 130);
            ctx.lineTo(offX + 105, offY + 125);
            ctx.lineTo(offX + 100, offY + 125);
            ctx.fill();
          }

          if ((k % 9) === 0 || (k % 9) === 4) {
            ctx.beginPath();
            ctx.moveTo(offX + 200, offY + 35);
            ctx.bezierCurveTo(
              offX + 260, offY + 35,
              offX + 260, offY + 805,
              offX + 200, offY + 805
            );
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(offX + 200, offY + 805);
            ctx.lineTo(offX + 206, offY + 809);
            ctx.lineTo(offX + 204, offY + 799);
            ctx.closePath();
            ctx.fill();

            var c = (k % 9) === 0 ? "c" : "n";
            text = c + "jmp L" + ((k + 6) % 20) + "," + reg + ">0";
          } else if ((k % 9 === 1) || (k % 9) === 6) {
            text = "lbl L" + (k % 20);
          } else if ((k % 9) == 7) {
          } else {
            text = "str " + reg + ", " + reg + "+5";
          }

          ctx.fillText(text, offX + 100, offY + 35);
        }
      };

      var date = (new Date()).getTime(), i;
      for (i = 0; i < columnCount; ++i) {
        renderColumn(i, date / 50 + i * 342);
      }

      requestAnimationFrame(render);
    }());
  } else {
    $("#hero")
      .css('background-image', 'url(images/background.png)')
      .css('background-position', '50% 0');
  }
}());