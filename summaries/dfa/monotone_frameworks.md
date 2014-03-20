Title: Monotone Frameworks
Date: 26.01.2014
Category: II Data Flow Analysis
Tags: pelican, publishing
Author: Nandor Licker
Summary: Monotone Frameworks

The classical methods of data flow analyses share a common pattern which lead
to the idea of developing a common framework which can be used to define
multiple types of analyses.

1. Live Variables [@Nielson]
$$
\begin{aligned}
  liveOut(i) & =
    \begin{cases}
      \emptyset & \text{if } i \text{ is the last statement}\\\\
      \displaystyle \bigcup_{(i,i')\in CFG^R} liveIn(i') & \text{otherwise}
    \end{cases} \\\\
  liveIn(i) & = gen(i)\cup(liveOut(i) \setminus kill(i))
\end{aligned}
$$
2. Reaching Definitions [@Nielson]
$$
\begin{aligned}
  rdIn(i) & =
    \begin{cases}
      \emptyset & \text{if } i \text{ is the first statement}\\\\
      \displaystyle \bigcup_{(i,i')\in CFG} rdOut(i') & \text{otherwise}
    \end{cases} \\\\
  rdOut(i) & = gen(i)\cup(rdIn(i) \setminus kill(i))
\end{aligned}
$$
3. Available Expressions [@Nielson]
$$
\begin{aligned}
  aeIn(i) & =
    \begin{cases}
      \emptyset & \text{if } i \text{ is the first statement}\\\\
      \displaystyle \bigcap_{(i,i')\in CFG} aeOut(i') & \text{otherwise}
    \end{cases} \\\\
  aeOut(i) & = gen(i)\cup(aeIn(i) \setminus kill(i))
\end{aligned}
$$
4. Very Busy Expressions [@Nielson]
$$
\begin{aligned}
  vbIn(i) & =
    \begin{cases}
      \emptyset & \text{if } i \text{ is the last statement}\\\\
      \displaystyle \bigcap_{(i,i')\in CFG^R} vbOut(i') & \text{otherwise}
    \end{cases} \\\\
  vbOut(i) & = gen(i)\cup(vbIn(i) \setminus kill(i))
\end{aligned}
$$

Common pattern
==============
All the previous equations respect the following pattern:
$$
\begin{aligned}
  analysis_\bullet(i) & =
    \begin{cases}
      \iota & \text{if } i \in E\\\\
      \displaystyle \bigsqcup_{(i,i')\in F} analysis_\circ(i') & \text{otherwise}
    \end{cases}\\\\
  analysis_\circ(i) & = f_l(analysis_\bullet(i))
\end{aligned}
$$

Where:

+ $\iota$ is the initial/final state (usually $\emptyset$)
+ $E$ is the set of terminal statements (entry/exit points)
+ $\bigsqcup$ is either $\bigcup$ or $\bigcap$
+ $F$ is either the control flow graph or the reversed control flow graph
+ $f_l$ is the transfer function

In case of *forward analyses* ([Reaching Definitions](reaching-definitions-analysis.html) and [Available Expressions](available-expressions.html)),
$E$ contains the entry points of a program (an example would be the first
statement in a function), $analysis_\circ$ computes exit conditions,
$analysis_\bullet$ computes entry conditions and the normal control flow graph
is used.

For *backward analyses* ([Live Variables](live-variable-analysis.html) and
[Very Busy Expressions](very-busy-expressions.html)), TERM is the
set of exit points (return statements, for example), $analysis_\circ$ computes
entry conditions, $analysis_\bullet$ computes exit conditions and the reversed
flow graph is used.

Monotone Frameworks
===================

A monotone framework consists of:

+ A property space $L$ which is a complete lattice (i.e. an partially ordered
  set whose subsets have a least upper bound) with a join operator ($\sqcup$) to
  combine information from different paths.
+ A set of monotone transfer functions $f_l : L \rightarrow L$ such that
  $l \sqsubseteq l' \rightarrow f(l) \sqsubseteq f(l')$. $\mathcal{F}$ is a set
  of all such functions which is closed under function composition and also
  contains the identity function.

Instances
---------

Instances of monotone frameworks consist of:

+ The property space $L$ and the set $\mathcal{F}$ of transfer functions
+ A finite flow graph, $F$
+ A set of extremal labels , $E$, and extremal values, $\iota$, for those labels
+ A mapping from the labels to the transfer functions in $\mathcal{F}$

The set of equations has the form:
$$
\begin{aligned}
  analysis_\bullet(i) & = \bigsqcup_{(i,i')\in F} f_l(analysis_\bullet(i')) \sqcup
    \begin{cases}
      \iota & i \in E \\\\
      \bot & i \notin E
    \end{cases}\\\\
  analysis_\circ(i) & = f_l(analysis_\bullet(i))
\end{aligned}
$$

The classical analyses can be rewritten as follows:

|             | Available Expressions   | Reaching Definitions                   | Very Busy Expressions   | Live Variables         |
|:-----------:|:-----------------------:|:--------------------------------------:|:-----------------------:|:----------------------:|
|$L$          |$\mathcal{P}(AExp_\star)$|$\mathcal{P}(Var_\star\times Lab_\star)$|$\mathcal{P}(AExp_\star)$|$\mathcal{P}(Var_\star)$|
|$\sqsubseteq$|$\supseteq$              |$\subseteq$                             |$\supseteq$              |$\subseteq$             |
|$\sqcup$     |$\cap$                   |$\cup$                                  |$\cap$                   |$\cup$                  |
|$\bot$       |$AExp_\star$             |$\emptyset$                             |$AExpr_\star$            |$\emptyset$             |
|$\iota$      |$\emptyset$              |language dependant                      |$\emptyset$              |$\emptyset$             |
|$E$          |entry points             |entry points                            |exit points              |exit points             |
|$F$          |$CFG$                    |$CFG$                                   |$CFG^R$                  |$CFG^R$                 |

|             |                                                                              |
|:-----------:|:----------------------------------------------------------------------------:|
|$\mathcal{F}$|$\lbrace f:L\rightarrow L \mid\exists k,g: f(l)=(l\setminus k)\cup g) \rbrace$|
|$f_i$        |$ f_i(l) = (l\setminus kill(i)) \cup gen(i) $                                 |

Maximal Fixed Point (MFP) solution
----------------------------------

The worklist algorithm can be used to compute the least solution to a
set of data flow equations. The algorithm uses a queue to keep track of the
objects which need to be updated. When a new value for $analysis(i)$ is
computed, all the statements which follow that statement in the flow graph must
be updated as well. The algorithm terminates when the system stabilises and
there are no more sets to be updated [@Rayside].

    worklist <- empty
    for edge in CFG:
      worklist <- edge : worklist

    for i in E:
      analysis[i] <- INIT
    for i in nodes(CFG) \ E:
      analysis[i] <- empty

    while worklist != empty:
      (l, l') : worklist <- worklist
      if f(analysis[l]) not in analysis[l']:
        analysis[l'] = analysis[l'] U f(analysis[l])
        worklist <- worklist ++ adjacent(l')


Meet Over All Paths (MOP) solution
----------------------------------

The MOP solution for a node is obtained by combining the results from all paths
which lead to it. Due to the fact that the number of paths may be infinite
(cyclic graphs), computing the MOP solution is a difficult task. It has been
proven that there is no algorithm which can compute this solution for an
arbitrary instance due to the fact that it is possible to build a framework
whose solution would be the modified Post Correspondence Problem, which has been
proven to be an unsolvable decision problem [@Post]. However, there are
algorithms which can solve specific frameworks or classes of frameworks.
For the classical forms of analysis, the MOP solution is identical to the MFP
one [@Kam].

References
----------

[@Nielson "Nielson, Flemming, Hanne R. Nielson, and Chris Hankin. Principles of program analysis. Springer, 1999. Page 40-50"]: http://www2.imm.dtu.dk/~hrni/PPA/ppa.html
[@Kam "Kam, John B., and Jeffrey D. Ullman. "Monotone data flow analysis frameworks." Acta Informatica 7.3 (1977): 305-317."]: http://download.springer.com/static/pdf/742/art%253A10.1007%252FBF00290339.pdf?auth66=1392462225_8a41583af61c21dd0a5acf990295390a&ext=.pdf
[@Kildall "Kildall, Gary A. "A unified approach to global program optimization." Proceedings of the 1st annual ACM SIGACT-SIGPLAN symposium on Principles of programming languages. ACM, 1973."]: http://dl.acm.org/citation.cfm?id=512945&coll=portal&dl=ACM
[@Rayside "Rayside, Derek, and Kostas Kontogiannis. "A generic worklist algorithm for graph reachability problems in program analysis." Proceedings of the Business and Industry Simulation Symposium. Washington DC [SCS. 2001."]: http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.66.1554&rep=rep1&type=pdf
[@Post "Post, Emil L. "A variant of a recursively unsolvable problem." Bulletin of the American Mathematical Society 52.4 (1946): 264-268."]: http://www.ams.org/journals/bull/1946-52-04/S0002-9904-1946-08555-9/