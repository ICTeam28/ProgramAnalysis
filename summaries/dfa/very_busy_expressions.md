Title: Very Busy Expressions
Date: 2014-03-14 20:06
Category: II. Data Flow Analysis
Tags: pelican, publishing
Tags: pelican, publishing
Author: Ilija Radosavovic
Summary: Very Busy Expressions


Very Busy Expressions analysis is the backwards version of Available Expression analysis.
An expression is *very busy* at the exit from a label if, no matter what path is taken from the
label, the expression is going to be used before any of the variables occurring in it are redefined.
For each program point, we use the Very Busy Expressions analysis in order to determine
which expressions must be *very busy* at the exit from the point. [@Nielson]

Very Busy Expressions analysis are used for *code hoisting*. (create link to hoisting page)
For example, if at a block of the program we have an expression which is definitely going to be
evaluated later in the program, no matter which path is taken, we can evaluate
that expression at the end of the block and store its value for later use,
and thus reduce the size of the generated code.

Data flow equations:
$$
  \begin{aligned}
  VBentry(l)  = (VBexit(l)-Kill(l)) \bigcup Gen(l)  \\\\
  VBexit(l) = \bigcap \text{predecessors  } l' \text{of } l \text{ } VBentry(l') \\\\
  \end{aligned}
$$

Very Busy Expressions analysis is backwards analysis and we are interested in the largest
set satisfying the equation for VBexit [@Nielson]

We use Kill and Gen functions in order to generate sets of expressions,
which will enable us to solve the data flow equations.
An expression is generated in the block, if it is evaluated in that block and none of its variables are later redefined in the block.
An expression is killed by the block if any of the variables occurring in it are redefined in the block.

Consider the following program:

    if[a>b]^1
      then ([x:=b-a]^2
            [y:=a-b]^3
      else ([y:=b-a]^4
            [x:=a-b]^5)

Computing Kill and Gen functions we get:

|<center>$l$</center>|<center>Kill($l$)</center> | <center>Gen($l$)<center/>  |
|:--:|:----------:|:-------------:|
| 1 | $\\{\\}$   | $\\{\\}$      |
| 2 | $\\{\\}$   | $\\{b-a\\}$ |
| 3 | $\\{\\}$   | $\\{a-b\\}$ |
| 4 | $\\{\\}$   | $\\{b-a\\}$ |
| 5 | $\\{\\}$   | $\\{a-b\\}$ |

Constructing the data flow equations we get:

$$
  \begin{aligned}
    VBentry(1) & = VBexit(1) \\\\
    VBentry(2) & = VBexit(2) \bigcup \\{b-a\\} \\\\
    VBentry(3) & = \\{a-b\\} \\\\
    VBentry(4) & = VBexit(4) \bigcup \\{b-a\\} \\\\
    VBentry(5) & = \\{a-b\\} \\\\
  \end{aligned}
$$

$$
  \begin{aligned}
    VBexit(1) & = VBentry(2) \bigcap VBentry(4) \\\\
    VBexit(2) & = VBentry(3) \\\\
    VBexit(3) & = \\{\\} \\\\
    VBexit(4) & = VBentry(5) \\\\
    VBexit(5) & = \\{\\} \\\\
  \end{aligned}
$$

Using Chaotic Iteration, we compute the solution:

|<center>$l$</center>| <center>VBentry($l$)</center> | <center>VBexit($l$)</center>  |
|:-:|:---------------:|:---------------:|
| 1 | $\\{a-b,b-a\\}$ | $\\{a-b,b-a\\}$ |
| 2 | $\\{a-b,b-a\\}$ | $\\{a-b\\}$     |
| 3 | $\\{a-b\\}$     | $\\{\\}$        |
| 4 | $\\{a-b,b-a\\}$ | $\\{a-b\\}$     |
| 5 | $\\{a-b\\}$     | $\\{\\}$        |



References
==========
[@Nielson "Nielson, Flemming, Hanne R. Nielson, and Chris Hankin. Principles of program analysis. Springer, 1999. Page 44-47"]: http://www2.imm.dtu.dk/~hrni/PPA/ppa.html
