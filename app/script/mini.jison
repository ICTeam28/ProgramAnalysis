%{
  function range(beg, end)
  {
    return {
      'first_column': beg.first_column,
      'last_column': end.last_column,
      'first_line': beg.first_line,
      'last_line': end.last_line
    };
  }
%}

/* Lexer for the mini language */
%lex
%%

\s+                     /* skip whitespace */
"//"[^\n]*              /* Ignore comment */
'func'                  return 'FUNC';
'return'                return 'RETURN';
'if'                    return 'IF';
'goto'                  return 'GOTO';
'else'                  return 'ELSE';
'while'                 return 'WHILE';
[a-zA-Z_][a-zA-Z_0-9]*  return 'ID';
0|[1-9][0-9]*           return 'NUMBER';
':'                     return ':';
'*'                     return '*';
'/'                     return '/';
'%'                     return '%';
'-'                     return '-';
'+'                     return '+';
'^'                     return '^';
'('                     return '(';
')'                     return ')';
'{'                     return '{';
'}'                     return '}';
','                     return ',';
';'                     return ';';
'=='                    return '==';
'!='                    return '!=';
'>='                    return '>=';
'<='                    return '<=';
'>'                     return '>';
'<'                     return '<';
'&&'                    return '&&';
'||'                    return '||';
'!'                     return '!';
'~'                     return '~';
'='                     return '=';
<<EOF>>                 return 'EOF';
.                       return 'INVALID';

/lex

%left '==' '!='
%left '<' '<=' '>' '>='
%right '&&' '||'
%left '+' '-'
%left '*' '/' '%'
%right '^'
%left '!' '~' NEG

%start program
%%

program
  : root EOF
    {
      return {
        'op': 'prog',
        'funcs': $1
      };
    }
  | EOF
    {
      return {
        'op': 'prog',
        'funcs': []
      };
    }
  ;

root
  : func
    {
      $$ = [$1];
    }
  | root func
    {
      $1.push($2); $$ = $1;
    }
  ;

func
  : FUNC ID funcArgsOpt bodyOpt
    {
      $$ = {
        'op': 'func',
        'name': $2,
        'args': $3,
        'body': $4,
        'loc': range(@0, @4)
      };
    }
  ;

funcArgsOpt
  : '(' funcArgs ')'
    {
      $$ = $2;
    }
  | '(' ')'
    {
      $$ = [];
    }
  ;

funcArgs
  : ID
    {
      $$ = [$1];
    }
  | funcArgs ',' ID
    {
      $1.push($3);
      $$ = $1;
    }
  ;

bodyOpt
  : '{' body '}'
    {
      $$ = $2;
    }
  | '{' '}'
    {
      $$ = [];
    }
  ;

body
  : statement
    {
      $$ = [$1];
    }
  | body statement
    {
      $1.push($2);
      $$ = $1;
    }
  ;

statement
  : return
  | while
  | ifElse
  | assignment
  | label
  | goto
  ;

label
  : ID ':'
    {
      $$ = {
        'op': 'label',
        'label': $1,
        'loc': @1
      }
    }
  ;

goto
  : GOTO ID ';'
    {
      $$ = {
        'op': 'goto',
        'label': $2,
        'loc': @1
      }
    }
  ;

return
  : RETURN expr ';'
    {
      $$ = {
        'op': 'return',
        'expr': $2,
        'loc': range(@1, @3)
      };
    }
  ;

while
  : WHILE '(' expr ')' bodyOpt
    {
      $$ = {
        'op': 'while',
        'cond': $3,
        'body': $5,
        'loc': @5
      };
    }
  ;

ifElse
  : IF '(' expr ')' bodyOpt ELSE bodyOpt
    {
      $$ = {
        'op': 'if',
        'cond': $3,
        'true': $5,
        'false': $7,
        'loc': range(@1, @7),
        'lt': @5,
        'lf': @7
      };
    }
  ;

assignment
  : ID '=' expr ';'
    {
      $$ = {
        'op': 'assign',
        'name': $1,
        'expr': $3,
        'loc': range(@0, @4)
      };
    }
  ;

expr
  : '(' expr ')'
    {
      $$ = $2;
    }
  | expr '*' expr
    {
      $$ = {
        'op': 'bin',
        'p': '*',
        'lhs': $1,
        'rhs': $3,
        'loc': @2
      };
    }
  | expr '/' expr
    {
      $$ = {
        'op': 'bin',
        'p': '/',
        'lhs': $1,
        'rhs': $3,
        'loc': @2
      };
    }
  | expr '%' expr
    {
      $$ = {
        'op': 'bin',
        'p': '%',
        'lhs': $1,
        'rhs': $3,
        'loc': @2
      };
    }
  | expr '^' expr
    {
      $$ = {
        'op': 'bin',
        'p': '^',
        'lhs': $1,
        'rhs': $3,
        'loc': @2
      };
    }
  | expr '+' expr
    {
      $$ = {
        'op': 'bin',
        'p': '+',
        'lhs': $1,
        'rhs': $3,
        'loc': @2
      };
    }
  | expr '-' expr
    {
      $$ = {
        'op': 'bin',
        'p': '-',
        'lhs': $1,
        'rhs': $3,
        'loc': @2
      };
    }
  | expr '==' expr
    {
      $$ = {
        'op': 'bin',
        'p': '==',
        'lhs': $1,
        'rhs': $3,
        'loc': @2
      };
    }
  | expr '!=' expr
    {
      $$ = {
        'op': 'bin',
        'p': '!=',
        'lhs': $1,
        'rhs': $3,
        'loc': @2
      };
    }
  | expr '<=' expr
    {
      $$ = {
        'op': 'bin',
        'p': '<=',
        'lhs': $1,
        'rhs': $3,
        'loc': @2
      };
    }
  | expr '>=' expr
    {
      $$ = {
        'op': 'bin',
        'p': '>=',
        'lhs': $1,
        'rhs': $3,
        'loc': @2
      };
    }
  | expr '&&' expr
    {
      $$ = {
        'op': 'bin',
        'p': '&&',
        'lhs': $1,
        'rhs': $3,
        'loc': @2
      };
    }
  | expr '||' expr
    {
      $$ = {
        'op': 'bin',
        'p': '||',
        'lhs': $1,
        'rhs': $3,
        'loc': @2
      };
    }
  | expr '>' expr
    {
      $$ = {
        'op': 'bin',
        'p': '>',
        'lhs': $1,
        'rhs': $3,
        'loc': @2
      };
    }
  | expr '<' expr
    {
      $$ = {
        'op': 'bin',
        'p': '<',
        'lhs': $1,
        'rhs': $3,
        'loc': @2
      };
    }
  | '!' expr
    {
      $$ = {
        'op': 'un',
        'p': '!',
        'expr': $2,
        'loc': @1
      };
    }
  | '-' expr %prec NEG
    {
      $$ = {
        'op': 'un',
        'p': '-',
        'expr': $2,
        'loc': @1
      };
    }
  | '~' expr
    {
      $$ = {
        'op': 'un',
        'p': '~',
        'expr': $2,
        'loc': @1
      };
    }
  | NUMBER
    {
      $$ = {
        'op': 'num',
        'val': Number(yytext),
        'loc': @1
      };
    }
  | ID callArgsOpt
    {
      $$ = {
        'op': 'call',
        'name': $1,
        'args': $2,
        'loc': range(@1, @2)
      };
    }
  | ID
    {
      $$ = {
        'op': 'var',
        'name': $1,
        'loc': @1
      };
    }
  ;

callArgsOpt
  : '(' callArgs ')'
    {
      $$ = $2;
    }
  | '(' ')'
    {
      $$ = [];
    }
  ;

callArgs
  : expr
    {
      $$ = [$1];
    }
  | callArgs ',' expr
    {
      $1.push($3);
      $$ = $1;
    }
  ;
