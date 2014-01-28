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
  var ImmInstr = function (op, arg1, arg2) {
    this.op = op;
    this.next = [];

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
   * Converts an instruction to a string
   * @this {ImmInstr}
   */
  ImmInstr.prototype.toString = function () {
    /**
     * Converts an expression into a string
     * @param {Object} node
     * @return {String}
     */
    var exprString = function (node) {
      switch (node.op) {
      case 'num':
        return node.val;
      case 'var':
        return node.name;
      case 'bin':
        return '(' + exprString(node.lhs) + node.p + exprString(node.rhs) + ')';
      case 'un':
        return '(' + node.p + exprString(node.expr) + ')';
      case 'call':
        return node.name + '(' + node.args.map(exprString).join(',') + ')';
      }
    };

    switch (this.op) {
    case 'lbl':
      return this.label + ':';
    case 'ret':
      return 'ret ' + exprString(this.expr);
    case 'jmp':
      return 'jmp ' + this.label;
    case 'cjmp':
      return 'cjmp ' + this.label + ',' + exprString(this.expr);
    case 'njmp':
      return 'njmp ' + this.label + ',' + exprString(this.expr);
    case 'str':
      return 'str ' + this.dest + ',' + exprString(this.expr);
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
   * Chaotic iteration used to solve the system of equations
   * @param {List<ImmInstr>} imf
   * @param {List<Object>} gen
   * @param {List<Object>} kill
   * @return {Object<String, List<Object>} entry and exit
   */
  var iterate = function (imf, gen, kill) {
    /**
     * Unites two sets
     * @param {List<a>} a
     * @param {List<b>} b
     * @return a U b
     */
    var union = function (a, b) {
      var ap = [], k;
      for (k = 0; k < a.length; ++k) {
        ap.push(a[k]);
      }

      for (k = 0; k < b.length; ++k) {
        if (a.indexOf(b[k]) === -1) {
          ap.push(b[k]);
        }
      }

      return ap;
    };

    /**
     * Computes the difference of two sets
     * @param {List<a>} a
     * @param {List<b>} b
     * return a - b
     */
    var difference = function (a, b) {
      var ap = [], k;
      for (k = 0; k < a.length; ++k) {
        if (b.indexOf(a[k]) === -1) {
          ap.push(a[k]);
        }
      }
      return ap;
    };

    /**
     * Checks whether two sets are equal
     * @param {List<a>} a
     * @param {List<b>} b
     * return a == b
     */
    var compare = function (a, b) {
      var k;

      // Returns true if two sets are equivalent
      var compareSets = function (a, b) {
        var p;
        if (a.length !== b.length) {
          return false;
        }

        for (p = 0; p < a.length; ++p) {
          if (a.indexOf(b[p]) === -1) {
            return false;
          }
          if (b.indexOf(a[p]) === -1) {
            return false;
          }
        }

        return true;
      };

      // Checks whether a has all the keys of b and vice-versa
      // If all keys are equivalent, checks whether all values
      // are equivalent
      for (k in a) {
        if (a.hasOwnProperty(k)) {
          if (!b[k] || !compareSets(b[k], a[k])) {
            return false;
          }
        }
      }

      for (k in b) {
        if (b.hasOwnProperty(k)) {
          if (!a[k] || !compareSets(b[k], a[k])) {
            return false;
          }
        }
      }
      return true;
    };

    var entry = {}, exit = {}, entryp = {}, exitp = {};
    var i, j, change;

    for (i in imf) {
      if (imf.hasOwnProperty(i)) {
        entry[i] = [];
        exit[i] = [];
      }
    }

    do {
      entryp = {};
      exitp = {};
      for (i in imf) {
        if (imf.hasOwnProperty(i)) {
          entryp[i] = [];
          for (j in imf) {
            if (imf.hasOwnProperty(j)) {
              if (imf[j].next.indexOf(parseInt(i, 10)) !== -1) {
                entryp[i] = union(entryp[i], exit[j]);
              }
            }
          }
        }
      }

      for (i in imf) {
        if (imf.hasOwnProperty(i)) {
          exitp[i] = union(difference(entryp[i], kill[i]), gen[i]);
        }
      }

      change = !compare(entry, entryp) || !compare(exit, exitp);
      entry = entryp;
      exit = exitp;
    } while (change);

    return { 'entry': entryp, 'exit': exitp };
  };

  /**
   * Reaching definitions analysis
   * @param {Object<Number, ImmInstr>} imf
   */
  var reachable = function (imf) {
    var i, j, gen = {}, kill = {};

    // Build the kill and gen functions for every instruction
    for (i in imf) {
      if (imf.hasOwnProperty(i)) {
        gen[i] = [];
        kill[i] = [];

        if (imf[i].op === 'str') {
          gen[i].push(parseInt(i, 10));

          for (j in imf) {
            if (imf.hasOwnProperty(j) && imf[j].op === 'str') {
              if (imf[j].dest === imf[i].dest) {
                kill[i].push(parseInt(j, 10));
              }
            }
          }
        }
      }
    }

    //console.log(iterate(imf, gen, kill));
  };

  /**
   * Live variable analysis
   * @param {Object<Number, ImmInstr>} imf
   */
  var alive = function (imf) {
    var i, kill = {}, gen = {};

    var traverse = function (node) {
      switch (node.op) {
      case 'var':
        if (gen[i].indexOf(node.name) === -1) {
          gen[i].push(node.name);
        }
        break;
      case 'bin':
        traverse(node.lhs);
        traverse(node.rhs);
        break;
      case 'un':
        traverse(node.expr);
        break;
      case 'call':
        node.args.map(traverse);
        break;
      }
    };

    // Computes killLV and genLV for every instruction
    for (i in imf) {
      if (imf.hasOwnProperty(i)) {
        gen[i] = [];
        kill[i] = [];

        if (imf[i].op === 'str') {
          kill[i].push(imf[i].dest);
        }

        if (imf[i].expr) {
          traverse(imf[i].expr);
        }
      }
    }

    //console.log(kill);
    //console.log(gen);
    //console.log(iterate(imf, gen, kill));
  };

  /**
   * Available expression analysis
   * @param {Object<Number, Imm instruction>} imf
   */
  var availableExp = function (imf) {
    var i, j, k, l, kill = {}, gen = {}, allGen = [], name, subs = [];

    /**
     * Returns true if name appears in the expression
     * @param {Object} node
     */
    var appears = function (node) {
      switch (node.op) {
      case 'var':
        if (node.name === name) {
          return true;
        }
        return false;
      case 'bin':
        return appears(node.lhs) || appears(node.rhs);
      case 'un':
        return appears(node.expr);
      case 'call':
        return node.args.map(appears);
      case 'num':
        return false;
      }
    };

    /**
     * Stores all subexpressions of the given expression in subs array
     * @param {Object} node
     */
    var getSub = function (node) {
      switch (node.op) {
      case 'var':
        subs.push(node.name);
        break;
      case 'bin':
        getSub(node.lhs);
        getSub(node.rhs);
        break;
      case 'un':
        getSub(node.epxr);
        break;
      case 'call':
        node.args.map(getSub);
        break;
      case 'num':
        break;
      }
    };

    // Computes killAE and genAE for every instruction
    for (i in imf) {
      if (imf.hasOwnProperty(i)) {
        gen[i] = [];
        kill[i] = [];

        if (imf[i].expr) {
          allGen.push(imf[i].expr);
          gen[i].push(imf[i].expr);
        }

        if (imf[i].op === 'str') {
          allGen.push(imf[i].dest);
          name = imf[i].dest;
          for (j = 0; j < allGen.length; j++) {
            if (appears(allGen[j])) {
              subs = [];
              getSub(allGen[j]);
              for (k = 0; k < subs.length; k++) {
                for (l = 0; l < allGen.length; l++) {
                  name = subs[k];
                  if (appears(allGen[l]) && kill[i].indexOf(allGen[l]) === -1) {
                    kill[i].push(allGen[l]);
                  }
                }
              }
            }
          }
        }
      }
    }
    //console.log(kill);
    //console.log(gen);
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
    var i = 0, imf = {}, code = [], reached, live, fs = {};

    for (i = 0; i < ast.funcs.length; ++i) {
      fs[ast.funcs[i].name] = ast.funcs[i].args;
    }

    for (i = 0; i < ast.funcs.length; ++i) {
      nextLabel = 0;
      code = [];

      generate(ast.funcs[i], code, fs);
      code = prune(buildGraph(code));
      reached = reachable(code);
      live = alive(code);
      availableExp(code);

      imf[ast.funcs[i].name] = {
        'Intemediate Form': code,
        'Reachable Definitions': reached
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
