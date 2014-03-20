/*global requestAnimationFrame */
(function () {
  "use strict";

  var canvas = $("#hero-background").get(0);
  var ctx = canvas.getContext('2d');

  (function render() {
    canvas.width = $(canvas.parentNode).outerWidth();
    canvas.height = $(canvas.parentNode).outerHeight();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var columnCount = Math.floor(canvas.width / 300);
    var off = (canvas.width - columnCount * 300) / 2;

    var renderColumn = function (i, j) {
      var offX = off + i * 300 + 50.5;
      var offY0 = j - Math.ceil(j / 130) * 130;
      var rowCount = Math.floor(canvas.height + 300) / 130, k;
      ctx.save();

      for (k = -3; k < rowCount + 3; ++k) {
        var offY = offY0 + k * 130;
        var absK = Math.floor(j / 130) + k;
        var text;

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

        var reg = "r" + absK;

        if ((absK % 2) === 0) {
          ctx.beginPath();
          ctx.moveTo(offX + 200, offY + 35);
          ctx.bezierCurveTo(
            offX + 260, offY + 35,
            offX + 260, offY + 425,
            offX + 200, offY + 425
          );
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(offX + 200, offY + 425);
          ctx.lineTo(offX + 206, offY + 429);
          ctx.lineTo(offX + 204, offY + 419);
          ctx.closePath();
          ctx.fill();

          text = "cjmp " + reg;
        } else {
          text = "str " + reg;
        }

        ctx.fillStyle = "#111111";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "24px Courier New";
        ctx.fillText(text, offX + 100, offY + 35);
        ctx.fillStyle = "#000000";
      }

      ctx.restore();
    };

    var date = (new Date()).getTime(), i;
    for (i = 0; i < columnCount; ++i) {
      renderColumn(i, date / 50 + i * 342);
    }

    requestAnimationFrame(render);
  }());
}());