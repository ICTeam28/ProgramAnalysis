/**
 * Computing topics project
 * This module is responsible for rendering the Abstract Syntax Tree
 */
(function (env) {
  /**
   * @type {HTMLCanvasElement}
   */
  var canvas;

  /**
   * @type {HTMLRenderingContext}
   */
  var ctx;

  /**
   * X offset (origin)
   * @type {Number}
   */
  var offX = 0;

  /**
   * Y offset (origin)
   * @type {Number}
   */
  var offY = 0;

  /**
   * Root of the syntax tree
   * @type {Object}
   */
  var root;

  /**
   * Renders the label of a node, adjusting width to the length of the text
   * and centering the text inside the box
   * @param {String} label Text to display
   * @param {Number} x X origin of the label
   * @param {Number} y Y origin of the label
   * @return {Number} Returns the width of the rendered element
   */
  var renderLabel = function(label, x, y)
  {
    var width = Math.max(22, ctx.measureText(label).width);

    ctx.fillStyle = "#cccccc";
    ctx.fillRect(x, y, width + 8, 30);
    ctx.fillStyle = "#000000";
    ctx.fillText(label, x + 4 + width / 2, y + 15);

    return width + 8;
  };

  /**
   * Render all the children and draw a bar on the left with small lines
   * connecting the bar to the labels of the children
   * @param {Array<Object>} List of nodes
   * @param {Number} X origin
   * @param {Number} Y origin
   * @return {Number} Total height of the rendered elements
   */
  var renderChildren = function(nodes, left, top)
  {
    var offs = [30], off = 50;
    for (var i = 0; i < nodes.length; ++i)
    {
      offs.push(off);
      off += renderNode(nodes[i], left + 30, top + off) + 5;
    }

    ctx.beginPath();
    for (var i = 1; i < offs.length; ++i)
    {
      ctx.moveTo(left + 20.5, top + offs[i - 1]);
      ctx.lineTo(left + 20.5, top + offs[i] + 15.5);
      ctx.lineTo(left + 30.5, top + offs[i] + 15.5);
    }
    ctx.stroke();

    return off;
  };

  /**
   * Renders a node and all of its children
   * @param {Number} left Offset from the left of the origin
   * @param {Number} top Offset from the top of the origin
   * @return {Number} Height of the element which was rendered
   */
  var renderNode = function(node, left, top)
  {
    switch (node['op'])
    {
      case 'prog':
      {
        renderLabel("PROG", left, top);
        return renderChildren(node['funcs'], left, top);
      }
      case 'func':
      {
        var text = 'FUNC ' + node['name'] + '(' + node['args'].join(',') + ')';
        renderLabel(text, left, top);
        return renderChildren(node['body'], left + 30, top);
      }
      case 'return':
      {
        ctx.beginPath();
        ctx.moveTo(left + 74, top + 15.5);
        ctx.lineTo(left + 90, top + 15.5);
        ctx.stroke();

        renderLabel('RETURN', left, top);
        return renderNode(node['expr'], left + 90, top).height;
      }
      case 'if':
      {
        var cond, bf, bt, t;

        // Condition
        renderLabel('IF', left, top);
        cond = renderNode(node['cond'], left + 40, top);
        t = top + 20 + cond.height;

        // True branch
        renderLabel('TRUE', left + 30, t);
        bt = renderChildren(node['true'], left + 20, t);

        // False branch
        renderLabel('FALSE', left + 30, t + bt);
        bf = renderChildren(node['false'], left + 20, t + bt);

        ctx.beginPath();
        ctx.moveTo(left + 30, top + 15.5);
        ctx.lineTo(left + 40, top + 15.5);
        ctx.moveTo(left + 15.5, top + 30);
        ctx.lineTo(left + 15.5, t + 15.5);
        ctx.lineTo(left + 30.5, t + 15.5);
        ctx.moveTo(left + 15.5, t + 15.5);
        ctx.lineTo(left + 15.5, t + bt + 15.5);
        ctx.lineTo(left + 30.5, t + bt + 15.5);
        ctx.stroke();

        return t + bt + bf - top;
      }
      case 'bin':
      {
        renderLabel(node['p'], left, top);

        var lhs = renderNode(node['lhs'], left, top + 50);
        var rhs = renderNode(node['rhs'], left + 5 + lhs.width, top + 50);

        ctx.beginPath();
        ctx.moveTo(left + 15.5, top + 30);
        ctx.lineTo(left + 15.5, top + 50);
        ctx.moveTo(left + 15.5, top + 30);
        ctx.lineTo(left + lhs.width + 20.5, top + 50);
        ctx.stroke();

        return {
          'width': lhs.width + 5 + rhs.width,
          'height': Math.max(lhs.height, rhs.height) + 50
        };
      }
      case 'num':
      case 'var':
      {
        var text = node[node['op'] == 'num' ? 'val' : 'name'];
        return {
          'width': renderLabel(text, left, top),
          'height': 30
        };
      }
    }

    return 0;
  };

  /**
   * Displays the ast
   */
  env.renderAST = function()
  {
    canvas.width = canvas.parentNode.offsetWidth;
    canvas.height = canvas.parentNode.offsetHeight - 5;

    ctx.save();
    ctx.translate(offX, offY);

    ctx.strokeStyle = "#000000";
    ctx.font = "16px Arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    renderNode(root, 0, 0);

    ctx.restore();
  };

  /**
   * Updates the tree
   * @param {Object} ast
   */
  env.updateAST = function(ast)
  {
    root = ast;
    env.renderAST();
  };

  /**
   * Initialises the AST viewer
   */
  env.initAST = function()
  {
    canvas = $("#ast-canvas").get(0);
    ctx = canvas.getContext('2d');

    $(canvas)
      .on('selectstart', function(e)
      {
        e.preventDefault();
        e.stopPropagation();
        return false;
      })
      .on('mousedown', function(e)
      {
        var mx = e.pageX, my = e.pageY;
        var ox = offX, oy = offY;

        $(this)
          .css('cursor', 'move')
          .on('mousemove.drag', function(e)
          {
            offX = ox - mx + e.pageX;
            offY = oy - my + e.pageY;

            env.renderAST();
          });
      });
    $(window)
      .on('mouseup', function(e)
      {
        $(canvas)
          .off('mousemove.drag')
          .css('cursor', 'auto');
      });
  };
}) (window.topics = window.topics || {});