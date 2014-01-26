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
    this.next = [];

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
    case 'ldr':
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
    case 'njmp':
      this.reg = arg1;
      this.label = arg2;
      break;
    case 'arg':
      this.arg = arg1;
      this.reg = arg2;
      break;
    case 'call':
      this.reg = arg1;
      this.func = arg2;
      break;
    case 'str':
      this.dest = arg1;
      this.src = arg2;
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
    case 'ldr':
      return 'ldr ' + this.dest + ', ' + this.src;
    case 'bin':
      return '(' + this.p + ') ' + this.dest + ', ' + this.src;
    case 'un':
      return '(' + this.p + ') ' + this.reg;
    case 'jmp':
      return 'jmp ' + this.label;
    case 'cjmp':
      return 'cjmp ' + this.reg + ', ' + this.label;
    case 'njmp':
      return 'njmp ' + this.reg + ', ' + this.label;
    case 'arg':
      return 'arg ' + this.arg + ',' + this.reg;
    case 'call':
      return 'call ' + this.reg + ', ' + this.func;
    case 'str':
      return 'str ' + this.dest + ', ' + this.src;
    }
  };

  /**
   * Generates code for an expression
   * @param {Array<ImmInstr>} imf List which collects information
   * @param {Number} r Index of the register where the result is stored
   * @param {Object<String, List<String>} fs Function arguments
   * @return Index of the register where the result is stored
   */
  var generateExpr = function (node, imf, r, fs) {
    var i;

    switch (node.op) {
    case 'num':
      imf.push(new ImmInstr('const', '@' + r, node.val));
      return r;
    case 'var':
      imf.push(new ImmInstr('ldr', '@' + r, node.name));
      return r;
    case 'bin':
      generateExpr(node.lhs, imf, r, fs);
      generateExpr(node.rhs, imf, r + 1, fs);
      imf.push(new ImmInstr('bin', node.p, '@' + r, '@' + (r + 1)));
      return r;
    case 'un':
      generateExpr(node.expr, imf, r, fs);
      imf.push(new ImmInstr('un', node.p, '@' + r));
      return r;
    case 'call':
      for (i = 0; i < node.args.length; ++i) {
        generateExpr(node.args[i], imf, r, fs);
        imf.push(new ImmInstr('arg', fs[node.name][i], '@' + r));
      }

      imf.push(new ImmInstr('call', '@' + r, node.name));
      return r;
    }

    return 0;
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
      break;
    case 'return':
      imf.push(new ImmInstr('ret', '@' + generateExpr(node.expr, imf, 0, fs)));
      break;
    case 'while':
      lcond = 'L' + (nextLabel++);
      lend = 'L' + (nextLabel++);

      imf.push(new ImmInstr('lbl', lcond));
      generateExpr(node.cond, imf, 0, fs);
      imf.push(new ImmInstr('njmp', '@0', lend));

      // Body
      for (i = 0; i < node.body.length; ++i) {
        generate(node.body[i], imf, fs);
      }

      imf.push(new ImmInstr('jmp', lcond));
      imf.push(new ImmInstr('lbl', lend));

      break;
    case 'assign':
      generateExpr(node.expr, imf, 0, fs);
      imf.push(new ImmInstr('str', node.name, '@0'));
      break;
    case 'if':
      lend = 'L' + (nextLabel++);
      ltrue = 'L' + (nextLabel++);

      generateExpr(node.cond, imf, 0, fs);
      imf.push(new ImmInstr('cjmp', '@0', ltrue));

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

    // Draw line to the direct successor (if applicable)
    if (op.next.indexOf(i + 1) !== -1 && ops[i + 1]) {
      points = "100 50 100 100";
      line = document.createElementNS(NS, "polyline");
      line.setAttributeNS(null, "points", points);
      line.setAttributeNS(null, "marker-end", "url(#arrow)");
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
        line.setAttributeNS(null, "marker-end", "url(#arrow)");
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
   * Draws the instructions and the links between them
   * @param {List<ImmInstr>} imf
   * @return {SVGSVGDocument}
   */
  var drawIMF = function (imf) {
    var svg, i, h = 0;

    svg = document.createElementNS(NS, 'svg');

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
   * Removes all the instructions which are not on a path between the root label
   * (start of the program) and an instruction which has side effects (return)
   * @param {Object<Number, ImmInstr>} imf Intermediate code
   * @return {Object<Number, ImmInstr>}
   */
  var prune = function (imf) {
    var reachable = [], visited = [], loop = {}, imfp = {}, i, j, idx;

    // Identifies all the nodes which are reachable from the root node
    (function visit(i) {
      if (reachable.indexOf(i) !== -1) {
        return;
      }
      reachable.push(i);
      imf[i].next.map(visit);
    }(0));

    // Checks whether an op has side effects or leads to another op which
    // has side effects
    var hasSideEffects = function (i) {
      var k;

      if (loop[i]) {
        return false;
      }

      loop[i] = true;
      if (imf[i].op === 'ret') {
        return true;
      }

      for (k = 0; k < imf[i].next.length; ++k) {
        if (hasSideEffects(imf[i].next[k])) {
          return true;
        }
      }

      return false;
    };

    // Eliminates ops with no side effects
    for (i = 0; i < reachable.length; ++i) {
      loop = {};
      if (hasSideEffects(reachable[i])) {
        visited.push(reachable[i]);
      }
    }

    // Relabels the graph
    for (i = 0; i < visited.length; ++i) {
      imfp[i] = $.extend(true, {}, imf[visited[i]]);
      imfp[i].next = [];
      for (j = 0; j < imf[visited[i]].next.length; ++j) {
        idx = visited.indexOf(imf[visited[i]].next[j]);
        if (idx >= 0) {
          imfp[i].next.push(idx);
        }
      }
    }

    return imfp;
  };

  /**
   * Generates the intermediate form representation of a program
   * @param {Object} ast Abstract syntax tree
   * @return {Object<String, Array<ImmInstr>} Intermediate form
   */
  env.genIMF = function (ast) {
    var i = 0, imf = {}, code = [], fs = {};

    for (i = 0; i < ast.funcs.length; ++i) {
      fs[ast.funcs[i].name] = ast.funcs[i].args;
    }

    for (i = 0; i < ast.funcs.length; ++i) {
      nextLabel = 0;
      code = [];

      generate(ast.funcs[i], code, fs);
      code = buildGraph(code);

      imf[ast.funcs[i].name] = {
        'Intemediate Form': code,
        'Optimized': prune(code)
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

    $(">div", tabs).remove();
    $(">ul li", tabs).remove();
    tabs.tabs("destroy");

    for (name in imf) {
      if (imf.hasOwnProperty(name)) {
        content = $("<div class='content'/>");

        first = false;
        for (i in imf[name]) {
          if (imf[name].hasOwnProperty(i)) {
            $(drawIMF(imf[name][i]))
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

  /**
   * Initialises the intermediate form viewer
   */
  env.initIMF = function () {
    tabs = $("#imf-tabs").tabs();

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
}(window.topics = window.topics || {}));
