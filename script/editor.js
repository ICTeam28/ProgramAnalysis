/*jslint browser:true, ass:true */
/*global mini, Behave, BehaveHooks */
/**
 * @fileOverview User Interface
 */
(function (env) {
  "use strict";

  var SOURCE =
    'func testp(x) {\n' +
    '  x = 0;\n' +
    '  x = ~~~x;\n' +
    '  z = 0;\n' +
    '  y = 4;\n' +
    '  q = 3;\n' +
    '  if (y > x + 0) {\n' +
    '    z = y;\n' +
    '  } else {\n' +
    '    z = y * y;\n' +
    '  }\n' +
    '  x = z;\n' +
    '  return x + 2 + 3 + 4 + y + 6 + 5 + z + y + x * 0;\n' +
    '}\n\n' +
    'func main() {\n' +
    '  return testp(1);\n' +
    '}\n';

  /**
   * Reports a new warning
   */
  env.warning = function (text) {
    $('<div>' + text + '</div>')
      .appendTo("#warn-list");
  };

  /**
   * Initialise the console
   * TODO: it would be nice if we could have a command-line thing which
   * would allow us to interpret a program in javascript and ask for user
   * input
   */
  var initConsole = function () {
    return;
  };

  /**
   * Initialises the editor
   */
  var initEditor = function () {
    var editor, marker;

    editor = ace.edit("editor");
    editor.getSession().setTabSize(2);
    editor.getSession().setUseSoftTabs(true);

    editor.getSession().on('change', function () {
      var ast, imf, src, line;

      $("#warn-list").html('');
      editor.getSession().setAnnotations([]);

      // Parse & display everything
      try {

        src = editor.getValue();
        ast = mini.parse(src);
        ast = env.pruneAST(ast);
        env.checkAST(ast);
        imf = env.genIMF(ast);

        env.drawAST(ast, $("#ast-svg").get(0));
        env.drawIMF(imf);
      } catch (e) {
        switch (e.constructor) {
        case Error:
          line = e.toString().split('\n')[0].split(' ')[5].split(':')[0];
          editor.getSession().setAnnotations([
            {
              row: parseInt(line, 10) - 1,
              column: 0,
              text: e.toString(),
              type: 'error',
            }
          ]);
          break;
        case env.SemanticError:
          editor.getSession().setAnnotations([
            {
              row: e.line - 1,
              column: 0,
              text: e.toString(src),
              type: 'error',
            }
          ]);
          break;
        default:
          throw e;
        }
      }
    });

    editor.setValue(SOURCE, -1);
  };

  /**
   * Initializes the intermediate code diagrams
   */
  var initIMF = function () {
    var slide = function (slides, dir) {
      var i, title, children;

      children = $(slides).parent().next().children();
      for (i = 0; i < children.length; ++i) {
        if (children[i].style.display === 'block') {
          break;
        }
      }

      i = (i + dir + children.length) % children.length;
      children.css('display', 'none');
      children[i].style.display = 'block';
      title = $(slides).siblings('span').first();
      title.text(children[i].getAttribute('data-name'));
    };

    $(document)
      .on('click', '#imf-tabs .next', function () { slide(this, +1); })
      .on('click', '#imf-tabs .prev', function () { slide(this, -1); });
  };

  /**
   * Initializes the tab which displays the abstract syntax tree
   */
  var initAST = function () {
    var svg = $("#ast-svg").get(0);

    $(svg)
      .on('selectstart', function (e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      })
      .on('mousedown', function (e) {
        var root = svg.firstChild;
        var mx = e.pageX, my = e.pageY;
        var transform = root.getAttribute("transform");
        var ox = 0, oy = 0;

        if (transform) {
          transform = transform.split('(')[1].split(',');
          ox = parseInt(transform[0], 10);
          oy = parseInt(transform[1], 10);
        }

        $(this)
          .css('cursor', 'move')
          .on('mousemove.drag', function (e) {
            var mX = ox - mx + e.pageX;
            var mY = oy - my + e.pageY;
            root.setAttribute("transform", "translate(" + mX + "," + mY + ")");
          });
      });
    $(window)
      .on('mouseup', function () {
        $(svg)
          .off('mousemove.drag')
          .css('cursor', 'auto');
      });
  };

  /**
   * This function is called when the page is loaded
   */
  $(function () {
    $("#tabs").tabs();

    initConsole();
    initEditor();
    initAST();
    initIMF();

    $("#input").trigger('keyup');
  });
}(window.topics = window.topics || {}));