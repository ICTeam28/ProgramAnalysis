Title: Astree
Date: 11.03.2014
Category: IV. Tools for Program Analysis
Tags: pelican, publishing
Author: Nandor Licker
Summary: Astree is a static analyser based on abstract interpretation

Astree is a static analyser based on Abstract Interpretation. It analyses C
programs written mainly for embedded systems and checks for runtime errors.
The developers of the project claim that Astree is sound (it can detect all the
possible runtime errors) and automatic (requires no additional annotations to
the source code). However, the rate of false positives is quite high (10-20% of
the statements). It is also one of the few static analysers which can
efficiently scale up to the size of real-world applications which span hundreds
of thousands of lines of code. [@Astree]

The tool mostly checks for undefined behaviour in C programs. Undefined
behaviour is supposed to be a *feature* of C, but it is the cause of some really
exotic errors. Unlike other languages, C does not do any runtime checks before
deferencing pointer and does not check for integer overflows. This makes it
possible to generate faster code and build better optimising compilers, but it
can also lead to runtime errors. Astree was designed to check for most of
the scenarios where undefined behaviour might occur and also verify
user-provided assertions.

Errors reported by Astree include:

* Division by zero
* Indices out of bounds
* Null pointer dereferencing
* Arithmetic overflows
* Unitialised variables
* Unreachable code

Astree was used by Airbus to prove the absence of runtime errors in the flight
control systems of the A340 and A380 models. Having learnt from the failure of
the first Ariane 5, Astree was also used to test the docking system of the
*Jules Verne* Automated Transfer Vehicle. [@Airbus]

References
----------

[@Astree "The Astree Static Analyzer"]: http://www.astree.ens.fr/
[@Airbus "Success stories"]: http://www.absint.com/astree/index.htm