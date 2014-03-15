Title: Live Variable Analysis
Date: 29.01.2014
Category: II. Data Flow Analysis
Tags: pelican, publishing
Tags: pelican, publishing
Author: Nandor Licker
Summary: Live Variable Analysis and its applications in program optimisation

Live Variable Analysis is used to determine which variables defined at a certain
point in a program are going to be used later on. This type of analysis can be
used to eliminate assigments to variables whose values are not read or are
overwritten.

In the case of live variable Analysis, we have to define 2 functions, _kill_ and
_gen_. _kill(i)_ returns the set of variables which are overwritten by a
statement and _gen(i)_ returns the set of variables which are used in a
statement. The functions are required to compute two sets for each statement,
_liveIn_ and _liveOut_. A variable is in _liveOut(i)_ if it is defined at a
point in the program and it is going to be used later on. _liveIn(i)_ contains
all the variables which are used up to that point. If statement _i_ makes an
assignment to a variable which is not in _liveOut(i)_, the statement can be
removed as its result is not going to be used [@Nielson].

The two sets, which can be computed using chaotic iteration, are defined as
follows:

$$
\begin{aligned}
  liveOut(i) & =
    \begin{cases}
      \emptyset & \text{if } i \text{ is the last statement}\\\\
      \underset{j \in prev(i)}{\bigcup} liveIn(j) & \text{otherwise}
    \end{cases} \\\\
  liveIn(i) & = gen(i)\cup(liveOut(i) \setminus kill(i))
\end{aligned}
$$

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

By solving the system of equations using chaotic iteration, we get:

|   | liveIn          | liveOut      |
| - | --------------- | ------------ |
| 0 |                 |              |
| 1 | t               | x, t         |
| 2 | x, t            | square, x, t |
| 3 | square, x, t    | square, cube |
| 4 | square, cube    |              |

Assignment of variables to registers/memory locations
=====================================================

If two variables are live at the same point in a program, they need to be
allocated to different registers or they need to be placed in different
locations in memory. Allocation can be optimised by building an
*interference graph* from the results of the analysis where nodes represent
variables and the edges are placed between  the variables which cannot be
allocated to the same location. To determine the optimal allocation, the
*minimal coloring of the graph* has to be  determined. Unfortunaly, this problem
has been proven to be NP-Complete[@Karp]. Assuming P does not equal NP, there is
no feasible solution to compute an optimal assignment in reasonable time.
Fortunately, there are some heuristic algorithms which can provide a good
distribution [@Brelaz]. In the simulation, we have implemented the
*Welsh-Powell* algorithm [@Wellsh].

![Interference Graph](../images/igraph.png)
In the example program, *t* and *cube* are never used concurrently, so they can
be allocated to the same register.

References
==========
[@Nielson "Nielson, Flemming, Hanne R. Nielson, and Chris Hankin. Principles of program analysis. Springer, 1999."]: http://www2.imm.dtu.dk/~hrni/PPA/ppa.html
[@Karp "Karp, Richard M. Reducibility among combinatorial problems. Springer US, 1972."]: http://www.win.tue.nl/~gwoegi/AC/karp-1971.pdf
[@Wellsh "Welsh, D. J., & Powell, M. B. (1967). An upper bound for the chromatic number of a graph and its application to timetabling problems. The Computer Journal, 10(1), 85-86."]: http://comjnl.oxfordjournals.org/content/10/1/85.abstract
[@Brelaz "Brelaz, D. (1979). New methods to color the vertices of a graph. Communications of the ACM, 22(4), 251-256."]: http://dl.acm.org/citation.cfm?id=359101