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
   * Colours used for the interference graph
   * @type {List<String>}
   * @const
   */
  var COLOURS = [
    "#ff0000", "#00ff00", "#0000ff",
    "#ffff00", "#00ffff", "#ff00ff",
    "#cc0000", "#00cc00", "#0000cc",
    "#cccc00", "#00cccc", "#cc00cc",
  ];

  /**
   * Priority of operators
   * @type {Object<String, Number>}
   * @const
   */
  var PRIORITY = {
    '&&': 0,
    '||': 0,
    '==': 1,
    '!=': 1,
    '<' : 1,
    '<=': 1,
    '>' : 1,
    '>=': 1,
    '+' : 2,
    '-':  2,
    '*' : 3,
    '/' : 3,
    '%':  3,
    '^':  4,
    '!' : 5,
    '~':  5
  };

  /**
   * Tab which hold the code for every function
   * @type {?HTMLDivElement}
   */
  var tabs = null;

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
  var ImmInstr = function (op, arg1, arg2) {
    this.op = op;
    this.next = [];
    this.rd = { 'in': [], 'out': [] };
    this.lv = { 'in': [], 'out': [] };

    switch (this.op) {
    case 'lbl':
      this.label = arg1;
      break;
    case 'ret':
      this.expr = arg1;
      break;
    case 'jmp':
      this.label = arg1;
      break;
    case 'cjmp':
      this.expr = arg1;
      this.label = arg2;
      break;
    case 'njmp':
      this.expr = arg1;
      this.label = arg2;
      break;
    case 'arg':
      this.arg = arg1;
      this.expr = arg2;
      break;
    case 'call':
      this.expr = arg1;
      this.func = arg2;
      break;
    case 'str':
      this.dest = arg1;
      this.expr = arg2;
      break;
    }
  };

  /**
   * Converts an expression into a string
   * @param {Object} node
   * @return {String}
   */
  var exprToString = function (node) {
    var str;

    switch (node.op) {
    case 'num':
      return node.val;
    case 'var':
      return node.name;
    case 'bin':
      str = '';
      if (node.lhs.op === 'bin' && PRIORITY[node.lhs.p] < PRIORITY[node.p]) {
        str += '(' + exprToString(node.lhs) + ')';
      } else {
        str += exprToString(node.lhs);
      }

      str += node.p;

      if (node.rhs.op === 'bin' && PRIORITY[node.rhs.p] < PRIORITY[node.p]) {
        str += '(' + exprToString(node.rhs) + ')';
      } else {
        str += exprToString(node.rhs);
      }
      return str;
    case 'un':
      return '(' + node.p + exprToString(node.expr) + ')';
    case 'call':
      return node.name + '(' + node.args.map(exprToString).join(',') + ')';
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
      return 'ret ' + exprToString(this.expr);
    case 'jmp':
      return 'jmp ' + this.label;
    case 'cjmp':
      return 'cjmp ' + this.label + ',' + exprToString(this.expr);
    case 'njmp':
      return 'njmp ' + this.label + ',' + exprToString(this.expr);
    case 'str':
      return 'str ' + this.dest + ',' + exprToString(this.expr);
    }
  };

  /**
   * Draws an intermediate instruction
   * @param {Number} i Index of the operation
   * @param {ImmInstr} ops List of all instructions
   * @param {SVGSVGElement} p Parent SVG Node
   */
  var draw = function (i, ops, p) {
    var g, rect, line, text, op, points, j, y, str;

    op = ops[i];
    str = op.toString();
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
    text.textContent = (str.length > 16) ? (str.substr(0, 13) + "...") : str;
    g.appendChild(text);

    // Draw line to the direct successor (if applicable)
    if (op.next.indexOf(i + 1) !== -1 && ops[i + 1]) {
      points = "100 50 100 100";
      line = document.createElementNS(NS, "polyline");
      line.setAttributeNS(null, "points", points);
      line.setAttributeNS(null, "marker-end", "url(#arrowEnd)");
      g.appendChild(line);
    }

    // Draw a curved line on the right to successors
    for (j = 0; j < op.next.length; ++j) {
      if (op.next[j] !== i + 1) {
        if (op.next[j] < i) {
          points = "M200 " + (i * 100 + 25);
          points += " Q 250 " + ((i + op.next[j]) * 50);
          points += ", 200 " + (op.next[j] * 100 + 50);
        } else {
          points = "M200 " + (i * 100 + 25);
          points += " Q 250 " + ((i + op.next[j]) * 50);
          points += ", 200 " + (op.next[j] * 100);
        }

        line = document.createElementNS(NS, "path");
        line.setAttributeNS(null, "d", points);
        line.setAttributeNS(null, "marker-end", "url(#arrowEnd)");
        p.appendChild(line);
      }
    }

    switch (op.op) {
    case 'lbl':
      rect.setAttributeNS(null, 'style', 'fill:green');
      break;
    case 'jmp':
      rect.setAttributeNS(null, 'style', 'fill:#00cc00');
      break;
    case 'cjmp':
      rect.setAttributeNS(null, 'style', 'fill:#00cc00');
      break;
    case 'ret':
      rect.setAttributeNS(null, 'style', 'fill:blue');
      break;
    }
  };

  /**
   * Adds an arrow marker to the document
   * @param {SVGSVGElement} svg
   */
  var drawMarker = function (svg, s) {
    var defs, marker, path, points;

    s = s || 10;

    defs = document.createElementNS(NS, "defs");
    svg.appendChild(defs);

    // End marker
    points = "M 0 0 L " + s + " " + (s / 2) + " L 0 " + s + " z";
    marker = document.createElementNS(NS, "marker");
    marker.setAttributeNS(null, "id", "arrowEnd");
    marker.setAttributeNS(null, "orient", "auto");
    marker.setAttributeNS(null, "markerWidth", s / 2 + 1);
    marker.setAttributeNS(null, "markerHeight", s / 2 + 1);
    marker.setAttributeNS(null, "viewBox", "0 0 " + s + " " + s);
    marker.setAttributeNS(null, "refX", s);
    marker.setAttributeNS(null, "refY", s / 2);
    defs.appendChild(marker);

    path = document.createElementNS(NS, "path");
    path.setAttributeNS(null, "class", "arrow");
    path.setAttributeNS(null, "d", points);
    marker.appendChild(path);

    // Start marker
    points = "M 0 " + (s / 2) + " L " + s + " 0 L " + s + " " + s + " z";
    marker = document.createElementNS(NS, "marker");
    marker.setAttributeNS(null, "id", "arrowStart");
    marker.setAttributeNS(null, "orient", "auto");
    marker.setAttributeNS(null, "markerWidth", s / 2 + 1);
    marker.setAttributeNS(null, "markerHeight", s / 2 + 1);
    marker.setAttributeNS(null, "viewBox", "0 0 " + s + " " + s);
    marker.setAttributeNS(null, "refX", 0);
    marker.setAttributeNS(null, "refY", s / 2);
    defs.appendChild(marker);

    path = document.createElementNS(NS, "path");
    path.setAttributeNS(null, "class", "arrow");
    path.setAttributeNS(null, "d", points);
    marker.appendChild(path);
  };

  /**
   * Draws the instructions and the links between them
   * @param {List<ImmInstr>} imf
   * @return {SVGSVGDocument}
   */
  var drawIMF = function (imf) {
    var svg, i, h = 0;

    svg = document.createElementNS(NS, 'svg');
    svg.setAttributeNS(null, 'class', 'imf');

    drawMarker(svg);
    for (i in imf) {
      if (imf.hasOwnProperty(i)) {
        draw(parseInt(i, 10), imf, svg);
        h += 100;
      }
    }

    svg.style.height = h + "px";
    return svg;
  };

  /**
   * Draws the interference graph
   */
  var drawIGraph = function (igraph) {
    var svg, i, j, index = {};

    svg = document.createElementNS(NS, 'svg');
    svg.setAttributeNS(null, 'class', 'igraph');
    svg.setAttributeNS(null, 'preserveAspectRatio', 'xMidYMin meet');
    svg.setAttributeNS(null, 'viewBox', '0 0 1000 1000');
    drawMarker(svg, 20);

    var count = 0;
    for (i in igraph.graph) {
      if (igraph.graph.hasOwnProperty(i)) {
        index[i] = count++;
      }
    }

    var idx = 0, idxp, x, y, angle, anglep, ad, points, mdl, diff;
    var g, text, circle, line;
    for (i in igraph.graph) {
      if (igraph.graph.hasOwnProperty(i)) {
        angle = (idx / count) * 2 * Math.PI - Math.PI / 2;
        for (j = 0; j < igraph.graph[i].length; ++j) {
          if (igraph.graph[i][j] > i) {
            continue;
          }

          idxp = index[igraph.graph[i][j]];
          anglep = (idxp / count) * 2 * Math.PI - Math.PI / 2;
          diff = idx - idxp;

          if (Math.abs(diff) === 1 || diff === count - 1) {
            mdl = (angle + anglep) / 2;
            ad = 0.11 * (idx - idxp) / Math.abs(diff);
            if (diff === count - 1) {
              mdl += Math.PI;
              ad = -ad;
            }

            points = "M";
            points += Math.floor(500 + Math.cos(angle - ad) * 450) + " ";
            points += Math.floor(500 + Math.sin(angle - ad) * 450) + " ";
            points += "Q ";
            points += Math.floor(500 + Math.cos(mdl) * 450) + " ";
            points += Math.floor(500 + Math.sin(mdl) * 450) + " ";
            points += Math.floor(500 + Math.cos(anglep + ad) * 450) + " ";
            points += Math.floor(500 + Math.sin(anglep + ad) * 450);
          } else {
            points = "M";
            points += Math.floor(500 + Math.cos(angle) * 400) + " ";
            points += Math.floor(500 + Math.sin(angle) * 400) + " ";
            points += "Q 500 500, ";
            points += Math.floor(500 + Math.cos(anglep) * 400) + " ";
            points += Math.floor(500 + Math.sin(anglep) * 400);
          }

          line = document.createElementNS(NS, "path");
          line.setAttributeNS(null, "d", points);
          line.setAttributeNS(null, "marker-end", "url(#arrowEnd)");
          line.setAttributeNS(null, "marker-start", "url(#arrowStart)");
          svg.appendChild(line);
        }

        x = Math.floor(500 + Math.cos(angle) * 450);
        y = Math.floor(500 + Math.sin(angle) * 450);

        g = document.createElementNS(NS, "g");
        g.setAttributeNS(null, "transform", "translate(" + x + "," + y + ")");
        svg.appendChild(g);

        circle = document.createElementNS(NS, 'circle');
        circle.setAttributeNS(null, 'cx', 0);
        circle.setAttributeNS(null, 'cy', 0);
        circle.setAttributeNS(null, 'r', 50);
        circle.setAttributeNS(null, 'fill', COLOURS[igraph.colour[i]]);
        g.appendChild(circle);

        text = document.createElementNS(NS, 'text');
        text.setAttributeNS(null, "x", 0);
        text.setAttributeNS(null, "y", 0);
        text.textContent = i;
        g.appendChild(text);


        ++idx;
      }
    }

    return svg;
  };

  /**
   * Builds the control flow graph
   * @param {List<ImmInstr>} imf
   * @return {Object<Number, ImmInstr>} graph
   */
  var buildGraph = function (imf) {
    var graph = {}, i, j, next;

    for (i = 0; i < imf.length; ++i) {
      graph[i] = imf[i];

      // Search for jump targets
      if (imf[i].op !== 'lbl' && imf[i].label) {
        for (j = 0; j < imf.length; ++j) {
          if (imf[j].op === 'lbl' && imf[j].label === imf[i].label) {
            next = j;
            break;
          }
        }
      }

      switch (imf[i].op) {
      case 'jmp':
        // Jumps transfer control to the target label
        graph[i].next = [next];
        break;
      case 'cjmp':
      case 'njmp':
        // Conditional jumps go to the label or the next instruction
        graph[i].next = [i + 1, next];
        break;
      case 'ret':
        // Return goes nowhere, but it has side effects
        graph[i].next = [];
        break;
      default:
        // Normal instructions lead to the next instruction in the queue
        graph[i].next = [i + 1];
        break;
      }
    }

    return graph;
  };


  /**
   * Generates code for a statement
   * @param {Object} Node of the Abstract Syntax tree
   * @param {Array<ImmInstr>} imf List which collects information
   * @param {Object<String, List<String>} fs Function arguments
   */
  var generate = function (node, imf, fs) {
    var lend, ltrue, i, lcond;

    switch (node.op) {
    case 'func':
      imf.push(new ImmInstr('lbl', 'f_' + node.name));
      for (i = 0; i < node.body.length; ++i) {
        generate(node.body[i], imf, fs);
      }
      imf.push(new ImmInstr('ret', { 'op': 'num', 'val': 0 }));
      break;
    case 'return':
      imf.push(new ImmInstr('ret', node.expr));
      break;
    case 'while':
      lcond = 'L' + (nextLabel++);
      lend = 'L' + (nextLabel++);

      imf.push(new ImmInstr('lbl', lcond));
      imf.push(new ImmInstr('njmp', node.cond, lend));

      // Body
      for (i = 0; i < node.body.length; ++i) {
        generate(node.body[i], imf, fs);
      }

      imf.push(new ImmInstr('jmp', lcond));
      imf.push(new ImmInstr('lbl', lend));

      break;
    case 'assign':
      imf.push(new ImmInstr('str', node.name, node.expr));
      break;
    case 'if':
      lend = 'L' + (nextLabel++);
      ltrue = 'L' + (nextLabel++);

      imf.push(new ImmInstr('cjmp', node.cond, ltrue));

      // False branch
      for (i = 0; i < node.false.length; ++i) {
        generate(node.false[i], imf, fs);
      }
      imf.push(new ImmInstr('jmp', lend));

      // True branch
      imf.push(new ImmInstr('lbl', ltrue));
      for (i = 0; i < node['true'].length; ++i) {
        generate(node['true'][i], imf, fs);
      }
      imf.push(new ImmInstr('lbl', lend));

      break;
    }
  };

  /**
   * Generates the intermediate form representation of a program
   * @param {Object} ast Abstract syntax tree
   * @return {Object<String, Array<ImmInstr>} Intermediate form
   */
  env.genIMF = function (ast) {
    var i = 0, imf = {}, code = [], live, igraph, fs = {}, renamed, folded;

    for (i = 0; i < ast.funcs.length; ++i) {
      fs[ast.funcs[i].name] = ast.funcs[i].args;
    }

    for (i = 0; i < ast.funcs.length; ++i) {
      nextLabel = 0;
      code = [];

      generate(ast.funcs[i], code, fs);
      code = env.prune(buildGraph(code));
      folded = env.prune(env.foldConstants(code));
      env.reachingDefs(folded);
      env.liveVariables(folded);
      env.availableExp(folded);
      live = env.removeDeadVars(folded);
      igraph = env.interferenceGraph(live);
      renamed = env.renameVariables(live, igraph.colour);
      renamed = env.optimiseRenamed(renamed);

      imf[ast.funcs[i].name] = {
        'Unoptimized Code': drawIMF(code),
        'Constant folding': drawIMF(folded),
        'Dead Variable Removal': drawIMF(live),
        'Interference Graph': drawIGraph(igraph),
        'Renamed variables': drawIMF(renamed)
      };
    }

    return imf;
  };

  /**
   * Sets up the IMF diagrams for each function
   * @param {Object<String, Array<ImmInstr>} imf Intermediate form
   */
  env.drawIMF = function (imf) {
    var name, content, i, first;

    tabs = $("#imf-tabs").tabs();
    $(">div", tabs).remove();
    $(">ul li", tabs).remove();
    tabs.tabs("destroy");

    for (name in imf) {
      if (imf.hasOwnProperty(name)) {
        content = $("<div class='content'/>");

        first = false;
        for (i in imf[name]) {
          if (imf[name].hasOwnProperty(i)) {
            $(imf[name][i])
              .attr('data-name', i)
              .css('display', first ? 'none' : 'block')
              .appendTo(content);
            first = first || i;
          }
        }

        $('<div id ="f' + name + '"></div>')
          .append('<div class="header">' +
                    '<input type="button" class="prev" value="<"/>' +
                    '<span>' + first + '</span>' +
                    '<input type="button" class="next" value=">"/>' +
                  '</div>')
          .append(content)
          .appendTo(tabs);

        $('<li><a href="#f' + name + '">' + name + '</a></li>')
          .appendTo("#imf-tabs > ul");
      }
    }

    tabs.tabs();
  };
}(window.topics = window.topics || {}));
