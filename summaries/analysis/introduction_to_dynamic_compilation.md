Title: Introduction to Dynamic Compilation
Date: 2014-03-17
Category: I Static and Dynamic Analysis
Tags: pelican, publishing
Author: Nic Prettejohn
Summary: Dynamic Compilation - Just In Time Compilation

There are typically two approaches to executing code: Compilation and 
interpretation.


Compilation
===========
A set of languages are referred to as *Compiled languages* if they rely on
compilation before execution. The source code, written in a higher level
language such as C, is compiled once to architecture-specific machine code.
The program can then be run an arbitrary number of times without having to
recompile the original source code.[@JITBriefHistory]


Interpretation
==============
"Interpreted Languages" are programming languages where blocks of the source
code are compiled and then executed immediately. Such languages are normally
compiled to an intermediatry "byte-code" - platform independent instructions
for the interpreter - to improve the execution performance.[@JITBriefHistory]


Advantages of each approach
===========================
Compiled langauges' main benefits lie in performance - both memory and speed. Through compiling the
entire program in one go, the compiler can devote as much time and memory as necessary to
analyse the program and make optimisations. However, small changes in the
program source code can require recompilation of the entire program - a
process which grows exponentially with code complexity.

Programs written in interpreted languages tend to be more portable. The source
code can be executed on any platform that supports the interpreter. As the
languages are compiled at run-time, they also have access to platform specific
information and can optimise for the execution environment. However, because
the code is being compiled on-the-fly, the compiler cannot devote arbtitrary
resources to produce the most performant execution from the source code.
[@JITBriefHistory]


Dynamic Compilation (Just-In-Time Compilation)
==============================================
Dynamic Compilation or Just-In-Time (JIT) Compilation aims to combine both
approaches to utilise the benefits of both. As compilation is an expensive
process, Just-In-Time compilers seek to compile loops where the time gained
from increased efficiency outweighs the time spent compiling the byte-code to
machine code.[@JITBriefHistory]


Tracing JIT
===========
A tracing Just-In-Time compiler records sequences of operations as they're
executed as a linked-list. The operations are then optimised and turned into
machine code specific for the platform the code is running on.

Due to the expensive nature of compiling byte-code to machine code, the JIT
will seek to maximise the performance benefit by compiling frequently executed
loops.

These traces correspond to a particular execution of the program, and as a
consequence cannot contain any control flow splits - such as a conditional branch. 
Control flow decisions must be encoded as "Guard" expressions in the trace so the JIT can fall-back
to the interpreter in cases where the guards for the expression aren't met.

In the example below, one can see how expressions and control-flow decisions
are encoded for the JIT compiler. In the case that the guard fails, the
JIT defers to the interpreter for execution.[@JITHints]

```
if x == 4:              |  guard(x1 == 4)
    y = y + x           |  y2 = y1 + x1
```


Performance Improvements
========================
Compiling frequently executed loops to native machine code results in dramatic
improvements in runtime performance.

To take LuaJIT as an example, it showed 134.71x improvement over the standard
Lua Interpreter. Lua is a lightweight, fast extensible scripting language 
implemented in C.[@LuaJIT]

| <center>Benchmark</center> | <center>N</center>| <center>Ratio</center>|
|:--------------:|:--------:|:------:|
| md5	         | 20000    | 134.71 |
| array3d	     | 300      | 91.96  |
| euler14-bit    | 2e7	    | 66.26	 |
| mandelbrot-bit | 5000     | 63.97	 |
| scimark-lu	 | 5000     | 54.14	 |
| scimark-sor	 | 50000    | 42.82	 |
| nsieve-bit     |  12      | 41.25	 |

LuaJIT shows a 134x improvement over the traditional Lua interpreter for
computing MD5 hashes, a truly incredibly speed improvement achieved by
compiling the many loops in the md5 hashing algorithm to native code.[@MD5RFC]

References
==========

[@JITBriefHistory "A Brief History of Just-In-Time"]: http://dl.acm.org/citation.cfm?id=857077
[@JITHints "Runtime Feedback in a Meta-Tracing JIT for Efficient Dynamic Languages"]: https://bitbucket.org/pypy/extradoc/raw/extradoc/talk/icooolps2011/jit-hints.pdf
[@LuaJIT "LuaJIT Performance Benchmarks"]: http://luajit.org/performance_x86.html
[@MD5RFC "Request for Comment: The MD5 Message-Digest Algorithm"]: http://tools.ietf.org/html/rfc1321
