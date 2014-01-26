/*jslint browser:true, ass:true */
/**
 * Computing topics project
 * This is the JavaScript backend which is capable of generating & executing
 * JavaScript code
 */
(function (env) {
  /**
   * Generates code for a single instruction
   * @param {ImmInstr} op Instruction
   * @param {Object<String, Number>} cs
   * @return {String}
   */
  var genImm = function (op, cs) {
    var dest, src;

    switch (op.op) {
    case 'ret':
      return "return r[" + op.reg.slice(1) + "];";
    case 'const':
      return "r[" + op.dest.slice(1) + "]=" + op.src + ";";
    case 'ldr':
      return "r[" + op.dest.slice(1) + "]=v." + op.src + ";";
    case 'str':
      return "v." + op.dest + "=r[" + op.src.slice(1) + "];";
    case 'bin':
      dest = "r[" + op.dest.slice(1) + "]";
      switch (op.p) {
        case '+': case '-': case '*': case '/': case '%':
          src = op.p + "=r[" + op.src.slice(1) + "];";
          break;
        case '^':
          src = "=Math.pow(" + src + "," + dest + ");";
          break;
        default:
          src = "=" + dest + op.p + "r[" + op.src.slice(1) + "];";
          break;
      }
      return dest + src;
    case 'un':
      dest = "r[" + op.reg.slice(1) + "]";
      return dest + "=" + op.p + dest + ";";
    case 'jmp':
      return "return l." + op.label + "();";
    case 'cjmp':
      src = "r[" + op.reg.slice(1) + "]";
      return "if(" + src + "){return l." + op.label + "();}";
    case 'njmp':
      src = "r[" + op.reg.slice(1) + "]";
      return "if(!" + src + "){return l." + op.label + "();}";
    case 'arg':
      return "ca." + op.arg + "=r[" + op.reg.slice(1) + "];";
    case 'call':
      src = "f.f_" + op.func + "(ca, {}, f)"
      return "r[" + op.reg.slice(1) + "]="+src+";ca={};";
    }
  };

  /**
   * Generates code for a function
   * @param {List<ImmInstr>} imf Function
   */
  var genFunction = function (imf, code) {
    var labels = {}, ops = "", label, i, source;
    for (i = 0; i < imf.length; ++i) {
      if (imf[i].op === 'lbl') {
        if (label !== undefined) {
          labels[label] = ops + "return l." + imf[i].label + "();";
        }
        ops = "";
        label = imf[i].label;
      } else {
        ops = ops + genImm(imf[i]);
      }
    }

    labels[label] = ops;
    source = "var l={},ca={};";
    for (i in labels) {
      if (labels.hasOwnProperty(i)) {
        source += "l." + i + "=function(){" + labels[i] + "};";
      }
    }

    source += "return l." + imf[0].label + "();";
    return new Function("v", "r", "f", source);
  };

  /**
   * Compile code to JavaScript
   * @param {List<ImmInstr} imf Intermediary Form
   * @return {Function} Executable function
   */
  env.genJS = function (imf) {
    var code = {}, i, j;

    for (i in imf) {
      if (imf.hasOwnProperty(i)) {
        code[imf[i].opt[0].label] = genFunction(imf[i].opt);
      }
    }

    return function () {
      if (!code.f_main) {
        throw new Error("'main' not found");
      }
      code.f_main({}, {}, code);
    };
  };
}(window.topics = window.topics || {}));
