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
    case 'goto':
      count = 0;
      break;
    case 'label':
      count = 0;
      break;
    case 'call':
      all(ast.args);
      break;
    case 'bin':
      count = nodeCount(ast.lhs) + nodeCount(ast.rhs);
      break;
    case 'un':
      count = nodeChound(ast.expr);
      break;
    }

    return count + 1;
  };

  /**
   * Generates Semantic error messages
   * @param {Object} location Location, as specified by the parser
   * @param {String} message Message to be displayed
   */
  env.SemanticError = function (location, message) {
    this.line = location.first_line;
    this.char = location.first_column;
    this.message = message;
  };

  /**
   * Converts an error message to a string in a format similar to JISON
   * @param {?String} Input source code
   */
  env.SemanticError.prototype.toString = function (src) {
    var msg = '', line = 1, chr = 0, i, buf = '', j = 0, found = false;

    msg += 'Error: Semantic error on line ' + this.line + ':\n';
    if (src) {
      for (i = 0; i < src.length; ++i) {
        if (src.charAt(i) === '\n') {
          line++;
          chr = 0;
        } else {
          chr++;
          buf += src.charAt(i);
          j += found ? 0 : 1;
        }

        if (line === this.line && chr === this.char) {
          found = true;
        }
      }

      if (j < 22) {
        msg += buf.substring(0, 40) + '\n';
        msg += new Array(j + 1).join('-') + '^\n';
      } else {
        msg += '...' + buf.substring(j - 18, j + 22) + '\n';
        msg += '---------------------^\n';
      }
    }
    msg += this.message;

    return msg;
  };

  /**
   * Renders the label of a node, adjusting width to the length of the text
   * and centering the text inside the box
   * @param {String} label Text to display
   * @param {Object} loc Token  location
   * @param {SVGElement} parent SVG parent node
   * @param {?Number} x X offset
   * @param {?Number} y Y offset
   * @return {Number} Returns the width of the rendered element
   */
  var drawLabel = function (label, loc, parent, x, y) {
    var rect, text, width, range;

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

    if (loc) {
      range = new env.AceRange(loc.first_line - 1, loc.first_column,
                               loc.last_line - 1, loc.last_column);

      $(rect).click(function () {
        if (env.marker) {
          env.editor.removeMarker(env.marker);
          env.marker = null;
        }

        env.marker = env.editor.addMarker(range, "ace_selection", "text");
      });
    }

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
    var line, points = "30 30", g, i, w = 0, child;

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
      child = drawAST(nodes[i], g);
      w = Math.max(w, child.width);
      off += child.height + 5;
    }

    line = document.createElementNS(NS, "polyline");
    line.setAttributeNS(null, "points", points);
    parent.appendChild(line);

    return { 'width': w + 40, 'height': off };
  };

  /**
   * Renders a node and all of its children
   * @param {SVGElement} p SVG parent node
   * @return {Number} Height of the element which was rendered
   */
  var drawAST = function (node, p) {
    var text, line, g, lhs, rhs, cond, expr, child;
    var w, h, i;

    switch (node.op) {
    case 'prog':
      drawLabel("PROG", node.loc, p);
      child = drawChildren(node.funcs, p);

      return {
        'width': Math.max(50, child.width + 5),
        'height': Math.max(30, child.height + 5)
      };
    case 'func':
      text = 'FUNC ' + node.name + '(' + node.args.join(',') + ')';
      w = drawLabel(text, node.loc, p);
      child = drawChildren(node.body, p);

      return {
        'width': Math.max(w, child.width),
        'height': child.height
      };
    case 'return':
      line = document.createElementNS(NS, "polyline");
      line.setAttributeNS(null, "points", "70 15 90 15");
      p.appendChild(line);

      g = document.createElementNS(NS, "g");
      g.setAttribute("transform", "translate(90, 0)");
      p.appendChild(g);

      drawLabel('RETURN', node.loc, p);
      child = drawAST(node.expr, g);

      return { 'width': child.width + 90, 'height': child.height };
    case 'label':
      w = drawLabel('LABEL ' + node.label + ':', node.loc, p);
      return {
        'width': w,
        'height': 30
      };
    case 'goto':
      w = drawLabel('GOTO ' + node.label, node.loc, p);
      return {
        'width': w,
        'height': 30
      };
    case 'while':
      // Predicate
      drawLabel('WHILE', node.loc, p);
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
      child = drawChildren(node.body, p, 15 + cond.height);

      return {
        'width': Math.max(child.width, cond.width + 70),
        'height': child.height
      };
    case 'assign':
      // Variable Name
      w = drawLabel(node.name, node.loc, p);
      g = document.createElementNS(NS, "g");
      g.setAttribute("transform", "translate(" + (w + 10) + ", 0)");
      p.appendChild(g);

      line = document.createElementNS(NS, "line");
      line.setAttributeNS(null, "x1", w);
      line.setAttributeNS(null, "y1", "15");
      line.setAttributeNS(null, "x2", w + 10);
      line.setAttributeNS(null, "y2", "15");
      p.appendChild(line);

      // Expression
      return drawAST(node.expr, g);
    case 'if':
      // Condition
      drawLabel('IF', node.loc, p);
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
      w = cond.width + 50;

      // True branch
      drawLabel('TRUE', node.loc, p, 30, h - 15);
      g = document.createElementNS(NS, "g");
      g.setAttribute("transform", "translate(15, " + (h - 15) + ")");
      p.appendChild(g);
      line = document.createElementNS(NS, "polyline");
      line.setAttributeNS(null, "points", "15 30 15 " + h + " 30 " + h);
      p.appendChild(line);

      child = drawChildren(node['true'], g);
      h += 10 + child.height;
      w = Math.max(w, child.width + 30);

      // False branch
      drawLabel('FALSE', node.loc, p, 30, h - 15);
      g = document.createElementNS(NS, "g");
      g.setAttribute("transform", "translate(15, " + (h - 15) + ")");
      p.appendChild(g);
      line = document.createElementNS(NS, "polyline");
      line.setAttributeNS(null, "points", "15 30 15 " + h + " 30 " + h);
      p.appendChild(line);

      child = drawChildren(node['false'], g);
      h += child.height;
      w = Math.max(w, child.width + 30);

      return { 'width': w, 'height': h - 10 };
    case 'bin':
      drawLabel(node.p, node.loc, p);

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
      drawLabel(node.p, node.loc, p);

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
        'width': Math.max(drawLabel(node.name + '(..)', node.loc, p), w),
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
          'width': 60 + drawLabel(text, node.loc, p) + lhs.width,
          'height': lhs.height
        };
      }

      return {
        'width': drawLabel(text, node.loc, p),
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
        throw new env.SemanticError(node.loc, "Undefined function: '" +
                                              node.name + "'");
      }

      if (node.args.length < funcs[node.name]) {
        throw new env.SemanticError(node.loc, "Too few arguments to '" +
                                              node.name + "'");
      }

      if (node.args.length > funcs[node.name]) {
        throw new env.SemanticError(node.loc, 'Too many arguments',
                                    node.args.length, funcs[node.name]);
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
        throw new env.SemanticError(node.loc, "Undefined variable '" +
                                              node.name + "'");
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
    var g, i, size;

    // Delete the old drawing
    for (i = 0; i < svg.childNodes.length; ++i) {
      svg.removeChild(svg.childNodes[i]);
    }

    // Create a new root
    g = document.createElementNS(NS, "g");
    svg.appendChild(g);

    size = drawAST(ast, g);
    svg.style.width = size.width + "px";
    svg.style.height = size.height + "px";
  };

  /**
   * Performs type checking on the abstract syntax tree
   * @param {Object} ast Syntax tree to be checked
   * @throws {Error} Exception is throw when type check failed
   */
  env.checkAST = function (ast) {
    var arities = {}, i, j, idx, f;

    if (ast.op !== 'prog') {
      throw new env.SemanticError({ 'first_char': 0, 'first_line': 0 },
                                  'Invalid program');
    }

    for (i = 0; i < ast.funcs.length; ++i) {
      f = ast.funcs[i];
      if (f.op !== 'func') {
        throw new env.SemanticError(f.loc, 'Invalid function');
      }

      arities[f.name] = f.args.length;
      for (j = 0; j < f.args.length; ++j) {
        idx = f.args.indexOf(f.args[j]);
        if (idx !== j && idx !== -1) {
          throw new env.SemanticError(f.loc, 'Duplicate name "' + f.args[j] +
                                             '" in "' + f.name + '"');
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
          return false;
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
          };
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
          };
        }

        if ((branch = descend(node.lhs, val)) !== false) {
          return {
            'op': 'bin',
            'p': node.p,
            'lhs': branch,
            'rhs': node.rhs
          };
        }

        if ((branch = descend(node.rhs, val)) !== false) {
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
      }

      if (ast.p === '*') {
        if (lhs.val === 0 || rhs.val === 0) {
          return {
            'op': 'num',
            'val': 0,
            'oexpr': ast
          };
        }

        if (lhs.val === 1 || rhs.val === 1) {
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
      if ((val = lift(ast)) !== false) {
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
      }

      if (expr.op === 'un' && expr.p === ast.p) {
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

