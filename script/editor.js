/**
 * Computing topics project
 */
(function (env) {
  /**
   * Initialises the editor
   */
  env.initEditor = function()
  {
    $("#input").on('keyup', function()
    {
      try
      {
        var ast;

        $("#error-report").text("");
        ast = mini.parse($(this).val());
        env.updateAST(ast);
        env.updateIMF(ast);
      }
      catch (e)
      {
        $("#error-report").text(e);
      }
    });
  }

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
}) (window.topics = window.topics || {});