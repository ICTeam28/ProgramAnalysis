/*jslint browser:true, ass:true */
/*global mini, ace */
/**
 * @fileOverview User Interface
 */
(function (env) {
  "use strict";

  /**
   * Ace editor instance
   * @type {?Object}
   */
  env.editor = null;

  /**
   * Reference to the last marker
   * @type {?ace.Marker}
   */
  env.marker = null;

  /**
   * Ace editor range (required in order to avoid conflicts)
   * @type {?Range}
   */
  env.AceRange = ace.require('ace/range').Range;

  var SUM =
    'func sum(x, y, z) {\n' +
    '  return x + y + z;\n' +
    '}\n';

  var TEST =
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
    '}\n';

  var FUNCTIONS = {
    'last edited': '',
    'fibonacci': TEST,
    'sum': SUM
  };

  var lastViewed;

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
    var editor;

    env.editor = editor = ace.edit("editor").getSession();
    editor.setTabSize(2);
    editor.setUseSoftTabs(true);

    editor.on('change', function () {
      var ast, imf, src, line;

      if (env.marker) {
        env.editor.removeMarker(env.marker);
        env.marker = null;
      }

      $("#warn-list").html('');
      editor.setAnnotations([]);

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
          editor.setAnnotations([
            {
              row: parseInt(line, 10) - 1,
              column: 0,
              text: e.toString(),
              type: 'error',
            }
          ]);
          break;
        case env.SemanticError:
          editor.setAnnotations([
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


    $("#select > li").each(function (){
      var $this = $(this);
      $this.on('click', function(){
        if (FUNCTIONS[this.getAttribute('value')] === undefined) {
          throw new Error("Error: Function undefined");
        } else {

          if (lastViewed === 'last edited') {
            localStorage.setItem('last edited', editor.getValue());
          }

          if (localStorage[this.getAttribute('value')] !== undefined) {
            editor.setValue(localStorage[this.getAttribute('value')]);
          } else {
            editor.setValue(FUNCTIONS[this.getAttribute('value')], -1);
          }

          lastViewed = this.getAttribute('value');
        }
      });
    })
    $("#select > li[value='last edited']").click();
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
    var svg = $("#ast-svg").get(0), holder = $("#ast-svg-holder");

    $(svg)
      .on('selectstart', function (e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      })
      .on('mousedown', function (e) {
        var mx = e.pageX, my = e.pageY;
        var ox = holder.scrollLeft();
        var oy = holder.scrollTop();

        $(this)
          .css('cursor', 'move')
          .on('mousemove.drag', function (e) {
            var mX = ox + mx - e.pageX;
            var mY = oy + my - e.pageY;
            $("#ast-svg-holder")
              .scrollTop(mY)
              .scrollLeft(mX);
          });

        e.preventDefault();
        e.stopPropagation();
        return false;
      })
      .on('leave', function (e) {
        console.log("A");
        $(svg)
          .off('mousemove.drag')
          .css('cursor', 'auto');
        e.preventDefault();
        e.stopPropagation();
        return false;
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