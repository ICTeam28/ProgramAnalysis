/* parser generated by jison 0.4.13 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var mini = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"program":3,"root":4,"EOF":5,"func":6,"FUNC":7,"ID":8,"funcArgsOpt":9,"bodyOpt":10,"(":11,"funcArgs":12,")":13,",":14,"{":15,"body":16,"}":17,"statement":18,"return":19,"while":20,"ifElse":21,"assignment":22,"RETURN":23,"expr":24,";":25,"WHILE":26,"IF":27,"ELSE":28,"=":29,"*":30,"/":31,"%":32,"^":33,"+":34,"-":35,"==":36,"!=":37,"<=":38,">=":39,"&&":40,"||":41,">":42,"<":43,"!":44,"~":45,"NUMBER":46,"callArgsOpt":47,"callArgs":48,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",7:"FUNC",8:"ID",11:"(",13:")",14:",",15:"{",17:"}",23:"RETURN",25:";",26:"WHILE",27:"IF",28:"ELSE",29:"=",30:"*",31:"/",32:"%",33:"^",34:"+",35:"-",36:"==",37:"!=",38:"<=",39:">=",40:"&&",41:"||",42:">",43:"<",44:"!",45:"~",46:"NUMBER"},
productions_: [0,[3,2],[3,1],[4,1],[4,2],[6,4],[9,3],[9,2],[12,1],[12,3],[10,3],[10,2],[16,1],[16,2],[18,1],[18,1],[18,1],[18,1],[19,3],[20,5],[21,7],[22,4],[24,3],[24,3],[24,3],[24,3],[24,3],[24,3],[24,3],[24,3],[24,3],[24,3],[24,3],[24,3],[24,3],[24,3],[24,3],[24,2],[24,2],[24,2],[24,1],[24,2],[24,1],[47,3],[47,2],[48,1],[48,3]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:
      return {
        'op': 'prog',
        'funcs': $$[$0-1]
      };
    
break;
case 2:
      return {
        'op': 'prog',
        'funcs': []
      };
    
break;
case 3:
      this.$ = [$$[$0]];
    
break;
case 4:
      $$[$0-1].push($$[$0]); this.$ = $$[$0-1];
    
break;
case 5:
      this.$ = {
        'op': 'func',
        'name': $$[$0-2],
        'args': $$[$0-1],
        'body': $$[$0],
        'loc': range(this._$, _$[$0])
      };
    
break;
case 6:
      this.$ = $$[$0-1];
    
break;
case 7:
      this.$ = [];
    
break;
case 8:
      this.$ = [$$[$0]];
    
break;
case 9:
      $$[$0-2].push($$[$0]);
      this.$ = $$[$0-2];
    
break;
case 10:
      this.$ = $$[$0-1];
    
break;
case 11:
      this.$ = [];
    
break;
case 12:
      this.$ = [$$[$0]];
    
break;
case 13:
      $$[$0-1].push($$[$0]);
      this.$ = $$[$0-1];
    
break;
case 18:
      this.$ = {
        'op': 'return',
        'expr': $$[$0-1],
        'loc': range(_$[$0-2], _$[$0])
      };
    
break;
case 19:
      this.$ = {
        'op': 'while',
        'cond': $$[$0-2],
        'body': $$[$0],
        'loc': _$[$0]
      };
    
break;
case 20:
      this.$ = {
        'op': 'if',
        'cond': $$[$0-4],
        'true': $$[$0-2],
        'false': $$[$0],
        'loc': range(_$[$0-6], _$[$0]),
        'lt': _$[$0-2],
        'lf': _$[$0]
      };
    
break;
case 21:
      this.$ = {
        'op': 'assign',
        'name': $$[$0-3],
        'expr': $$[$0-1],
        'loc': range(this._$, _$[$0])
      };
    
break;
case 22:
      this.$ = $$[$0-1];
    
break;
case 23:
      this.$ = {
        'op': 'bin',
        'p': '*',
        'lhs': $$[$0-2],
        'rhs': $$[$0],
        'loc': _$[$0-1]
      };
    
break;
case 24:
      this.$ = {
        'op': 'bin',
        'p': '/',
        'lhs': $$[$0-2],
        'rhs': $$[$0],
        'loc': _$[$0-1]
      };
    
break;
case 25:
      this.$ = {
        'op': 'bin',
        'p': '%',
        'lhs': $$[$0-2],
        'rhs': $$[$0],
        'loc': _$[$0-1]
      };
    
break;
case 26:
      this.$ = {
        'op': 'bin',
        'p': '^',
        'lhs': $$[$0-2],
        'rhs': $$[$0],
        'loc': _$[$0-1]
      };
    
break;
case 27:
      this.$ = {
        'op': 'bin',
        'p': '+',
        'lhs': $$[$0-2],
        'rhs': $$[$0],
        'loc': _$[$0-1]
      };
    
break;
case 28:
      this.$ = {
        'op': 'bin',
        'p': '-',
        'lhs': $$[$0-2],
        'rhs': $$[$0],
        'loc': _$[$0-1]
      };
    
break;
case 29:
      this.$ = {
        'op': 'bin',
        'p': '==',
        'lhs': $$[$0-2],
        'rhs': $$[$0],
        'loc': _$[$0-1]
      };
    
break;
case 30:
      this.$ = {
        'op': 'bin',
        'p': '!=',
        'lhs': $$[$0-2],
        'rhs': $$[$0],
        'loc': _$[$0-1]
      };
    
break;
case 31:
      this.$ = {
        'op': 'bin',
        'p': '<=',
        'lhs': $$[$0-2],
        'rhs': $$[$0],
        'loc': _$[$0-1]
      };
    
break;
case 32:
      this.$ = {
        'op': 'bin',
        'p': '>=',
        'lhs': $$[$0-2],
        'rhs': $$[$0],
        'loc': _$[$0-1]
      };
    
break;
case 33:
      this.$ = {
        'op': 'bin',
        'p': '&&',
        'lhs': $$[$0-2],
        'rhs': $$[$0],
        'loc': _$[$0-1]
      };
    
break;
case 34:
      this.$ = {
        'op': 'bin',
        'p': '||',
        'lhs': $$[$0-2],
        'rhs': $$[$0],
        'loc': _$[$0-1]
      };
    
break;
case 35:
      this.$ = {
        'op': 'bin',
        'p': '>',
        'lhs': $$[$0-2],
        'rhs': $$[$0],
        'loc': _$[$0-1]
      };
    
break;
case 36:
      this.$ = {
        'op': 'bin',
        'p': '<',
        'lhs': $$[$0-2],
        'rhs': $$[$0],
        'loc': _$[$0-1]
      };
    
break;
case 37:
      this.$ = {
        'op': 'un',
        'p': '!',
        'expr': $$[$0],
        'loc': _$[$0-1]
      };
    
break;
case 38:
      this.$ = {
        'op': 'un',
        'p': '-',
        'expr': $$[$0],
        'loc': _$[$0-1]
      };
    
break;
case 39:
      this.$ = {
        'op': 'un',
        'p': '~',
        'expr': $$[$0],
        'loc': _$[$0-1]
      };
    
break;
case 40:
      this.$ = {
        'op': 'num',
        'val': Number(yytext),
        'loc': _$[$0]
      };
    
break;
case 41:
      this.$ = {
        'op': 'call',
        'name': $$[$0-1],
        'args': $$[$0],
        'loc': range(_$[$0-1], _$[$0])
      };
    
break;
case 42:
      this.$ = {
        'op': 'var',
        'name': $$[$0],
        'loc': _$[$0]
      };
    
break;
case 43:
      this.$ = $$[$0-1];
    
break;
case 44:
      this.$ = [];
    
break;
case 45:
      this.$ = [$$[$0]];
    
break;
case 46:
      $$[$0-2].push($$[$0]);
      this.$ = $$[$0-2];
    
break;
}
},
table: [{3:1,4:2,5:[1,3],6:4,7:[1,5]},{1:[3]},{5:[1,6],6:7,7:[1,5]},{1:[2,2]},{5:[2,3],7:[2,3]},{8:[1,8]},{1:[2,1]},{5:[2,4],7:[2,4]},{9:9,11:[1,10]},{10:11,15:[1,12]},{8:[1,15],12:13,13:[1,14]},{5:[2,5],7:[2,5]},{8:[1,26],16:16,17:[1,17],18:18,19:19,20:20,21:21,22:22,23:[1,23],26:[1,24],27:[1,25]},{13:[1,27],14:[1,28]},{15:[2,7]},{13:[2,8],14:[2,8]},{8:[1,26],17:[1,29],18:30,19:19,20:20,21:21,22:22,23:[1,23],26:[1,24],27:[1,25]},{5:[2,11],7:[2,11],8:[2,11],17:[2,11],23:[2,11],26:[2,11],27:[2,11],28:[2,11]},{8:[2,12],17:[2,12],23:[2,12],26:[2,12],27:[2,12]},{8:[2,14],17:[2,14],23:[2,14],26:[2,14],27:[2,14]},{8:[2,15],17:[2,15],23:[2,15],26:[2,15],27:[2,15]},{8:[2,16],17:[2,16],23:[2,16],26:[2,16],27:[2,16]},{8:[2,17],17:[2,17],23:[2,17],26:[2,17],27:[2,17]},{8:[1,37],11:[1,32],24:31,35:[1,34],44:[1,33],45:[1,35],46:[1,36]},{11:[1,38]},{11:[1,39]},{29:[1,40]},{15:[2,6]},{8:[1,41]},{5:[2,10],7:[2,10],8:[2,10],17:[2,10],23:[2,10],26:[2,10],27:[2,10],28:[2,10]},{8:[2,13],17:[2,13],23:[2,13],26:[2,13],27:[2,13]},{25:[1,42],30:[1,43],31:[1,44],32:[1,45],33:[1,46],34:[1,47],35:[1,48],36:[1,49],37:[1,50],38:[1,51],39:[1,52],40:[1,53],41:[1,54],42:[1,55],43:[1,56]},{8:[1,37],11:[1,32],24:57,35:[1,34],44:[1,33],45:[1,35],46:[1,36]},{8:[1,37],11:[1,32],24:58,35:[1,34],44:[1,33],45:[1,35],46:[1,36]},{8:[1,37],11:[1,32],24:59,35:[1,34],44:[1,33],45:[1,35],46:[1,36]},{8:[1,37],11:[1,32],24:60,35:[1,34],44:[1,33],45:[1,35],46:[1,36]},{13:[2,40],14:[2,40],25:[2,40],30:[2,40],31:[2,40],32:[2,40],33:[2,40],34:[2,40],35:[2,40],36:[2,40],37:[2,40],38:[2,40],39:[2,40],40:[2,40],41:[2,40],42:[2,40],43:[2,40]},{11:[1,62],13:[2,42],14:[2,42],25:[2,42],30:[2,42],31:[2,42],32:[2,42],33:[2,42],34:[2,42],35:[2,42],36:[2,42],37:[2,42],38:[2,42],39:[2,42],40:[2,42],41:[2,42],42:[2,42],43:[2,42],47:61},{8:[1,37],11:[1,32],24:63,35:[1,34],44:[1,33],45:[1,35],46:[1,36]},{8:[1,37],11:[1,32],24:64,35:[1,34],44:[1,33],45:[1,35],46:[1,36]},{8:[1,37],11:[1,32],24:65,35:[1,34],44:[1,33],45:[1,35],46:[1,36]},{13:[2,9],14:[2,9]},{8:[2,18],17:[2,18],23:[2,18],26:[2,18],27:[2,18]},{8:[1,37],11:[1,32],24:66,35:[1,34],44:[1,33],45:[1,35],46:[1,36]},{8:[1,37],11:[1,32],24:67,35:[1,34],44:[1,33],45:[1,35],46:[1,36]},{8:[1,37],11:[1,32],24:68,35:[1,34],44:[1,33],45:[1,35],46:[1,36]},{8:[1,37],11:[1,32],24:69,35:[1,34],44:[1,33],45:[1,35],46:[1,36]},{8:[1,37],11:[1,32],24:70,35:[1,34],44:[1,33],45:[1,35],46:[1,36]},{8:[1,37],11:[1,32],24:71,35:[1,34],44:[1,33],45:[1,35],46:[1,36]},{8:[1,37],11:[1,32],24:72,35:[1,34],44:[1,33],45:[1,35],46:[1,36]},{8:[1,37],11:[1,32],24:73,35:[1,34],44:[1,33],45:[1,35],46:[1,36]},{8:[1,37],11:[1,32],24:74,35:[1,34],44:[1,33],45:[1,35],46:[1,36]},{8:[1,37],11:[1,32],24:75,35:[1,34],44:[1,33],45:[1,35],46:[1,36]},{8:[1,37],11:[1,32],24:76,35:[1,34],44:[1,33],45:[1,35],46:[1,36]},{8:[1,37],11:[1,32],24:77,35:[1,34],44:[1,33],45:[1,35],46:[1,36]},{8:[1,37],11:[1,32],24:78,35:[1,34],44:[1,33],45:[1,35],46:[1,36]},{8:[1,37],11:[1,32],24:79,35:[1,34],44:[1,33],45:[1,35],46:[1,36]},{13:[1,80],30:[1,43],31:[1,44],32:[1,45],33:[1,46],34:[1,47],35:[1,48],36:[1,49],37:[1,50],38:[1,51],39:[1,52],40:[1,53],41:[1,54],42:[1,55],43:[1,56]},{13:[2,37],14:[2,37],25:[2,37],30:[2,37],31:[2,37],32:[2,37],33:[2,37],34:[2,37],35:[2,37],36:[2,37],37:[2,37],38:[2,37],39:[2,37],40:[2,37],41:[2,37],42:[2,37],43:[2,37]},{13:[2,38],14:[2,38],25:[2,38],30:[2,38],31:[2,38],32:[2,38],33:[2,38],34:[2,38],35:[2,38],36:[2,38],37:[2,38],38:[2,38],39:[2,38],40:[2,38],41:[2,38],42:[2,38],43:[2,38]},{13:[2,39],14:[2,39],25:[2,39],30:[2,39],31:[2,39],32:[2,39],33:[2,39],34:[2,39],35:[2,39],36:[2,39],37:[2,39],38:[2,39],39:[2,39],40:[2,39],41:[2,39],42:[2,39],43:[2,39]},{13:[2,41],14:[2,41],25:[2,41],30:[2,41],31:[2,41],32:[2,41],33:[2,41],34:[2,41],35:[2,41],36:[2,41],37:[2,41],38:[2,41],39:[2,41],40:[2,41],41:[2,41],42:[2,41],43:[2,41]},{8:[1,37],11:[1,32],13:[1,82],24:83,35:[1,34],44:[1,33],45:[1,35],46:[1,36],48:81},{13:[1,84],30:[1,43],31:[1,44],32:[1,45],33:[1,46],34:[1,47],35:[1,48],36:[1,49],37:[1,50],38:[1,51],39:[1,52],40:[1,53],41:[1,54],42:[1,55],43:[1,56]},{13:[1,85],30:[1,43],31:[1,44],32:[1,45],33:[1,46],34:[1,47],35:[1,48],36:[1,49],37:[1,50],38:[1,51],39:[1,52],40:[1,53],41:[1,54],42:[1,55],43:[1,56]},{25:[1,86],30:[1,43],31:[1,44],32:[1,45],33:[1,46],34:[1,47],35:[1,48],36:[1,49],37:[1,50],38:[1,51],39:[1,52],40:[1,53],41:[1,54],42:[1,55],43:[1,56]},{13:[2,23],14:[2,23],25:[2,23],30:[2,23],31:[2,23],32:[2,23],33:[1,46],34:[2,23],35:[2,23],36:[2,23],37:[2,23],38:[2,23],39:[2,23],40:[2,23],41:[2,23],42:[2,23],43:[2,23]},{13:[2,24],14:[2,24],25:[2,24],30:[2,24],31:[2,24],32:[2,24],33:[1,46],34:[2,24],35:[2,24],36:[2,24],37:[2,24],38:[2,24],39:[2,24],40:[2,24],41:[2,24],42:[2,24],43:[2,24]},{13:[2,25],14:[2,25],25:[2,25],30:[2,25],31:[2,25],32:[2,25],33:[1,46],34:[2,25],35:[2,25],36:[2,25],37:[2,25],38:[2,25],39:[2,25],40:[2,25],41:[2,25],42:[2,25],43:[2,25]},{13:[2,26],14:[2,26],25:[2,26],30:[2,26],31:[2,26],32:[2,26],33:[1,46],34:[2,26],35:[2,26],36:[2,26],37:[2,26],38:[2,26],39:[2,26],40:[2,26],41:[2,26],42:[2,26],43:[2,26]},{13:[2,27],14:[2,27],25:[2,27],30:[1,43],31:[1,44],32:[1,45],33:[1,46],34:[2,27],35:[2,27],36:[2,27],37:[2,27],38:[2,27],39:[2,27],40:[2,27],41:[2,27],42:[2,27],43:[2,27]},{13:[2,28],14:[2,28],25:[2,28],30:[1,43],31:[1,44],32:[1,45],33:[1,46],34:[2,28],35:[2,28],36:[2,28],37:[2,28],38:[2,28],39:[2,28],40:[2,28],41:[2,28],42:[2,28],43:[2,28]},{13:[2,29],14:[2,29],25:[2,29],30:[1,43],31:[1,44],32:[1,45],33:[1,46],34:[1,47],35:[1,48],36:[2,29],37:[2,29],38:[1,51],39:[1,52],40:[1,53],41:[1,54],42:[1,55],43:[1,56]},{13:[2,30],14:[2,30],25:[2,30],30:[1,43],31:[1,44],32:[1,45],33:[1,46],34:[1,47],35:[1,48],36:[2,30],37:[2,30],38:[1,51],39:[1,52],40:[1,53],41:[1,54],42:[1,55],43:[1,56]},{13:[2,31],14:[2,31],25:[2,31],30:[1,43],31:[1,44],32:[1,45],33:[1,46],34:[1,47],35:[1,48],36:[2,31],37:[2,31],38:[2,31],39:[2,31],40:[1,53],41:[1,54],42:[2,31],43:[2,31]},{13:[2,32],14:[2,32],25:[2,32],30:[1,43],31:[1,44],32:[1,45],33:[1,46],34:[1,47],35:[1,48],36:[2,32],37:[2,32],38:[2,32],39:[2,32],40:[1,53],41:[1,54],42:[2,32],43:[2,32]},{13:[2,33],14:[2,33],25:[2,33],30:[1,43],31:[1,44],32:[1,45],33:[1,46],34:[1,47],35:[1,48],36:[2,33],37:[2,33],38:[2,33],39:[2,33],40:[1,53],41:[1,54],42:[2,33],43:[2,33]},{13:[2,34],14:[2,34],25:[2,34],30:[1,43],31:[1,44],32:[1,45],33:[1,46],34:[1,47],35:[1,48],36:[2,34],37:[2,34],38:[2,34],39:[2,34],40:[1,53],41:[1,54],42:[2,34],43:[2,34]},{13:[2,35],14:[2,35],25:[2,35],30:[1,43],31:[1,44],32:[1,45],33:[1,46],34:[1,47],35:[1,48],36:[2,35],37:[2,35],38:[2,35],39:[2,35],40:[1,53],41:[1,54],42:[2,35],43:[2,35]},{13:[2,36],14:[2,36],25:[2,36],30:[1,43],31:[1,44],32:[1,45],33:[1,46],34:[1,47],35:[1,48],36:[2,36],37:[2,36],38:[2,36],39:[2,36],40:[1,53],41:[1,54],42:[2,36],43:[2,36]},{13:[2,22],14:[2,22],25:[2,22],30:[2,22],31:[2,22],32:[2,22],33:[2,22],34:[2,22],35:[2,22],36:[2,22],37:[2,22],38:[2,22],39:[2,22],40:[2,22],41:[2,22],42:[2,22],43:[2,22]},{13:[1,87],14:[1,88]},{13:[2,44],14:[2,44],25:[2,44],30:[2,44],31:[2,44],32:[2,44],33:[2,44],34:[2,44],35:[2,44],36:[2,44],37:[2,44],38:[2,44],39:[2,44],40:[2,44],41:[2,44],42:[2,44],43:[2,44]},{13:[2,45],14:[2,45],30:[1,43],31:[1,44],32:[1,45],33:[1,46],34:[1,47],35:[1,48],36:[1,49],37:[1,50],38:[1,51],39:[1,52],40:[1,53],41:[1,54],42:[1,55],43:[1,56]},{10:89,15:[1,12]},{10:90,15:[1,12]},{8:[2,21],17:[2,21],23:[2,21],26:[2,21],27:[2,21]},{13:[2,43],14:[2,43],25:[2,43],30:[2,43],31:[2,43],32:[2,43],33:[2,43],34:[2,43],35:[2,43],36:[2,43],37:[2,43],38:[2,43],39:[2,43],40:[2,43],41:[2,43],42:[2,43],43:[2,43]},{8:[1,37],11:[1,32],24:91,35:[1,34],44:[1,33],45:[1,35],46:[1,36]},{8:[2,19],17:[2,19],23:[2,19],26:[2,19],27:[2,19]},{28:[1,92]},{13:[2,46],14:[2,46],30:[1,43],31:[1,44],32:[1,45],33:[1,46],34:[1,47],35:[1,48],36:[1,49],37:[1,50],38:[1,51],39:[1,52],40:[1,53],41:[1,54],42:[1,55],43:[1,56]},{10:93,15:[1,12]},{8:[2,20],17:[2,20],23:[2,20],26:[2,20],27:[2,20]}],
defaultActions: {3:[2,2],6:[2,1],14:[2,7],27:[2,6]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    this.yy.parser = this;
    if (typeof this.lexer.yylloc == 'undefined') {
        this.lexer.yylloc = {};
    }
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    var ranges = this.lexer.options && this.lexer.options.ranges;
    if (typeof this.yy.parseError === 'function') {
        this.parseError = this.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || EOF;
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + this.lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: this.lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: this.lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                this.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};

  function range(beg, end)
  {
    return {
      'first_column': beg.first_column,
      'last_column': end.last_column,
      'first_line': beg.first_line,
      'last_line': end.last_line
    };
  }
/* generated by jison-lex 0.2.1 */
var lexer = (function(){
var lexer = {

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input) {
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {

var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/* skip whitespace */
break;
case 1:/* Ignore comment */
break;
case 2:return 7;
break;
case 3:return 23;
break;
case 4:return 27;
break;
case 5:return 28;
break;
case 6:return 26;
break;
case 7:return 8;
break;
case 8:return 46;
break;
case 9:return 30;
break;
case 10:return 31;
break;
case 11:return 32;
break;
case 12:return 35;
break;
case 13:return 34;
break;
case 14:return 33;
break;
case 15:return 11;
break;
case 16:return 13;
break;
case 17:return 15;
break;
case 18:return 17;
break;
case 19:return 14;
break;
case 20:return 25;
break;
case 21:return 36;
break;
case 22:return 37;
break;
case 23:return 39;
break;
case 24:return 38;
break;
case 25:return 42;
break;
case 26:return 43;
break;
case 27:return 40;
break;
case 28:return 41;
break;
case 29:return 44;
break;
case 30:return 45;
break;
case 31:return 29;
break;
case 32:return 5;
break;
case 33:return 'INVALID';
break;
}
},
rules: [/^(?:\s+)/,/^(?:\/\/[^\n]*)/,/^(?:func\b)/,/^(?:return\b)/,/^(?:if\b)/,/^(?:else\b)/,/^(?:while\b)/,/^(?:[a-zA-Z_][a-zA-Z_0-9]*)/,/^(?:0|[1-9][0-9]*)/,/^(?:\*)/,/^(?:\/)/,/^(?:%)/,/^(?:-)/,/^(?:\+)/,/^(?:\^)/,/^(?:\()/,/^(?:\))/,/^(?:\{)/,/^(?:\})/,/^(?:,)/,/^(?:;)/,/^(?:==)/,/^(?:!=)/,/^(?:>=)/,/^(?:<=)/,/^(?:>)/,/^(?:<)/,/^(?:&&)/,/^(?:\|\|)/,/^(?:!)/,/^(?:~)/,/^(?:=)/,/^(?:$)/,/^(?:.)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33],"inclusive":true}}
};
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = mini;
exports.Parser = mini.Parser;
exports.parse = function () { return mini.parse.apply(mini, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}