/**
 * Computing topics project
 * This module is responsible for generating the intermediate
 * form of a program
 */
(function (env)
{
  /**
   * Tab which hold the code for every function
   * @type {?HTMLDivElement}
   */
  var tabs = null;

  /**
   * List of intermediate form instructions
   * @type {Object<String, Array<ImmInstr>>}
   */
  var imf = {};

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
  var ImmInstr = function(op)
  {
    switch (this.op = op)
    {
      /**
       * lbl label
       * Creates a new label
       */
      case 'lbl':
      {
        this.label = arguments[1];
        break;
      }

      /**
       * ret var
       * Returns from a function with the specified value
       */
      case 'ret':
      {
        this.var = arguments[1];
        break;
      }

      /**
       * iconst @reg, $val
       * Loads a constant into a register
       */
      case 'const':
      {
        this.dest = arguments[1];
        this.src = arguments[2];
        break;
      }

      /**
       * ivar @reg, var
       * Loads a value from the stack into a register
       */
      case 'var':
      {
        this.dest = arguments[1];
        this.src = arguments[2];
        break;
      }

      /**
       * ibin op, @rdest, @dest, @src
       * Performs a binary operation
       */
      case 'bin':
      {
        this.p = arguments[1];
        this.dest = arguments[2];
        this.src = arguments[3];
        break;
      }

      /**
       * jmp label
       * Performs an unconditional jump
       */
      case 'jmp':
      {
        this.label = arguments[1];
        break;
      }

      /**
       * cjmp reg, label
       * Performs a conditional jump
       */
      case 'cjmp':
      {
        this.reg = arguments[1];
        this.label = arguments[2];
        break;
      }
    }
  };

  /**
   * Converts an instruction to a string
   * @this {ImmInstr}
   */
  ImmInstr.prototype.toString = function()
  {
    switch (this.op)
    {
      case 'lbl':
      {
        return 'lbl ' + this.label;
      }
      case 'ret':
      {
        return 'ret ' + this.var;
      }
      case 'const':
      {
        return 'const ' + this.dest + ', $' + this.src;
      }
      case 'var':
      {
        return 'var ' + this.dest + ', ' + this.src;
      }
      case 'bin':
      {
        return '(' + this.p + ') ' + this.dest + ', ' + this.src;
      }
      case 'jmp':
      {
        return 'jmp ' + this.label;
      }
      case 'cjmp':
      {
        return 'cjmp ' + this.reg + ', ' + this.label;
      }
    }
  };

  /**
   * Generates code for an expression
   * @return Index of the register where the result is stored
   */
  var generateExpr = function(node, imf, r)
  {
    switch (node['op'])
    {
      case 'num':
      {
        imf.push(new ImmInstr('const', '@' + r, node['val']));
        return r;
      }
      case 'var':
      {
        imf.push(new ImmInstr('var', '@' + r, node['name']));
        return r;
      }
      case 'bin':
      {
        generateExpr(node['lhs'], imf, r);
        generateExpr(node['rhs'], imf, r + 1);
        imf.push(new ImmInstr('bin', node['p'], '@' + r, '@' + (r + 1)));
        return r;
      }
    }

    return 0;
  };

  /**
   * Generates code for a statement
   */
  var generateStatement = function(node, imf)
  {
    switch (node['op'])
    {
      case 'return':
      {
        imf.push(new ImmInstr('ret', '@' + generateExpr(node['expr'], imf, 0)));
        break;
      }
      case 'if':
      {
        var lend = 'L' + (nextLabel++);
        var ltrue = 'L' + (nextLabel++);

        generateExpr(node['cond'], imf, 0);
        imf.push(new ImmInstr('cjmp', '@0', ltrue));

        // False branch
        for (var i = 0; i < node['false'].length; ++i)
        {
          generateStatement(node['false'][i], imf);
        }
        imf.push(new ImmInstr('jmp', lend));

        // True branch
        imf.push(new ImmInstr('lbl', ltrue));
        for (var i = 0; i < node['true'].length; ++i)
        {
          generateStatement(node['true'][i], imf);
        }
        imf.push(new ImmInstr('lbl', lend));

        break;
      }
    }
  };

  /**
   * Generates the intermediate form representation of a function
   */
  var generateFunc = function(node, imf)
  {
    imf.push(new ImmInstr('lbl', 'f_' + node['name']));
    for (var i = 0; i < node['body'].length; ++i)
    {
      generateStatement(node['body'][i], imf);
    }
  };

  /**
   * Converts the abstract syntax tree into immediate form
   */
  env.updateIMF = function (ast)
  {
    imf = {};
    nextLabel = 0;

    $(">div", tabs).remove();
    $(">ul li", tabs).remove();
    tabs.tabs("destroy");

    // Generates the intermediate form of every function
    for (var i = 0; i < ast['funcs'].length; ++i)
    {
      var name = ast['funcs'][i]['name'];
      var func = $("<div id ='f" + name + "'></div>");
      var imf = [];

      // Generate the IMF of the function
      generateFunc(ast['funcs'][i], imf);

      // Add the tab
      $("#imf-tabs > ul")
        .append('<li><a href="#f' + name + '">' + name + '</a></li>');

      for (var j in imf) {
        func.append(imf[j].toString() + "<br/>");
      }

      tabs.append(func);
    }

    tabs.tabs();
  };

  /**
   * Initialises the intermediate form viewer
   */
  env.initIMF = function ()
  {
    tabs = $("#imf-tabs").tabs();
  };
}) (window.topics = window.topics || {});
