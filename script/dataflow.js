/*jslint browser:true, ass:true */
/**
 * @fileOverview Data Flow Analysis
 */
(function (env) {
  "use strict";

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
   * Reaching definitions analysis
   * @param {Object<Number, ImmInstr>} imf
   */
  env.reachingDefs = function (imf) {
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
  env.liveVariables = function (imf) {
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
   * Available expression analysis
   * @param {Object<Number, ImmInstr>} imf
   */
  env.availableExp = function (imf) {
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
        getSub(node.expr);
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
   * Builds the interference graph & uses a graph colouring algorithm to
   * assign temporaries
   * @param {Object<Number, ImmInstr>} imf
   * @return {Pair<Object, Object>} graph
   */
  env.interferenceGraph = function (imf) {
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
} (window.topics = window.topics || {}));