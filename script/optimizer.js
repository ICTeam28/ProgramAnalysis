/*jslint browser:true, ass:true */
/**
 * @fileOverview Optimizations on intermediate form
 */
(function (env) {
  "use strict";

  /**
   * Removes all the instructions which are not on a path between the root label
   * (start of the program) and an instruction which has side effects (return)
   * @param {Object<Number, ImmInstr>} imf Intermediate code
   * @return {Object<Number, ImmInstr>}
   */
  env.prune = function (imf) {
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
  env.removeDeadVars = function (imfp) {
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
    var ret = {};
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
    }

    return env.prune(ret);
  };

  /**
   * Renames variables based on the graph colouring
   * @param {Object<Number, ImmInstr>} imf
   * @param {Object} colours
   * @return {Object<Number, ImmInstr>} imfp
   */
  env.renameVariables = function (imf, colours) {
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
      if (imfp.hasOwnProperty(i)) {
        for (j in colours) {
          if (colours.hasOwnProperty(j)) {

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
  env.optimiseRenamed = function (imf) {
    var imfp = $.extend(true, {}, imf);
    var i, j, k, next;

    for (i in imfp) {
      if (imfp.hasOwnProperty(i)) {
        if (imfp[i].op === 'str') {
          if (imfp[i].expr.op === 'var' && imfp[i].expr.name === imfp[i].dest) {
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

    return env.prune(imfp);
  };

  /**
   * Merges consequitive labels
   * @param {Object<Number, ImmInstr>} imf
   * @return {Object<Number, ImmInstr>} imfp
   */
  env.mergeLabels = function (imf) {
    var imfp = $.extend(true, {}, imf);
    var i, j, k, l, next;

    for (i in imfp) {
      if (imfp.hasOwnProperty(i)) {
        if (imfp[i].op === 'lbl') {
          if (imfp[i].next.length === 1) {
            next = imfp[i].next[0];
            for (j in imfp) {
              if (imfp.hasOwnProperty(j)) {
                if (imfp[j].op === 'lbl' && next === parseInt(j, 10)) {
                  for (k in imfp) {
                    if (imfp.hasOwnProperty(k)) {
                      for (l = 0; l < imfp[k].next.length; ++l) {
                        if (imfp[k].next[l] === parseInt(i, 10)) {
                          imfp[k].next[l] = next;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return env.prune(imfp);
  };

  /**
   * Removes redundant jumps
   * @param {Object<Number, ImmInstr>} imf
   * @return {Object<Number, ImmInstr>} imfp
   */
  env.removeJumps = function (imf) {
    var imfp = $.extend(true, {}, imf);
    var i, j, k, next;

    for (i in imfp) {
      if (imfp.hasOwnProperty(i)) {
        if (imfp[i].op === 'jmp') {
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

    return env.prune(imfp);
  };


}(window.topics = window.topics || {}));