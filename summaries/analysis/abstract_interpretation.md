Title: Abstract Interpretation
Date: 01.02.2014
Category: I. Static and Dynamic Analysis
Tags: pelican, publishing
Author: Nandor Licker
Summary: Abstract interpretation approximates the values of variables

Abstract interpretation is a form of analysis which tries to infer as much
information as possible about a program without executing it. It was first
described by Patrick Cousot and Radhia Cousot in 1970 [@Cousot].

Example
-------

Let's consider the following C functino:

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
value of some variables.


| Line | Variable    | Sign    | Parity    | Value           |
|:----:|:-----------:|:-------:|:---------:|:---------------:|
| 6    | a           | +       | even      | ?               |
| 9    | a           | -       | odd       | $(-\infty, -1]$ |
| 9    | b           | +       | odd       | $[3, +\infty)$  |
| 10   | c           | ?       | even      | $(-\infty, 2]$  |
| 11   | d           | -       | odd       | $(-\infty, -3]$ |
| 13   | return      | +       | odd       | $[9, +\infty]$  |

Due to the fact that the ranges of certain values can be inferred, an optimising
compiler might detect branches which cannot get executed and eliminate them.
If values of certain parameters are known, some instructions might be replaced
by faster versions which have the same effects. For example, when dividing or
multiplying by 2, the div (89 cycles) or mul (3 cycles) instructions can be
replaced with the shift instruction (1 cycle) [@Agner].


[@Cousot "Abstract interpretation: a unified lattice model for static analysis of programs by construction or approximation of fixpoints"]: http://dl.acm.org/citation.cfm?id=512973
[@Agner "Agner Fog's instruction tables"]: http://www.agner.org/optimize/instruction_tables.pdf