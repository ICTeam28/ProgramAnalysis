/*jslint browser:true, ass:true */
/**
 * Computing topics project
 * This module is responsible for generating the intermediate
 * form of a program
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
   * Tab which hold the code for every function
   * @type {?HTMLDivElement}
   */
  var tabs = null;

  /**
   * Tab header list
   * @type {?HTMLUlElement}
   */
  var tabHeaders = null;

  /**
   * Index of the next available label
   * @type {Number}
   */
  var nextLabel = 0;

  /**
   * Intermediate form instruction
   * @param {String} op Instruction opcode
   * @constructor
   */
  var ImmInstr = function (op, arg1, arg2, arg3) {
    this.op = op;
    switch (this.op) {
    case 'lbl':
      this.label = arg1;
      break;
    case 'ret':
      this.reg = arg1;
      break;
    case 'const':
      this.dest = arg1;
      this.src = arg2;
      break;
    case 'var':
      this.dest = arg1;
      this.src = arg2;
      break;
    case 'bin':
      this.p = arg1;
      this.dest = arg2;
      this.src = arg3;
      break;
    case 'un':
      this.p = arg1;
      this.reg = arg2;
      break;
    case 'jmp':
      this.label = arg1;
      break;
    case 'cjmp':
      this.reg = arg1;
      this.label = arg2;
      break;
    case 'arg':
      this.reg = arg1;
      break;
    case 'call':
      this.reg = arg1;
      this.func = arg2;
      break;
    }
  };

  /**
   * Converts an instruction to a string
   * @this {ImmInstr}
   */
  ImmInstr.prototype.toString = function () {
    switch (this.op) {
    case 'lbl':
      return this.label + ':';
    case 'ret':
      return 'ret ' + this.reg;
    case 'const':
      return 'const ' + this.dest + ', $' + this.src;
    case 'var':
      return 'var ' + this.dest + ', ' + this.src;
    case 'bin':
      return '(' + this.p + ') ' + this.dest + ', ' + this.src;
    case 'un':
      return '(' + this.p + ') ' + this.reg;
    case 'jmp':
      return 'jmp ' + this.label;
    case 'cjmp':
      return 'cjmp ' + this.reg + ', ' + this.label;
    case 'arg':
      return 'arg ' + this.reg;
    case 'call':
      return 'call ' + this.reg + ', ' + this.func;
    }
  };

  /**
   * Generates code for an expression
   * @return Index of the register where the result is stored
   */
  var generateExpr = function (node, imf, r) {
    switch (node.op) {
    case 'num':
      imf.push(new ImmInstr('const', '@' + r, node.val));
      return r;
    case 'var':
      imf.push(new ImmInstr('var', '@' + r, node.name));
      return r;
    case 'bin':
      generateExpr(node.lhs, imf, r);
      generateExpr(node.rhs, imf, r + 1);
      imf.push(new ImmInstr('bin', node.p, '@' + r, '@' + (r + 1)));
      return r;
    case 'un':
      generateExpr(node.expr, imf, r);
      imf.push(new ImmInstr('un', node.p, '@' + r));
      return r;
    case 'call':
      node.args.map(function (arg) {
        generateExpr(arg, imf, r);
        imf.push(new ImmInstr('arg', '@' + r));
      });

      imf.push(new ImmInstr('call', '@' + r, node.name));
      return r;
    }

    return 0;
  };

  /**
   * Generates code for a statement
   * @param {Object} Node of the Abstract Syntax tree
   * @param {Array<ImmInstr>} List which collects information
   */
  var generate = function (node, imf) {
    var lend, ltrue, i;

    switch (node.op) {
    case 'func':
      imf.push(new ImmInstr('lbl', 'f_' + node.name));
      for (i = 0; i < node.body.length; ++i) {
        generate(node.body[i], imf);
      }

      break;
    case 'return':
      imf.push(new ImmInstr('ret', '@' + generateExpr(node.expr, imf, 0)));
      break;
    case 'if':
      lend = 'L' + (nextLabel++);
      ltrue = 'L' + (nextLabel++);

      generateExpr(node.cond, imf, 0);
      imf.push(new ImmInstr('cjmp', '@0', ltrue));

      // False branch
      for (i = 0; i < node.false.length; ++i) {
        generate(node.false[i], imf);
      }
      imf.push(new ImmInstr('jmp', lend));

      // True branch
      imf.push(new ImmInstr('lbl', ltrue));
      for (i = 0; i < node['true'].length; ++i) {
        generate(node['true'][i], imf);
      }
      imf.push(new ImmInstr('lbl', lend));

      break;
    }
  };

  /**
   * Draws an intermediate instruction
   * @param {Number} i Index of the operation
   * @param {ImmInstr} ops List of all instructions
   * @param {SVGSVGElement} p Parent SVG Node
   */
  var draw = function (i, ops, p) {
    var g, rect, line, text, op, points, j, y;

    op = ops[i];
    y = i * 100;

    g = document.createElementNS(NS, "g");
    g.setAttribute("transform", "translate(0, " + y + ")");
    p.appendChild(g);

    rect = document.createElementNS(NS, "rect");
    rect.setAttributeNS(null, "height", 50);
    rect.setAttributeNS(null, "width", 200);
    rect.setAttributeNS(null, "x", 0);
    rect.setAttributeNS(null, "y", 0);
    g.appendChild(rect);

    text = document.createElementNS(NS, "text");
    text.setAttributeNS(null, "dominant-baseline", "central");
    text.setAttributeNS(null, "text-anchor", "middle");
    text.setAttributeNS(null, "font-family", "Courier New");
    text.setAttributeNS(null, "width", 200);
    text.setAttributeNS(null, "height", 50);
    text.setAttributeNS(null, "x", 100);
    text.setAttributeNS(null, "y", 25);
    text.textContent = op.toString();
    g.appendChild(text);

    // Every instruction except return has a successor, so we draw a line
    if (i + 1 !== ops.length && op.op !== 'ret') {
      points = "100 50 100 100";
      line = document.createElementNS(NS, "polyline");
      line.setAttributeNS(null, "points", points);
      line.setAttributeNS(null, "marker-end", "url(#arrow)");
      g.appendChild(line);
    }

    switch (op.op) {
    case 'lbl':
      rect.setAttributeNS(null, 'style', 'fill:green');
      for (j = 0; j < i; ++j) {
        if (ops[j].label && ops[j].label === op.label) {
          points = "M200 " + (j * 100 + 25);
          points += " Q 250 " + ((i + j) * 50);
          points += ", 200 " + (i * 100);

          line = document.createElementNS(NS, "path");
          line.setAttributeNS(null, "d", points);
          line.setAttributeNS(null, "marker-end", "url(#arrow)");
          p.appendChild(line);
        }
      }
      break;
    case 'jmp':
      rect.setAttributeNS(null, 'style', 'fill:#00cc00');
      break;
    case 'cjmp':
      rect.setAttributeNS(null, 'style', 'fill:#00cc00');
      break;
    case 'ret':
      text.textContent = 'ret ' + op.reg;
      rect.setAttributeNS(null, 'style', 'fill:blue');
      break;
    }
  };

  /**
   * Adds an arrow marker to the document
   * @param {SVGSVGElement} svg
   */
  var drawMarker = function (svg) {
    var defs, marker, path;

    defs = document.createElementNS(NS, "defs");
    svg.appendChild(defs);

    marker = document.createElementNS(NS, "marker");
    marker.setAttributeNS(null, "id", "arrow");
    marker.setAttributeNS(null, "orient", "auto");
    marker.setAttributeNS(null, "markerWidth", "6");
    marker.setAttributeNS(null, "markerHeight", "6");
    marker.setAttributeNS(null, "viewBox", "0 0 10 10");
    marker.setAttributeNS(null, "refX", "10");
    marker.setAttributeNS(null, "refY", "5");
    defs.appendChild(marker);

    path = document.createElementNS(NS, "path");
    path.setAttributeNS(null, "class", "arrow");
    path.setAttributeNS(null, "d", "M 0 0 L 10 5 L 0 10 z");
    marker.appendChild(path);
  };

  /**
   * Generates the intermediate form representation of a program
   * @param {Object} ast Abstract syntax tree
   * @return {Object<String, Array<ImmInstr>} Intermediate form
   */
  env.genIMF = function (ast) {
    var i = 0, name, imf = {}, code = [];

    for (i = 0; i < ast.funcs.length; ++i) {
      name = ast.funcs[i].name;
      nextLabel = 0;
      code = [];
      generate(ast.funcs[i], code);
      imf[name] = code;
    }

    return imf;
  };

  /**
   * Converts the abstract syntax tree into immediate form
   * @param {Object<String, Array<ImmInstr>} imf Intermediate form
   */
  env.drawIMF = function (imf) {
    var name, svg, i;

    nextLabel = 0;

    // Reset the tab views
    $(">div", tabs).remove();
    $(">ul li", tabs).remove();
    tabs.tabs("destroy");

    for (name in imf) {
      if (imf.hasOwnProperty(name)) {
        svg = document.createElementNS(NS, 'svg');
        drawMarker(svg);

        for (i = 0; i < imf[name].length; ++i) {
          draw(i, imf[name], svg);
        }

        svg.style.height = (imf[name].length * 100) + "px";
        tabHeaders.append('<li><a href="#f' + name + '">' + name + '</a></li>');
        tabs.append($("<div id ='f" + name + "'></div>").append(svg));
      }
    }


    tabs.tabs();
  };

  /**
   * Initialises the intermediate form viewer
   */
  env.initIMF = function () {
    tabs = $("#imf-tabs").tabs();
    tabHeaders = $("#imf-tabs > ul");
  };
}(window.topics = window.topics || {}));
