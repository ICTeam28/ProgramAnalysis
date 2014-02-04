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

    imf = env.removeLabels(env.removeJumps(env.mergeLabels(imf)));

    // Identifies all the nodes which are reachable from the root node
    (function visit(i) {
      if (reachable.indexOf(i) !== -1) {
        return;
      }

      if (!imf[i]) {
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

      if (loop[i] || !imf[i]) {
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

    // Checks whether all control paths return a value
    for (i = 0; i < visited.length; ++i) {
      for (j = 0; j < imf[visited[i]].next.length; ++j) {
        if (visited.indexOf(imf[visited[i]].next[j]) === -1) {
          throw new env.SemanticError(imf[visited[i]].loc, 'Not all control ' +
                                      'paths return a value');
        }
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

    return env.reduceIMF(ret);
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

    return env.reduceIMF(imfp);
  };

  /**
   * Removes redundant instructions from the renamed imf
   * @param {Object<Number, ImmInstr>} imf
   * @return {Object<Number, ImmInstr>} imfp
   */
  env.removeAssignments = function (imf) {
    var imfp = $.extend(true, {}, imf);
    var i, j, k, next;

    for (i in imfp) {
      if (imfp.hasOwnProperty(i)) {
        if (imfp[i].op === 'str') {
          if (imfp[i].expr.op === 'var' && imfp[i].expr.name === imfp[i].dest) {
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

    return imfp;
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
          next = imfp[i].next[0];
          if (next === parseInt(i, 10) + 1) {
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

    return imfp;
  };

  /**
   * Removes labels which have 1 incoming non-jmp edge
   * @param {Object<Number, ImmInstr>} imf
   * @return {Object<Number, ImmInstr>} imfp
   */
  env.removeLabels = function (imf) {
    var imfp = $.extend(true, {}, imf);
    var i, j, k, m, next, inDegree;

    /**
     * Computes inDegree of a given node
     * @param {Number} node
     */
    var getInDegree = function (node) {
      var q;
      for (q in imfp) {
        if (imfp.hasOwnProperty(q)) {
          for (m = 0; m < imfp[q].next.length; m++) {
            if (imfp[q].next[m] === node) {
              inDegree = inDegree + 1;
            }
          }
        }
      }
    };

    for (i in imfp) {
      if (imfp.hasOwnProperty(i)) {
        if (imfp[i].op === 'lbl') {
          if (imfp[i].next.length === 1) {
            next = imfp[i].next[0];
            for (j in imfp) {
              if (imfp.hasOwnProperty(j)) {
                for (k = 0; k < imfp[j].next.length; ++k) {
                  if (imfp[j].next[k] === parseInt(i, 10) &&
                      parseInt(j, 10) === (parseInt(i, 10) - 1)) {
                    inDegree = 0;
                    getInDegree(parseInt(i, 10));
                    if (inDegree === 1) {
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

    return imfp;
  };


  /**
   * Removes branches whose condition can be determined
   * @param {List<ImmInstr>} imf
   * @erturn {List<ImmInstr>}
   */
  env.reduceBranches = function (imf) {
    var imfp = $.extend(true, {}, imf), i, j, k, next;

    for (i in imfp) {
      if (imfp.hasOwnProperty(i)) {
        switch (imfp[i].op) {
        case 'cjmp':
        case 'njmp':
          if (imfp[i].expr.op === 'num') {
            // If condition is true, jump to target
            if (imfp[i].expr.val !== (imfp[i].op === 'cjmp' ? 0 : 1)) {
              for (j = 0; j < imfp[i].next.length; ++j) {
                if (imfp[i].next[j] !== parseInt(i, 10) + 1) {
                  next = imfp[i].next[j];
                }
              }
            } else {
              next = parseInt(i, 10) + 1;
            }

            delete imfp[i].expr;
            imfp[i].op = 'jmp';
            imfp[i].label = imfp[next].label;
            imfp[i].next = [next];
          }
          break;
        case 'jmp':
          if (imfp[i].next[0] === parseInt(i, 10) + 1) {
            for (j in imfp) {
              if (imfp.hasOwnProperty(j)) {
                for (k = 0; k < imfp[j].next.length; ++k) {
                  if (imfp[j].next[k] === parseInt(i, 10)) {
                    imfp[j].next[k] = imfp[i].next[0];
                  }
                }
              }
            }
          }
          break;
        }
      }
    }

    return imfp;
  };

  /**
   * Constant folding
   * Keeps track of variables which are constant and reduces expressions
   * which operate on constant values
   */
  env.foldConstants = function (imf) {
    var changed;

    // Tries to evaluate the expression with a given state
    var replace = function (node, state) {
      var lhs, rhs, expr;
      switch (node.op) {
      case 'var':
        if (state.hasOwnProperty(node.name) && state[node.name] !== false) {
          changed = true;
          return {
            'op': 'num',
            'val': state[node.name]
          };
        }
        return node;
      case 'bin':
        lhs = replace(node.lhs, state);
        rhs = replace(node.rhs, state);
        return {
          'op': 'bin',
          'p': node.p,
          'lhs': lhs,
          'rhs': rhs
        };
      case 'un':
        expr = replace(node.expr, state);
        if (expr.op === 'num') {
          return {
            'op': 'num',
            'val': env.unop(node.p, expr.val)
          };
        }

        return {
          'op': 'un',
          'p': node.p,
          'expr': expr
        };
      default:
        return node;
      }
    };

    // Combines information from two different states
    var unify = function (a, b) {
      var i, u = {};

      for (i in a) {
        if (a.hasOwnProperty(i)) {
          if (!b.hasOwnProperty(i) || b[i] === a[i]) {
            u[i] = a[i];
          } else {
            u[i] = false;
          }
        }
      }

      for (i in b) {
        if (b.hasOwnProperty(i)) {
          if (!a.hasOwnProperty(i) || b[i] === a[i]) {
            u[i] = b[i];
          } else {
            u[i] = false;
          }
        }
      }

      return u;
    };

    // Replaces constants in basic blocks
    var reduceExpr = function (imf) {
      var imfp = $.extend(true, {}, imf), i, j, k;

      var state, states = {}, back;
      for (i in imfp) {
        if (imfp.hasOwnProperty(i)) {
          // Intersect incoming states
          back = false;
          state = {};
          for (j in imfp) {
            if (imfp.hasOwnProperty(j) && i !== j) {
              for (k = 0; k < imfp[j].next.length; ++k) {
                if (imfp[j].next[k] === parseInt(i, 10)) {
                  if (parseInt(j, 10) > parseInt(i, 10)) {
                    back = true;
                    break;
                  }
                  state = unify(state, states[j]);
                }
              }

              if (back) {
                break;
              }
            }
          }

          state = back ? {} : state;

          if (imfp[i].expr) {
            imfp[i].expr = env.pruneAST(replace(imfp[i].expr, state));
          }

          if (imfp[i].cond) {
            imfp[i].cond = env.pruneAST(replace(imfp[i].cond, state));
          }

          // If a new constant is found, add it to the state
          if (imf[i].op === 'str' && imfp[i].expr.op === 'num') {
            state[imfp[i].dest] = imfp[i].expr.val;
          }

          states[i] = state;
        }
      }

      return imfp;
    };

    do {
      changed = false;
      imf = env.reduceIMF(reduceExpr(imf));
    } while (changed);

    return env.reduceIMF(imf);
  };

  /**
   * Removes unused labels & instructions
   */
  env.reduceIMF = function (imf) {
    var imfp;

    imfp = env.removeLabels(imf);
    imfp = env.removeAssignments(imfp);
    imfp = env.removeJumps(imfp);
    imfp = env.reduceBranches(imfp);
    imfp = env.prune(imfp);

    return imfp;
  };
}(window.topics = window.topics || {}));