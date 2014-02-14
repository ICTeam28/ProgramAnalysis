Title: Monotone Frameworks
Date: 26.01.2014
Category: Data Flow Analysis
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
      INIT & \text{if } i \in TERM\\\\
      \displaystyle \bigsqcup_{(i,i')\in F} analysis_\circ(i') & \text{otherwise}
    \end{cases}\\\\
  analysis_\circ(i) & = f_l(analysis_\bullet(i))
\end{aligned}
$$

Where:

+ $INIT$ is the initial/final state (usually $\emptyset$)
+ $TERM$ is the set of terminal statements (entry/exit points) 
+ $\bigsqcup$ is either $\bigcup$ or $\bigcap$
+ $F$ is either the control flow graph or the reversed control flow graph
+ $f_l$ is the transfer function

In case of *forward analyses* (Reaching Definitions and Available Expressions),
TERM contains the entry points of a program (an example would be the first
statement in a function), $analysis_\circ$ computes exit conditions, 
$analysis_\bullet$ computes entry conditions and the normal control flow graph
is used.

For *backward analyses* (Live Variables and Very Busy Expressions), TERM is the
set of exit points (return statements, for example), $analysis_\circ$ computes 
entry conditions, $analysis_\bullet$ computes exit conditions and the reversed
flow graph is used.

Monotone Frameworks
===================

Maximal Fixed Point (MFP) solution
==================================

The worklist algorithm [@Rayside] can be used to compute the least solution to a set of
data flow equations.

Meet Over All Paths (MOP) solution
==================================

It has been proven that the MOP solution cannot be computed for an arbitrary
monotone framework[@Kam].

References
----------

[@Nielson "Nielson, Flemming, Hanne R. Nielson, and Chris Hankin. Principles of program analysis. Springer, 1999. Page 40-50"]: http://www2.imm.dtu.dk/~hrni/PPA/ppa.html
[@Kam "Kam, John B., and Jeffrey D. Ullman. "Monotone data flow analysis frameworks." Acta Informatica 7.3 (1977): 305-317."]: http://download.springer.com/static/pdf/742/art%253A10.1007%252FBF00290339.pdf?auth66=1392462225_8a41583af61c21dd0a5acf990295390a&ext=.pdf
[@Kildall "Kildall, Gary A. "A unified approach to global program optimization." Proceedings of the 1st annual ACM SIGACT-SIGPLAN symposium on Principles of programming languages. ACM, 1973."]: http://dl.acm.org/citation.cfm?id=512945&coll=portal&dl=ACM
[@Rayside "Rayside, Derek, and Kostas Kontogiannis. "A generic worklist algorithm for graph reachability problems in program analysis." Proceedings of the Business and Industry Simulation Symposium. Washington DC [SCS. 2001."]: http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.66.1554&rep=rep1&type=pdf