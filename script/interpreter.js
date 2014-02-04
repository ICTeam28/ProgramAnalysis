/*jslint browser:true, ass:true */
/*global self */
/**
 * @fileOverview User Interface
 */
(function () {
  "use strict";

  /**
   * Creates a new virtual machine
   * @constructor
   */
  var VM = function (imf) {
    this.imf = imf;
  };

  /**
   * Calls a function
   */
  VM.prototype.call = function (name, args) {
    var code, scope, i;

    if (!this.imf[name]) {
      throw { t: 'err', msg: 'Undefined function "' + name + '"' };
    }

    code = this.imf[name];
    if (!code[0] || !code[0].args || code[0].args.length !== args.length) {
      throw { t: 'err', msg: 'Invalid arguments to "' + name + '"' };
    }

    scope = {};
    for (i = 0; i < args.length; ++i) {
      scope[code[0].args[i]] = args[i];
    }

    return this.execute(code, scope);
  };

  /**
   * Executes a sequence of instructions
   */
  VM.prototype.execute = function (code, scope) {
    var ip = 0, imm;

    var evalExpr = function (ast) {
      var lhs, rhs, args;

      switch (ast.op) {
      case 'call':
        args = ast.args.map(evalExpr);
        return this.call(ast.name, args);
      case 'bin':
        lhs = evalExpr(ast.lhs);
        rhs = evalExpr(ast.rhs);
        switch (ast.p) {
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
        break;
      case 'un':
        switch (ast.p) {
        case '-':
          return -evalExpr(ast.expr);
        case '!':
          return evalExpr(ast.expr) ? 0 : 1;
        case '~':
          return ~evalExpr(ast.expr);
        }
        break;
      case 'var':
        return scope[ast.name] || 0;
      case 'num':
        return ast.val;
      }
    }.bind(this);

    while (true) {
      imm = code[ip];
      ip = ip + 1;

      switch (imm.op) {
      case 'lbl':
        break;
      case 'ret':
        return evalExpr(imm.expr);
      case 'str':
        scope[imm.dest] = evalExpr(imm.expr);
        break;
      case 'jmp':
        ip = imm.next[0];
        break;
      case 'cjmp':
        if (evalExpr(imm.expr)) {
          ip = imm.next[1];
        }
        break;
      case 'njmp':
        if (!evalExpr(imm.expr)) {
          ip = imm.next[1];
        }
        break;
      }
    }
  };

  /**
   * Wait for a request to interpret some code
   */
  self.addEventListener('message', function (e) {
    var data, ret;

    try {
      data = JSON.parse(e.data);
      ret = (new VM(data.imf)).call(data.func, data.args);
      self.postMessage(JSON.stringify({ t: 'suc', msg: ret.toString(10) }));
    } catch (err) {
      self.postMessage(JSON.stringify(err));
    }
  });
}());
