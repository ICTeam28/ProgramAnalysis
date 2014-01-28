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
   */
  var COLOURS = [
    "#ff0000", "#00ff00", "#0000ff",
    "#ffff00", "#00ffff", "#ff00ff",
    "#cc0000", "#00cc00", "#0000cc",
    "#cccc00", "#00cccc", "#cc00cc",
  ];

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
   * Set operations required by chaotic iteration
   */
  var set = {
    /**
     * Union of two setss
     * @param {List<a>} a
     * @param {List<b>} b
     * @return a U b
     */
    union: function (a, b) {
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
    },

    /**
     * Computes the difference of two sets
     * @param {List<a>} a
     * @param {List<b>} b
     * return a - b
     */
    difference: function (a, b) {
      var ap = [], k;
      for (k = 0; k < a.length; ++k) {
        if (b.indexOf(a[k]) === -1) {
          ap.push(a[k]);
        }
      }

      return ap;
    },

    /**
     * Checks whether two sets are equal
     * @param {List<a>} a
     * @param {List<b>} b
     * return a == b
     */
    compare: function (a, b) {
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
    }
  };

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
   * Removes all the instructions which are not on a path between the root label
   * (start of the program) and an instruction which has side effects (return)
   * @param {Object<Number, ImmInstr>} imf Intermediate code
   * @return {Object<Number, ImmInstr>}
   */
  var prune = function (imf) {
    var reachable = [], visited = [], loop = {}, imfp = {}, i, j, k, idx;

    // Identifies all the nodes which are reachable from the root node
    (function visit(i) {
      if (reachable.indexOf(i) !== -1) {
        return;
      }
      reachable.push(i);
      imf[i].next.map(visit);
    }(0));

    reachable.sort(function (a, b) { return a - b; });

    // Checks whether an op has side effects or leads to another op which
    // has side effects
    var hasSideEffects = function (i) {
      var p;

      if (loop[i]) {
        return false;
      }

      loop[i] = true;
      if (imf[i].op === 'ret') {
        return true;
      }

      for (p = 0; p < imf[i].next.length; ++p) {
        if (hasSideEffects(imf[i].next[p])) {
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
    var rdIn, rdOut;
    for (i = 0; i < visited.length; ++i) {
      imfp[i] = $.extend(true, {}, imf[visited[i]]);
      imfp[i].next = [];
      for (j = 0; j < imf[visited[i]].next.length; ++j) {
        idx = visited.indexOf(imf[visited[i]].next[j]);
        if (idx >= 0) {
          imfp[i].next.push(idx);
        }
      }

      if (imfp[i].rd) {
        rdIn = [];
        for (j = 0; j < imfp[i].rd.in.length; ++j) {
          if ((k = visited.indexOf(imfp[i].rd.in[j])) !== -1) {
            rdIn.push(k);
          }
        }
        imfp[i].rd.in = rdIn;

        rdOut = [];
        for (j = 0; j < imfp[i].rd.out.length; ++j) {
          if ((k = visited.indexOf(imfp[i].rd.out[j])) !== -1) {
            rdOut.push(k);
          }
        }
        imfp[i].rd.out = rdOut;
      }
    }

    return imfp;
  };

  /**
   * Removes assignments to variables whose value is not used later
   * Nodes that link to removed operations are linked to the following
   * instruction instead
   * @param {Object<Number, ImmInstr>} imfp
   */
  var removeDeadVars = function (imfp) {
    var i, j, k, keys = [], imf;

    imf = $.extend(true, {}, imfp);
    for (i in imf) {
      if (imf.hasOwnProperty(i)) {
        if (imf[i].op === 'str' && imf[i].lv.out.indexOf(imf[i].dest) === -1) {
          delete imf[i];
        } else {
          keys.push(parseInt(i, 10));
        }
      }
    }

    // Fix links
    var ret = {}, rdIn, rdOut;
    for (i = 0; i < keys.length; ++i) {
      ret[i] = imf[keys[i]];
      for (j = 0; j < ret[i].next.length; ++j) {
        for (k = 0; k < keys.length; ++k) {
          if (keys[k] >= ret[i].next[j]) {
            ret[i].next[j] = k;
            break;
          }
        }
      }

      rdIn = [];
      for (j = 0; j < ret[i].rd.in.length; ++j) {
        if ((k = keys.indexOf(ret[i].rd.in[j])) !== -1) {
          rdIn.push(k);
        }
      }
      ret[i].rd.in = rdIn;

      rdOut = [];
      for (j = 0; j < ret[i].rd.out.length; ++j) {
        if ((k = keys.indexOf(ret[i].rd.out[j])) !== -1) {
          rdOut.push(k);
        }
      }
      ret[i].rd.out = rdOut;
    }

    return ret;
  };

  /**
   * Renames variables based on the graph colouring
   * @param {Object<Number, ImmInstr>} imf
   * @param {Object} colours
   * @return {Object<Number, ImmInstr>} imfp
   */
  var renameVariables = function (imf, colours) {
    var imfp = $.extend(true, {}, imf);
    var i, j, replace, newName;

    /**
     * Assigns newName to all the variables within the expression whose 
     * name matches replace
     * @param {Object} node
     */
    var renameExp = function (node) {
      switch (node.op) {
      case 'var':
        if (node.name === replace) {
          node.name = newName;
        }
        break;
      case 'bin':
        renameExp(node.lhs);
        renameExp(node.rhs);
        break;
      case 'un':
        renameExp(node.expr);
        break;
      case 'call':
        node.args.map(renameExp);
        break;
      case 'num':
        break;
      }
    };

    for (i in imfp) {
      if (imfp[i].hasOwnProperty) {
        for (j in colours) {
          if (colours[j].hasOwnProperty) {

            newName = 'a' + (colours[j]);
            replace = j;

            if (imfp[i].expr) {
              renameExp(imfp[i].expr);
            }

            if (imfp[i].op === 'str') {
              if (imfp[i].dest === j) {
                imfp[i].dest = newName;
              }
            }
          }
        }
      }
    }

    return imfp;
  };

  /**
   * Removes redundant instructions from the renamed imf
   * @param {Object<Number, ImmInstr>} imf
   * @return {Object<Number, ImmInstr>} imfp
   */
  var optimiseRenamed = function (imf) {
    var imfp = $.extend(true, {}, imf);
    var i, j, k, next;

    for (i in imfp) {
      if (imfp[i].hasOwnProperty) {
        if (imfp[i].op === 'str') {
          name = imfp[i].dest;
          if (imfp[i].expr.op === 'var' && imfp[i].expr.name === name) {
            if (imfp[i].next.length === 1) {
              next = imfp[i].next[0];
              for (j in imfp) {
                if (imfp.hasOwnProperty(j)) {
                  for (k = 0; k < imfp[j].next.length; ++k) {
                    if (imfp[j].next[k] === parseInt(i, 10)) {
                      imfp[j].next[k] = next;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return prune(imfp);
  };

  /**
   * Reaching definitions analysis
   * @param {Object<Number, ImmInstr>} imf
   */
  var reachingDefs = function (imf) {
    var i, j, gen = {}, kill = {}, enter = {}, exit = {};

    // Build the kill and gen functions for every instruction
    for (i in imf) {
      if (imf.hasOwnProperty(i)) {
        gen[i] = [];
        kill[i] = [];
        enter[i] = [];
        exit[i] = [];

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

    // Chaotic iteration
    var enterp = {}, exitp = {};
    var change;

    do {
      enterp = {};
      exitp = {};
      for (i in imf) {
        if (imf.hasOwnProperty(i)) {
          enterp[i] = [];
          for (j in imf) {
            if (imf.hasOwnProperty(j)) {
              if (imf[j].next.indexOf(parseInt(i, 10)) !== -1) {
                enterp[i] = set.union(enterp[i], exit[j]);
              }
            }
          }
        }
      }

      for (i in imf) {
        if (imf.hasOwnProperty(i)) {
          exitp[i] = set.union(set.difference(enterp[i], kill[i]), gen[i]);
        }
      }

      change = false;
      for (i in imf) {
        if (imf.hasOwnProperty(i)) {
          if (!set.compare(enter[i], enterp[i])) {
            change = true;
            break;
          }

          if (!set.compare(exit[i], exitp[i])) {
            change = true;
            break;
          }
        }
      }

      enter = enterp;
      exit = exitp;
    } while (change);

    // Save the results
    for (i in imf) {
      if (imf.hasOwnProperty(i)) {
        imf[i].rd.in = enter[i];
        imf[i].rd.out = exit[i];
      }
    }
  };

  /**
   * Live variable analysis
   * @param {Object<Number, ImmInstr>} imf
   */
  var liveVariables = function (imf) {
    var i, j, writes = {}, reads = {}, enter = {}, exit = {};

    var traverse = function (node) {
      switch (node.op) {
      case 'var':
        if (reads[i].indexOf(node.name) === -1) {
          reads[i].push(node.name);
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
        reads[i] = [];
        writes[i] = [];
        enter[i] = [];
        exit[i] = [];

        if (imf[i].op === 'str') {
          writes[i].push(imf[i].dest);
        }

        if (imf[i].expr) {
          traverse(imf[i].expr);
        }
      }
    }

    // Chaotic iteration
    var enterp = {}, exitp = {};
    var change;

    do {
      enterp = {};
      exitp = {};

      for (i in imf) {
        if (imf.hasOwnProperty(i)) {
          exitp[i] = [];
          for (j = 0; j < imf[i].next.length; ++j) {
            exitp[i] = set.union(exitp[i], enter[imf[i].next[j]]);
          }
        }
      }

      for (i in imf) {
        if (imf.hasOwnProperty(i)) {
          enterp[i] = set.union(set.difference(exit[i], writes[i]), reads[i]);
        }
      }

      change = false;
      for (i in imf) {
        if (imf.hasOwnProperty(i)) {
          if (!set.compare(enter[i], enterp[i])) {
            change = true;
            break;
          }

          if (!set.compare(exit[i], exitp[i])) {
            change = true;
            break;
          }
        }
      }

      enter = enterp;
      exit = exitp;
    } while (change);

    // Save the results
    for (i in imf) {
      if (imf.hasOwnProperty(i)) {
        imf[i].lv.in = enter[i];
        imf[i].lv.out = exit[i];
      }
    }
  };

  /**
   * Builds the interference graph & uses a graph colouring algorithm to
   * assign temporaries
   * @param {Object<Number, ImmInstr>} imf
   * @return {Pair<Object, Object>} graph
   */
  var interferenceGraph = function (imf) {
    var graph = {}, verts = [], vert, i, j, k, x, y;

    // Fetch all the different variable names
    for (i in imf) {
      if (imf.hasOwnProperty(i)) {
        for (j = 0; j < imf[i].lv.out.length; ++j) {
          vert = imf[i].lv.out[j];
          if (!graph[vert]) {
            graph[vert] = [];
            verts.push(vert);
          }
        }
      }
    }

    // Add edges to the graph between nodes which are live
    // at a point of the program
    for (i in imf) {
      if (imf.hasOwnProperty(i)) {
        for (j = 0; j < imf[i].lv.out.length; ++j) {
          for (k = 0; k < imf[i].lv.out.length; ++k) {
            x = imf[i].lv.out[j];
            y = imf[i].lv.out[k];
            if (x !== y) {
              if (graph[x].indexOf(y) === -1) {
                graph[x].push(y);
              }
            }
          }
        }
      }
    }

    // Minimal graph colouring - Welsh-Powell algorithm
    // Sort vertices in descending order by their degree
    verts = verts.sort(function (a, b) {
      return graph[b].length - graph[a].length;
    });

    // On each pass, assign a new colour to as many vertices as possible
    var toColor = verts.length, nextColor = 0, colour = {}, good;
    while (toColor > 0) {
      for (i = 0; i < verts.length; ++i) {
        // If the vertex hasn't been coloured yet
        if (!colour.hasOwnProperty(verts[i])) {
          good = true;
          // Check if it is linked to other nodes with the same colour
          for (j = 0; j < graph[verts[i]].length; ++j) {
            if (colour[graph[verts[i]][j]] === nextColor) {
              good = false;
              break;
            }
          }

          // If no conflicts exist, assign the new colour
          if (good) {
            colour[verts[i]] = nextColor;
            toColor--;
          }
        }
      }
      ++nextColor;
    }

    return {
      'graph': graph,
      'colour': colour
    };
  };

  /**
   * Available expression analysis
   * @param {Object<Number, ImmInstr>} imf
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
    var i = 0, imf = {}, code = [], live, igraph, fs = {}, renamed;

    for (i = 0; i < ast.funcs.length; ++i) {
      fs[ast.funcs[i].name] = ast.funcs[i].args;
    }

    for (i = 0; i < ast.funcs.length; ++i) {
      nextLabel = 0;
      code = [];

      generate(ast.funcs[i], code, fs);
      code = prune(buildGraph(code));
      reachingDefs(code);
      liveVariables(code);
      availableExp(code);
      live = removeDeadVars(code);
      igraph = interferenceGraph(live);
      renamed = renameVariables(live, igraph.colour);
      renamed = optimiseRenamed(renamed);
      // TODO: Merge consecutive labels
      // TODO: Remove jumps to consecutive instructions

      imf[ast.funcs[i].name] = {
        'Unoptimized Code': drawIMF(code),
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
