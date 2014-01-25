/*jslint browser:true, ass:true */
/**
 * Computing topics project
 * This module is responsible for rendering the Abstract Syntax Tree
 */
(function (env) {
  "use strict";

  /**
   * SVG Namespace
   * @type {String}
   * @const
   */
  var NS = "http://www.w3.org/2000/svg";

  /**
   * Root node of the SVG document
   * @type {SVGSVGElement}
   */
  var svg;

  /**
   * X offset (origin)
   * @type {Number}
   */
  var mX = 0;

  /**
   * Y offset (origin)
   * @type {Number}
   */
  var mY = 0;

  /**
   * Renders the label of a node, adjusting width to the length of the text
   * and centering the text inside the box
   * @param {String} label Text to display
   * @param {SVGElement} parent SVG parent node
   * @param {?Number} x X offset
   * @param {?Number} y Y offset
   * @return {Number} Returns the width of the rendered element
   */
  var drawLabel = function (label, parent, x, y) {
    var rect, text, width;

    x = x || 0;
    y = y || 0;
    width = Math.max(30, label.toString().length * 12);

    rect = document.createElementNS(NS, "rect");
    rect.setAttributeNS(null, "height", 30);
    rect.setAttributeNS(null, "width", width);
    rect.setAttributeNS(null, "x", x);
    rect.setAttributeNS(null, "y", y);
    parent.appendChild(rect);

    text = document.createElementNS(NS, "text");
    text.setAttributeNS(null, "dominant-baseline", "central");
    text.setAttributeNS(null, "text-anchor", "middle");
    text.setAttributeNS(null, "font-family", "Courier New");
    text.setAttributeNS(null, "x", x + width / 2);
    text.setAttributeNS(null, "y", y + 15);
    text.setAttributeNS(null, "width", width);
    text.textContent = label;
    parent.appendChild(text);

    return width;
  };

  /**
   * Render all the children and draw a bar on the left with small lines
   * connecting the bar to the labels of the children
   * @param {Array<Object>} List of nodes
   * @param {SVGElement} parent SVG parent node
   * @return {Number} Total height of the rendered elements
   */
  var drawChildren = function (nodes, parent) {
    var line, points = "30 30", off = 45, g, i;

    // Take care of the children
    for (i = 0; i < nodes.length; ++i) {
      g = document.createElementNS(NS, "g");
      g.setAttribute("transform", "translate(40," + off + ")");
      parent.appendChild(g);

      points += " 30 " + (off + 15);
      points += " 40 " + (off + 15);
      points += " 30 " + (off + 15);

      /*global drawAST */
      off += drawAST(nodes[i], g) + 5;
    }

    line = document.createElementNS(NS, "polyline");
    line.setAttributeNS(null, "points", points);
    parent.appendChild(line);

    return off;
  };

  /**
   * Renders a node and all of its children
   * @param {SVGElement} p SVG parent node
   * @return {Number} Height of the element which was rendered
   */
  var drawAST = function (node, p) {
    var text, line, g, lhs, rhs, cond;
    var w, h, i;

    switch (node.op) {
    case 'prog':
      drawLabel("PROG", p);
      return drawChildren(node.funcs, p);
    case 'func':
      text = 'FUNC ' + node.name + '(' + node.args.join(',') + ')';
      drawLabel(text, p);
      return drawChildren(node.body, p);
    case 'return':
      line = document.createElementNS(NS, "polyline");
      line.setAttributeNS(null, "points", "70 15 90 15");
      p.appendChild(line);

      g = document.createElementNS(NS, "g");
      g.setAttribute("transform", "translate(90, 0)");
      p.appendChild(g);

      drawLabel('RETURN', p);
      return drawAST(node.expr, g).height;
    case 'if':
      // Condition
      drawLabel('IF', p);
      g = document.createElementNS(NS, "g");
      g.setAttribute("transform", "translate(50, 0)");
      p.appendChild(g);
      line = document.createElementNS(NS, "line");
      line.setAttributeNS(null, "x1", "31");
      line.setAttributeNS(null, "y1", "15");
      line.setAttributeNS(null, "x2", "50");
      line.setAttributeNS(null, "y2", "15");
      p.appendChild(line);

      cond = drawAST(node.cond, g);
      h = 25 + cond.height;

      // True branch
      drawLabel('TRUE', p, 30, h - 15);
      g = document.createElementNS(NS, "g");
      g.setAttribute("transform", "translate(15, " + (h - 15) + ")");
      p.appendChild(g);
      line = document.createElementNS(NS, "polyline");
      line.setAttributeNS(null, "points", "15 30 15 " + h + " 30 " + h);
      p.appendChild(line);

      h += drawChildren(node['true'], g);

      // False branch
      drawLabel('FALSE', p, 30, h - 15);
      g = document.createElementNS(NS, "g");
      g.setAttribute("transform", "translate(15, " + (h - 15) + ")");
      p.appendChild(g);
      line = document.createElementNS(NS, "polyline");
      line.setAttributeNS(null, "points", "15 30 15 " + h + " 30 " + h);
      p.appendChild(line);
      h += drawChildren(node['false'], g);

      return h - 10;
    case 'bin':
      drawLabel(node.p, p);

      g = document.createElementNS(NS, "g");
      g.setAttribute("transform", "translate(0, 50)");
      p.appendChild(g);
      lhs = drawAST(node.lhs, g);

      g = document.createElementNS(NS, "g");
      g.setAttribute("transform", "translate(" + (5 + lhs.width) + ", 50)");
      p.appendChild(g);
      rhs = drawAST(node.rhs, g);

      line = document.createElementNS(NS, "line");
      line.setAttributeNS(null, "x1", "15");
      line.setAttributeNS(null, "y1", "30");
      line.setAttributeNS(null, "x2", "15");
      line.setAttributeNS(null, "y2", "50");
      p.appendChild(line);

      line = document.createElementNS(NS, "line");
      line.setAttributeNS(null, "x1", "15");
      line.setAttributeNS(null, "y1", "30");
      line.setAttributeNS(null, "x2", lhs.width + 15);
      line.setAttributeNS(null, "y2", "50");
      p.appendChild(line);

      return {
        'width': lhs.width + 5 + rhs.width,
        'height': Math.max(lhs.height, rhs.height) + 50
      };
    case 'call':
      for (i = 0, w = 0, h = 0; i < node.args.length; ++i) {
        g = document.createElementNS(NS, "g");
        g.setAttribute("transform", "translate(" + w + ", 50)");
        p.appendChild(g);

        line = document.createElementNS(NS, "line");
        line.setAttributeNS(null, "x1", "15");
        line.setAttributeNS(null, "y1", "30");
        line.setAttributeNS(null, "x2", w + 15);
        line.setAttributeNS(null, "y2", "50");
        p.appendChild(line);

        lhs = drawAST(node.args[i], g);
        w += lhs.width + 5;
        h = Math.max(h, lhs.height);
      }
      return {
        'width': Math.max(drawLabel(node.name + '(..)', p), w),
        'height': 50 + h
      };
    case 'num':
    case 'var':
      text = node[node.op === 'num' ? 'val' : 'name'];
      return {
        'width': drawLabel(text, p),
        'height': 30
      };
    }
  };

  /**
   * Check whether a node in the abstract syntax tree is correct or not
   * @param {Object} node Node to be checked
   * @param {Object<String, Int>} funcs Arities of defined functions
   * @param {List<String>} vars List of defined variable names
   */
  var checkAST = function (node, funcs, vars) {
    switch (node.op) {
    case 'func':
      node.args.map(function (arg) {
        vars.push(arg);
      });

      node.body.map(function (nd) {
        checkAST(nd, funcs, vars);
      });
      return;
    case 'return':
      checkAST(node.expr, funcs, vars);
      return;
    case 'if':
      checkAST(node.cond, funcs, vars);

      var vt = vars.slice(0);
      node.true.map(function (nd) {
        checkAST(nd, funcs, vt);
      });

      var vf = vars.slice(0);
      node.false.map(function (nd) {
        checkAST(nd, funcs, vf);
      });
      return;
    case 'call':
      if (!funcs[node.name]) {
        throw new Error('Undefined function "' + node.name + '"');
      }

      if (node.args.length < funcs[node.name]) {
        throw new Error('Too few arguments for "' + node.name + '"');
      }

      if (node.args.length > funcs[node.name]) {
        throw new Error('Too many arguments for "' + node.name + '"');
      }

      node.args.map(function (arg) {
        checkAST(arg, funcs, vars);
      });
      return;
    case 'bin':
      checkAST(node.lhs, funcs, vars);
      checkAST(node.rhs, funcs, vars);
      return;
    case 'var':
      if (vars.indexOf(node.name) === -1) {
        throw new Error('Undefined variable "' + node.name + '"');
      }
      return;
    case 'val':
      return;
    }
  };

  /**
   * Updates the tree
   * @param {Object} ast
   */
  env.drawAST = function (ast) {
    var g, i;

    // Delete the old drawing
    for (i = 0; i < svg.children.length; ++i) {
      svg.removeChild(svg.children[i]);
    }

    // Create a new root
    g = document.createElementNS(NS, "g");
    svg.appendChild(g);

    drawAST(ast, g);
  };

  /**
   * Performs type checking on the abstract syntax tree
   * @param {Object} ast Syntax tree to be checked
   * @throws {Error} Exception is throw when type check failed
   */
  env.checkAST = function (ast) {
    var arities = {}, i, j, idx, func;

    if (ast.op !== 'prog') {
      throw new Error('Invalid program');
    }

    for (i = 0; i < ast.funcs.length; ++i) {
      func = ast.funcs[i];
      if (func.op !== 'func') {
        throw new Error('Invalid function');
      }

      arities[func.name] = func.args.length;
      for (j = 0; j < func.args.length; ++j) {
        idx = func.args.indexOf(func.args[j]);
        if (idx !== j && idx !== -1) {
          throw new Error('Duplicate argument name "' + func.args[j] +
                          '" in "' + func.name + '"');
        }
      }
    }

    for (i = 0; i < ast.funcs.length; ++i) {
      checkAST(ast.funcs[i], arities, []);
    }
  };

  /**
   * Initialises the AST viewer
   */
  env.initAST = function () {
    svg = $("#ast-svg").get(0);

    $(svg)
      .on('selectstart', function (e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      })
      .on('mousedown', function (e) {
        var mx = e.pageX, my = e.pageY;
        var ox = mX, oy = mY;
        var root = svg.firstChild;

        $(this)
          .css('cursor', 'move')
          .on('mousemove.drag', function (e) {
            mX = ox - mx + e.pageX;
            mY = oy - my + e.pageY;
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
}(window.topics = window.topics || {}));

