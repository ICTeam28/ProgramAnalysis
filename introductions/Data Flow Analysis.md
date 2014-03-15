Data Flow Analysis is used to gather information about the variables and
expressions present in a program. Most forms of data flow analysis use the
control flow graph to follow the propagation of information in a program and
set up a system of equations which is then typically solved using the worklist
algorithm[<sup>[ref]</sup>](http://dl.acm.org/citation.cfm?id=512945) or chaotic
iteration.

The solutions of these systems can be used to perform various types
of optimisations, such as dead variable removal, code hoisting and constant
folding[<sup>[ref]</sup>](http://gcc.gnu.org/news/ssa-ccp.html). Data flow
analysis does not always yield optimal solutions, but the results are sound and
can be used in optimising compilers.