Title: Code Hoisting
Date: 2014-03-15 03:37
Category: II. Data Flow Analysis
Tags: pelican, publishing
Tags: pelican, publishing
Author: Ilija Radosavovic
Summary: Code Hoisting

*Code Hoisting* reduces he size of the program by moving duplicated expression computations to the same place,
where they can be combined into a single instruction. [@Mycroft]

*Code Hoisting* relies on [Very Busy Expressions Analysis](very-busy-expressions.html) which for a program point determines
which expressions are going to be evaluated later in the program no matter which path is taken.
Thus, in order to reduce the size of the code generated for the program, we can evaluate these expressions
at the end of the block and store their values for later use in the program.

Consider the following diagram:

![Pre](images/HoistingPre.png)

By precomputing $\\{a-b\\}$ and $\\{b-a\\}$ and moving them to the earlier block, we get:

![Pre](images/HoistingPost.png)

However, depending on the nature of the program *hoisting* can have different effects on execution time,
and does not guarantee improvements in terms of speed. Thus, the resulting program may be of the same speed as
before or even slower.





References
========================================
[@Mycroft "Alan Mycroft, 2010-2011, Optimising Compilers, Cambridge University Computer Laboratory"]: http://www.cl.cam.ac.uk/teaching/1011/OptComp/slides/lecture07.pdf

