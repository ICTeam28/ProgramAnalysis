/*jslint browser:true, ass:true */
/*global mini */
/**
 * Computing topics project
 */
(function (env) {
  "use strict";
  /**
   * Initialises the editor
   */
  env.initEditor = function () {
    $("#input").on('keyup', function () {
      try {
        var ast, imf;

        $("#error-report").text("");
        ast = mini.parse($(this).val());
        env.checkAST(ast);
        imf = env.genIMF(ast);

        env.drawAST(ast);
        env.drawIMF(imf);
      } catch (e) {
        $("#error-report").text(e + " " + e.stack);
      }
    });
  };

  /**
   * This function is called when the page is loaded
   */
  $(function () {
    $("#tabs").tabs();

    env.initEditor();
    env.initAST();
    env.initIMF();

    $("#input").trigger('keyup');
  });
}(window.topics = window.topics || {}));