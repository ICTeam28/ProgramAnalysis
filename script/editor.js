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
   * Interpretable code
   */
  env.executable = {};

  /**
   * List of preset sources
   * @type {Object<String, String>}
   */
  env.source = {};

  /**
   * Ace editor range (required in order to avoid conflicts)
   * @type {?Range}
   */
  env.AceRange = ace.require('ace/range').Range;

  /**
   * Initialises the interactive console
   */
  var initConsole = function () {
    $("#tabs-terminal").terminal(function (cmd, term) {
      var words, func, args, parts, re, worker, finish;

      try {
        words = cmd.split(' ');
        switch (words[0]) {
          case 'help':
            break;
          default:
            re = new RegExp('^[_a-zA-Z][a-zA-Z0-9_]*\\s*' +
                            '\\((\\s*' +
                              '((0|[1-9][0-9]*)\\s*,\\s*)*' +
                              '(0|[_1-9][0-9]*)\\s*' +
                            ')?\\s*\\)$');
            if (!re.test(cmd)) {
              term.error("Invalid command: '" + cmd + "'");
              break;
            }

            parts = cmd.split('(');
            args = parts[1].split(')')[0].replace(/\s+/g, '');

            if (args === "") {
              args = [];
            } else {
              args = args.split(',').map(function (str) {
                return parseInt(str, 10);
              });
            }

            term.disable();

            // Star the worker, but time it out after 1 minute
            finish = false;
            worker = new Worker('script/interpreter.js');
            worker.addEventListener('message', function (msg) {
              try {
                var ans = JSON.parse(msg.data);

                term.enable();
                if (ans.t === 'err') {
                  term.error(ans.msg);
                } else {
                  term.echo(ans.msg);
                }
              } catch (e) {
                term.error("Computation failed: " + e.toString());
              }
              finish = true;
            });
            worker.postMessage(JSON.stringify({
              'imf': env.executable,
              'func': parts[0],
              'args': args
            }));

            setTimeout(function () {
              if (!finish) {
                worker.terminate();
                finish = true;
                term.enable();
                term.error('Computation timed out');
              }
            }, 1000);
            break;
        }
      } catch (e) {
        term.error(e.toString());
      }
    }, {
      prompt: '>',
      name: 'mini',
      greetings: 'Mini console'
    });
  };

  /**
   * Initialise the sidebar with preset functions
   */
  var initSidebar = function () {
    var sidebar;

    sidebar = $("#sidebar > ul");
    $("#preset > li").each(function (idx, item) {
      var id, name, source;

      source = $(item).text().replace(/^\s\s*/, '').replace(/\s\s*$/, '');
      id = $(item).attr('data-id');
      name = $(item).attr('data-name');

      if (idx === 0) {
        source = localStorage.getItem('source');
        source = source ? source : 'func main() {\n}';
      }

      env.source[id] = source;
      $("<li data-id='" + id + "'>" + name + "</li>")
        .on('click', function () {
          $("#sidebar > ul").css('left', -sidebar.width() - 5);
          $("#sidebar > ul > li").removeClass('selected');
          $(this).addClass('selected');
          env.editor.setValue(env.source[id]);
        })
        .addClass(idx === 0 ? 'selected' : '')
        .appendTo(sidebar);

      if (idx === 0) {
        env.editor.setValue(source);
      }
    });

    $("#sidebar > .handle").on('mouseenter', function () {
      sidebar.animate({ 'left': 5 }, 'fast');
    });

    $("#editor").on('mouseover', function () {
      sidebar.animate({ 'left': -sidebar.width() - 5 }, 'fast');
    });
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
      var ast, imf, src, line, file;

      if (env.marker) {
        env.editor.removeMarker(env.marker);
        env.marker = null;
      }

      file = $("#sidebar .selected").attr('data-id');
      if (file === 'edit') {
        localStorage.setItem('source', env.editor.getValue());
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

    initEditor();
    initSidebar();
    initConsole();
    initAST();
    initIMF();
  });
}(window.topics = window.topics || {}));