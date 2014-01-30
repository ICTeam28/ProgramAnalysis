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
   * Executes a binary operation on the ast
   */
  env.binop = function (op, lhs, rhs) {
    switch (op) {
    case '==':
      return lhs === rhs ? 1 : 0;
    case '!=':
      return lhs !== rhs ? 1 : 0;
    case '<=':
      return lhs <= rhs ? 1 : 0;
    case '>=':
      return lhs >= rhs ? 1 : 0;
    case '<':
      return lhs < rhs ? 1 : 0;
    case '>':
      return lhs > rhs ? 1 : 0;
    case '&&':
      return lhs && rhs ? 1 : 0;
    case '||':
      return lhs || rhs ? 1 : 0;
    case '+':
      return lhs + rhs;
    case '-':
      return lhs - rhs;
    case '*':
      return lhs * rhs;
    case '/':
      return Math.floor(lhs / rhs);
    case '%':
      return Math.floor(lhs % rhs);
    case '^':
      return Math.pow(lhs, rhs);
    }
  };

  /**
   * Executes an unary operation
   */
  env.unop = function (op, val) {
    switch (op) {
    case '-':
      return -val;
    case '!':
      return val ? 0 : 1;
    case '~':
      return ~val;
    }
  };

  /**
   * Computes the number of nodes in a tree
   * @return Node count
   */
  var nodeCount = function (ast) {
    var count = 0;

    function all(body) {
      var i;
      for (i = 0; i < body.length; ++i) {
        count += nodeCount(body[i]);
      }
    }

    switch (ast.op) {
    case 'prog':
      all(ast.funcs);
      break;
    case 'func':
      all(ast.body);
      break;
    case 'return':
      count = nodeCount(ast.expr);
      break;
    case 'while':
      count = nodeCount(ast.cond);
      break;
    case 'assign':
      count = nodeCount(ast.expr);
      break;
    case 'if':
      count = nodeCount(ast.cond);
      all(ast.true);
      all(ast.false);
      break;
    case 'call':
      all(call.args);
      break;
    case 'bin':
      count = nodeCount(ast.lhs) + nodeCount(ast.rhs);
      break;
    }
    return count + 1;
  };

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
   * @param {Number} off Offset from the top
   * @return {Number} Total height of the rendered elements
   */
  var drawChildren = function (nodes, parent, off) {
    var line, points = "30 30", g, i;

    off = off || 45;

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
    var text, line, g, lhs, rhs, cond, tmp, expr;
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
    case 'while':
      // Predicate
      drawLabel('WHILE', p);
      g = document.createElementNS(NS, "g");
      g.setAttribute("transform", "translate(70, 0)");
      p.appendChild(g);

      line = document.createElementNS(NS, "line");
      line.setAttributeNS(null, "x1", "60");
      line.setAttributeNS(null, "y1", "15");
      line.setAttributeNS(null, "x2", "70");
      line.setAttributeNS(null, "y2", "15");
      p.appendChild(line);
      cond = drawAST(node.cond, g);

      // Body
      return drawChildren(node.body, p, 15 + cond.height);
    case 'assign':
      // Variable Name
      w = drawLabel(node.name, p);
      g = document.createElementNS(NS, "g");
      g.setAttribute("transform", "translate(" + (w + 10) + ", 0)");
      p.appendChild(g);

      line = document.createElementNS(NS, "line");
      line.setAttributeNS(null, "x1", w);
      line.setAttributeNS(null, "y1", "15");
      line.setAttributeNS(null, "x2", w + 10);
      line.setAttributeNS(null, "y2", "15");
      p.appendChild(line);
      expr = drawAST(node.expr, g);

      // Expression
      return drawChildren(node.expr, p, 10 + expr.height);
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
      h = 30 + cond.height;

      // True branch
      drawLabel('TRUE', p, 30, h - 15);
      g = document.createElementNS(NS, "g");
      g.setAttribute("transform", "translate(15, " + (h - 15) + ")");
      p.appendChild(g);
      line = document.createElementNS(NS, "polyline");
      line.setAttributeNS(null, "points", "15 30 15 " + h + " 30 " + h);
      p.appendChild(line);

      h += 10 + drawChildren(node['true'], g);

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

      if (nodeCount(node.lhs) > nodeCount(node.rhs)) {
        lhs = node.rhs;
        rhs = node.lhs;
      } else {
        lhs = node.lhs;
        rhs = node.rhs;
      }

      g = document.createElementNS(NS, "g");
      g.setAttribute("transform", "translate(0, 50)");
      p.appendChild(g);
      lhs = drawAST(lhs, g);

      g = document.createElementNS(NS, "g");
      g.setAttribute("transform", "translate(" + (5 + lhs.width) + ", 50)");
      p.appendChild(g);
      rhs = drawAST(rhs, g);

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

      w = lhs.width + rhs.width + 15;
      h = Math.max(lhs.height, rhs.height) + 50;

      if (node.oexpr) {
        g = document.createElementNS(NS, "g");
        g.setAttribute("class", "old");
        g.setAttribute("transform", "translate(" + w + ", 0)");
        p.appendChild(g);

        line = document.createElementNS(NS, "line");
        line.setAttributeNS(null, "class", "oldLine");
        line.setAttributeNS(null, "x1", "30");
        line.setAttributeNS(null, "y1", "15");
        line.setAttributeNS(null, "x2", w);
        line.setAttributeNS(null, "y2", "15");
        p.appendChild(line);

        lhs = drawAST(node.oexpr, g, true);
        w += lhs.width;
        h = Math.max(h, lhs.height);
      }

      return { 'width': w, 'height': h };
    case 'un':
      drawLabel(node.p, p);

      g = document.createElementNS(NS, "g");
      g.setAttribute("transform", "translate(0, 50)");
      p.appendChild(g);
      expr = drawAST(node.expr, g);

      line = document.createElementNS(NS, "line");
      line.setAttributeNS(null, "x1", "15");
      line.setAttributeNS(null, "y1", "30");
      line.setAttributeNS(null, "x2", "15");
      line.setAttributeNS(null, "y2", "50");
      p.appendChild(line);

      return {
        'width': expr.width,
        'height': 50 + expr.height
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

      if (node.oexpr) {
        g = document.createElementNS(NS, "g");
        g.setAttribute("class", "old");
        g.setAttribute("transform", "translate(60, 0)");
        p.appendChild(g);

        line = document.createElementNS(NS, "line");
        line.setAttributeNS(null, "class", "oldLine");
        line.setAttributeNS(null, "x1", "30");
        line.setAttributeNS(null, "y1", "15");
        line.setAttributeNS(null, "x2", "60");
        line.setAttributeNS(null, "y2", "15");
        p.appendChild(line);

        lhs = drawAST(node.oexpr, g, true);

        return {
          'width': 60 + drawLabel(text, p) + lhs.width,
          'height': lhs.height
        };
      }

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
    case 'while':
      checkAST(node.cond, funcs, vars);

      var vb = vars.slice(0);
      node.body.map(function (nd) {
        checkAST(nd, funcs, vb);
      });
      return;
    case 'assign':
      checkAST(node.expr, funcs, vars);
      if (vars.indexOf(node.name) === -1) {
        vars.push(node.name);
      }
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
      if (funcs[node.name] === undefined) {
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
    case 'un':
      checkAST(node.expr, funcs, vars);
      return;
    case 'var':
      if (vars.indexOf(node.name) === -1) {
        throw new Error('Undefined variable "' + node.name + '"');
      }
      return;
    case 'num':
      return;
    }
  };

  /**
   * Updates the tree
   * @param {Object} ast
   */
  env.drawAST = function (ast, svg) {
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
   * Simplifies the abstract syntax tree, but keeps the old expressions
   * as a subtree
   * @param {Object} ast Input tree
   * @return {Object} AST with constant expressions removed
   */
  env.pruneAST = function (ast) {
    // Lifts the child into the parent, execution the operation on constants
    var lift = function (a) {
      if (['+', '==', '*'].indexOf(a.p) === -1) {
        return false;
      }
      // Descends down the tree and finds another node which takes a constant
      // and an expression
      function descend(node, val) {
        var branch;

        if (node.op !== 'bin' || a.p !== node.p) {
          return;
        }

        if (node.lhs.op === 'num') {
          return {
            'op': 'bin',
            'p': node.p,
            'rhs': node.rhs,
            'lhs': {
              'op': 'num',
              'val': env.binop(node.p, node.lhs.val, val)
            }
          }
        }

        if (node.rhs.op === 'num') {
          return {
            'op': 'bin',
            'p': node.p,
            'lhs': node.lhs,
            'rhs': {
              'op': 'num',
              'val': env.binop(node.p, node.rhs.val, val)
            }
          }
        }

        if (branch = descend(node.lhs, val)) {
          return {
            'op': 'bin',
            'p': node.p,
            'lhs': branch,
            'rhs': node.rhs
          };
        }

        if (branch = descend(node.rhs, val)) {
          return {
            'op': 'bin',
            'p': node.p,
            'lhs': node.lhs,
            'rhs': branch
          };
        }

        return false;
      }

      if (a.rhs.op === 'num') {
        return descend($.extend(true, {}, a.lhs), a.rhs.val);
      }

      if (a.lhs.op === 'num') {
        return descend($.extend(true, {}, a.rhs), a.lhs.val);
      }

      return false;
    };

    var expr, lhs, rhs, val, lhso, rhso;
    switch (ast.op) {
    case 'prog':
      ast.funcs = ast.funcs.map(env.pruneAST);
      return ast;
    case 'func':
      ast.body = ast.body.map(env.pruneAST);
      return ast;
    case 'return':
      ast.expr = env.pruneAST(ast.expr);
      return ast;
    case 'while':
      ast.cond = env.pruneAST(ast.cond);
      ast.body = ast.body.map(env.pruneAST);
      return ast;
    case 'assign':
      ast.expr = env.pruneAST(ast.expr);
      return ast;
    case 'if':
      ast.cond = env.pruneAST(ast.cond);
      ast.true = ast.true.map(env.pruneAST);
      ast.false = ast.false.map(env.pruneAST);
      return ast;
    case 'call':
      ast.args = ast.args.map(env.pruneAST);
      return ast;
    case 'bin':
      lhso = $.extend(true, {}, ast.lhs);
      rhso = $.extend(true, {}, ast.rhs);
      lhs = env.pruneAST(ast.lhs);
      rhs = env.pruneAST(ast.rhs);
      if (lhs.op === 'num' && rhs.op === 'num') {
        val = env.binop(ast.p, lhs.val, rhs.val);
        return {
          'op': 'num',
          'val': val,
          'oexpr': ast
        };
      } else if (ast.p === '*') {
        if (lhs.val === 0 || rhs.val === 0) {
          return {
            'op': 'num',
            'val': 0,
            'oexpr': ast
          }
        } else if (lhs.val === 1 || rhs.val === 1) {
          val = $.extend(true, {}, lhs.val === 1 ? rhs : lhs);
          val.oexpr = { 'op': 'bin', 'p': ast.p, 'rhs': rhso, 'lhs': lhso };
          return val;
        }
      } else if (ast.p === '+') {
        if (lhs.val === 0 || rhs.val === 0) {
          val = $.extend(true, {}, lhs.val === 0 ? rhs : lhs);
          val.oexpr = { 'op': 'bin', 'p': ast.p, 'rhs': rhso, 'lhs': lhso };
          return val;
        }
      }

      // TODO: Implement identity elements for '-' and '/'

      ast.lhs = lhs;
      ast.rhs = rhs;
      if (val = lift(ast)) {
        val.oexpr = {
          'op': 'bin',
          'p': ast.p,
          'rhs': rhso,
          'lhs': lhso
        };

        return val;
      }
      return ast;
    case 'un':
      expr = env.pruneAST(ast.expr);
      if (expr.op === 'num') {
        return {
          'op': 'num',
          'val': env.unop(ast.p, expr.val),
          'oexpr': ast
        };
      } else if (expr.op === 'un' && expr.p === ast.p) {
        val = $.extend(true, {}, expr.expr);
        val.oexpr = ast;
        return val;
      }

      ast.expr = expr;
      return ast;
    default:
      return ast;
    }
  };
}(window.topics = window.topics || {}));

