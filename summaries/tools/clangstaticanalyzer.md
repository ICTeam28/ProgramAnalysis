Title: Clang Static Analyzer
Date: 11.03.2014
Category: IV. Tools for Program Analysis
Tags: pelican, publishing
Author: David Avedissian
Summary: Overview of the Clang Static Analyser

Clang is a front-end to the LLVM compiler architecture, which is a modularised
set of libraries used for compiling software. Clang includes a static analyzer
which is designed to detect runtime bugs in C, C++ and Objective-C code. [@Ted]

Features
----------

todo

Usage
----------

The Clang Static Analyzer is designed to run on top of a projects build system.
It is invoked by simply calling `scan-build` and passing it the build invocation
and arguments for the build system, which scan-build will simply pass through.
scan-build works by modifying the compiler specified in the build system (C and
CXX inside a makefile) with a "fake compiler" which invokes the correct one and
performs analysis on the source file being compiled.

An example of a call to scan-build would be:

	scan-build make -j8 install

Example
----------

A simple example is detecting for uninitialised variables:

	#include <stdio.h>
	int main() {
		int a;
		int b;
		int c;

		b = 4; // should be a
		b = 5;

		printf("%d", a + b);
	}

In this case, it is trivial to spot that the variable `a` is uninitialised due
to a typo, but in larger projects this would be much harder to spot. If we
compile this piece of code, we get no errors or warnings so we would expect an
output of 9 when our executable is run. Instead, some random number is displayed
because `a` is uninitialised and is used in the computation inside the print
statement. If we run this instead using scan-build, we get this output:

	$ scan-build clang uninitialised.c
	scan-build: Using '/usr/bin/clang' for static analysis
	uninitialised.c:7:2: warning: Value stored to 'b' is never read
	        b = 4; // should be a
	        ^   ~
	uninitialised.c:10:17: warning: The left operand of '+' is a garbage value
	        printf("%d", a + b);
	                     ~ ^
	2 warnings generated.
	scan-build: 2 bugs found.

Here is another example:

	#include <stdlib.h>
	int main() {
		int* mem = (int*)malloc(sizeof(int));

		if (mem)
			return 1;

		*mem = 1;

		free(mem);
		return 0;
	}

In this piece of code, space for a single int is allocated on the heap and if
that allocation fails then the program will return with an exit code of 1. At
first glance this code looks perfectly fine although there are two issues with
it. Firstly, the condition in the if statement will be true if the memory
allocation HASN'T failed which is opposite to the intended behaviour, this also
causes a memory leak as the memory allocated with malloc isn't feed in this
case. Additionally, if the memory allocation fails, execution of the program
will continue, causing a null pointer to be deferenced. Compiling this code
using scan-build gives this output:

	$ scan-build clang memory_leak.c
	scan-build: Using '/usr/bin/clang' for static analysis
	memory_leak.c:6:10: warning: Potential leak of memory pointed to by 'mem'
	                return 1;
	                       ^
	memory_leak.c:8:7: warning: Dereference of null pointer (loaded from variable 'mem')
	        *mem = 1;
	         ~~~ ^
	2 warnings generated.
	scan-build: 2 bugs found.

As we can see, scan-build has correctly identified both the issues that were
spotted in the code. [@ScanBuild]

References
==========
[@Ted "Ted Kremenek: Finding software bugs with the Clang Static Analyzer"]: http://llvm.org/devmtg/2008-08/Kremenek_StaticAnalyzer.pdf
[@ScanBuild "Scan Build"]: http://clang-analyzer.llvm.org/scan-build.html