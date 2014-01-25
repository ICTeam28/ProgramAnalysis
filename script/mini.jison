/* Lexer for the mini language */
%lex
%%

\s+                     /* skip whitespace */
'func'                  return 'FUNC';
'return'                return 'RETURN';
'if'                    return 'IF';
'else'                  return 'ELSE';
'while'                 return 'WHILE';
[a-zA-Z_][a-zA-Z_0-9]*  return 'ID';
0|[1-9][0-9]*           return 'NUMBER';
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

%right '&&' '||'
%left '==' '!='
%left '<' '<=' '>' '>=' 
%left '+' '-'
%left '*' '/' '%'
%right '^'
%left '!' '~' NEG

%start program
%%

program
  : root EOF
    { return { 'op': 'prog', 'funcs': $1 }; }
  | EOF
    { return { 'op': 'prog', 'funcs': [] }; }
  ;

root
  : func
    { $$ = [$1]; }
  | root func
    { $1.push($2); $$ = $1; }
  ;

func
  : FUNC ID funcArgsOpt bodyOpt
    { $$ = { 'op': 'func', 'name': $2, 'args': $3, 'body': $4 }; }
  ;

funcArgsOpt
  : '(' funcArgs ')'
    { $$ = $2; }
  | '(' ')'
    { $$ = []; }
  ;

funcArgs
  : ID
    { $$ = [$1]; }
  | funcArgs ',' ID
    { $1.push($3); $$ = $1; }
  ;

bodyOpt
  : '{' body '}'
    { $$ = $2; }
  | '{' '}'
    { $$ = []; }
  ;

body
  : statement
    { $$ = [$1]; }
  | body statement
    { $1.push($2); $$ = $1; }
  ;

statement
  : return
  | ifElse
  | assignment
  ;

return
  : 'RETURN' expr ';'
    { $$ = { 'op': 'return', 'expr': $2 }; }
  ;

ifElse
  : IF '(' expr ')' bodyOpt ELSE bodyOpt
    { $$ = { 'op': 'if', 'cond': $3, 'true': $5, 'false': $7 }; }
  ;

assignment
  : ID '=' expr ';'
    { $$ = { 'op': 'assign', 'var': $1, 'val': $3 }; }
  ;

expr
  : '(' expr ')'
    { $$ = $2; }
  | expr '*' expr
    { $$ = { 'op': 'bin', 'p': '*', 'lhs': $1, 'rhs': $3 }; }
  | expr '/' expr
    { $$ = { 'op': 'bin', 'p': '/', 'lhs': $1, 'rhs': $3 }; }
  | expr '%' expr
    { $$ = { 'op': 'bin', 'p': '%', 'lhs': $1, 'rhs': $3 }; }
  | expr '^' expr
    { $$ = { 'op': 'bin', 'p': '^', 'lhs': $1, 'rhs': $3 }; }
  | expr '+' expr
    { $$ = { 'op': 'bin', 'p': '+', 'lhs': $1, 'rhs': $3 }; }
  | expr '-' expr
    { $$ = { 'op': 'bin', 'p': '-', 'lhs': $1, 'rhs': $3 }; }
  | expr '==' expr
    { $$ = { 'op': 'bin', 'p': '==', 'lhs': $1, 'rhs': $3 }; }
  | expr '!=' expr
    { $$ = { 'op': 'bin', 'p': '!=', 'lhs': $1, 'rhs': $3 }; }
  | expr '<' expr
    { $$ = { 'op': 'bin', 'p': '<', 'lhs': $1, 'rhs': $3 }; }
  | expr '<=' expr
    { $$ = { 'op': 'bin', 'p': '<=', 'lhs': $1, 'rhs': $3 }; }
  | expr '>' expr
    { $$ = { 'op': 'bin', 'p': '>', 'lhs': $1, 'rhs': $3 }; }
  | expr '>=' expr
    { $$ = { 'op': 'bin', 'p': '>=', 'lhs': $1, 'rhs': $3 }; }
  | expr '&&' expr
    { $$ = { 'op': 'bin', 'p': '&&', 'lhs': $1, 'rhs': $3 }; }
  | expr '||' expr
    { $$ = { 'op': 'bin', 'p': '||', 'lhs': $1, 'rhs': $3 }; }
  | '!' expr
    { $$ = { 'op': 'un', 'p': '!', 'expr': $2 }; }
  | '-' expr %prec NEG
    { $$ = { 'op': 'un', 'p': '-', 'expr': $2 }; }
  | '~' expr
    { $$ = { 'op': 'un', 'p': '~', 'expr': $2 }; }
  | NUMBER
    { $$ = { 'op': 'num', 'val': Number(yytext) }; }
  | ID callArgsOpt
    { $$ = { 'op': 'call', 'name': $1, 'args': $2 }; }
  | ID
    { $$ = { 'op': 'var', 'name': $1 }; }
  ;

callArgsOpt
  : '(' callArgs ')'
    { $$ = $2; }
  | '(' ')'
    { $$ = []; }
  ;

callArgs
  : expr
    { $$ = [$1]; }
  | callArgs ',' expr
    { $1.push($3); $$ = $1; }
  ;
