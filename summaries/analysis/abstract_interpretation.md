Title: Abstract Interpretation
Date: 03.02.2014
Category: I Static and Dynamic Analysis
Tags: pelican, publishing
Author: Nandor Licker
Summary: Abstract interpretation - the french method

Abstract interpretation (*AI*) is a form of program analysis based on semantics
which tries to infer as much information as possible about a program without
executing it. *AI* was first introduced by Patrick Cousot and Radhia Cousot in
1970. It makes use of a large number of concepts from set theory, such as
partially ordered sets, complete lattices and Galois connections.  [@Cousot]

*AI* operates over abstract domains (complete lattices), such as parity, sign,
constant propagation, congruences and intervals. It usually overapproximates
properties, meaning that it considers the largest possible domain for the value
of a variable over an abstract domain.

A well-known static analyser to use Abstract Interpretation is **Astrée**, which
was use to prove the correctness of the control software of the Airbus A340,
A380 and the European Space Agency's ATV docking system. [@Astree]

Concrete Example
----------------

Let's consider the following C functions:

     1.  int test(int a)
     2.  {
     3.    int b, c, d;
     4.
     5.    if (a > 0 || (a % 2) == 0) {
     6.      return 5;
     7.    }
     8.
     9.    b = -a + 2;
    10.    c = a + 3;
    11.    d = -b;
    12.
    13.    return b * (a - 2);
    14.  }

By analysing the source code, we can infer the parity, sign and possibly the
interval of some variables.


| Line | Variable    | Sign    | Parity    | Interval        |
|:----:|:-----------:|:-------:|:---------:|:---------------:|
| 6    | a           | +       | even      | ?               |
| 9    | a           | -       | odd       | $(-\infty, -1]$ |
| 9    | b           | +       | odd       | $[3, +\infty)$  |
| 10   | c           | ?       | even      | $(-\infty, 2]$  |
| 11   | d           | -       | odd       | $(-\infty, -3]$ |
| 13   | return      | +       | odd       | $[9, +\infty]$  |

Applications
------------

Due to the fact that the ranges of certain values can be inferred, an optimising
compiler might detect branches which cannot get executed and eliminate them.
If values of certain parameters are known, some instructions might be replaced
by faster versions which have the same effects. For example:

* When dividing or multiplying by 2, the div (89 cycles) or mul (3 cycles)
  instructions can be replaced with the shift instruction (1 cycle) [@Agner].
* If the truth value of a branch condition can be inferred, one of the branches
  can be eliminated.
* If the truth value of a loop condition can be inferred, the loop can be
  unrolled or eliminated.

[@Cousot "Abstract interpretation: a unified lattice model for static analysis of programs by construction or approximation of fixpoints"]: http://dl.acm.org/citation.cfm?id=512973
[@Agner "Agner Fog's instruction tables"]: http://www.agner.org/optimize/instruction_tables.pdf
[@Astree "The Astree Static Analyzer"]: http://www.astree.ens.fr/