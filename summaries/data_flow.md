Title: Data Flow Analysis
Date: 02.02.2014
Category: Data Flow Analysis
Tags: pelican, publishing
Author: Nandor Licker
Summary: Summary of Data Flow Analysis


Live Variable Analysis
======================

Live Variable Analysis is used to determine which variables defined at a certain 
point in a program are going to be used later on. This type of analysis can be 
used to eliminate assigments to variables whose values are not read or are 
overwritten. The results can also be used to minimize storage by reassigning 
the same registers/memory locations to variables which are not live at the 
same point [@Nielson].

In the case of live variable Analysis, we have to define 2 functions, _kill_ and 
_gen_. _kill_ returns the set of variables which are overwritten by a statement 
and _gen_ returns the set of variables which are used in a statement. The
functions are required to compute two sets for each statement, _liveIn_ and 
_liveOut_. A variable is in _liveOut(i)_ if it is defined at a point in the 
program and it is going to be used later on. _liveOut(i)_ contains all the 
variables which are used up to that point. If statement _i_ makes an assignment
to a variable which is not in _liveOut(i)_, the statement can be removed as
its result is not going to be used. 

The equations for the two sets are defined as follows:

$$ liveIn(i) = gen(i)\cup(liveOut(i) \ kill(i)) $$
$$ liveOut(i) = \cup liveIn(x), x \in succ(i) $$

For example, for the following function written in mini:

    func smoothstep(t) {
      y = 0;                  // 0
      x = t ^ 2;              // 1
      square = 3 * x;         // 2
      cube = 2 * x * t;       // 3
      return square - cube;   // 4
    }

The kill and gen function would be defined as follows:

|   | kill    | gen          |
| - | ------- | ------------ |
| 0 | y       |              |
| 1 | x       | t            |
| 2 | square  | x            |
| 3 | cube    | x, t         |
| 4 |         | square, cube |

By solving the system of equations using chaotic iteration we get:

|   | liveIn          | liveOut      |
| - | --------------- | ------------ |
| 0 |                 |              |
| 1 | t               | x, t         |
| 2 | x, t            | square, x, t |
| 3 | square, x, t    | square, cube |
| 4 | square, cube    |              |

Assignment of variables to registers/memory locations
=====================================================

If two variables are live at the same point in 2a program, they need to be 
allocated to different registers or they need different locations in memory. 
Allocation can be optimised by building an *interference graph* from the results
of the analysis where nodes represent variables and the edges are placed between 
the variables which cannot be allocated to the same location. To determine the 
optimal allocation, the *minimal coloring of the graph* has to be  determined. 
Unfortunaly, this problem has been proven to be NP-Complete[@Karp]. Assuming P 
does not equal NP, there is no feasible solution to compute an optimal 
assignment in reasonable time. Fortunately, there are some heuristic algorithms 
which can provide a good distribution [@Brelaz]. In the simulation, we have 
implemented the *Welsh-Powell* algorithm [@Wellsh].

![Interference Graph](../images/igraph.png)

References
==========
[@Nielson]: http://www2.imm.dtu.dk/~hrni/PPA/ppa.html
[@Karp]: http://www.win.tue.nl/~gwoegi/AC/karp-1971.pdf
[@Wellsh]: http://comjnl.oxfordjournals.org/content/10/1/85.abstract
[@Brelaz]: http://dl.acm.org/citation.cfm?id=359101
