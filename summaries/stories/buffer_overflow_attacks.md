Title: Buffer Overflow Attacks
Date: 2014-03-19 16:28
Category: III. Lessons from History
Tags: pelican, publishing
Author: Ilija Radosavovic
Summary: Buffer Overflow Attacks 


Buffer overflow is an extremely common bug.
First major exploit was 1988 Internet worm,
often called the Morris worm. It was written
by a student, Robert Tapan Morris, and affected 
approximately 6000 computers.[@Commission] Furthermore, 
it resulted in the first conviction in the US under 1986
Computer Fraud and Abuse Act.[@Wiki]

![morris_worm](images/morris_worm.jpg)

Buffer overflow occurs when more data than holding area can 
handle is put into it. Furthermore, it often leads to total
compromise of the host.
   

Consider the following C function:[@Boneh]

    void func(char* str) {
	  char buf[128];

	  strcpy(buf, str);
	  do-something(buf)
    }


When the function is called the stack looks like:

![overflow_before](images/overflow_before.JPG)

However if str\* is 136 bytes long, after *strcpy*, 
the stack looks like:

![overflow_after](images/overflow_after.JPG)

This is caused by the lack of bounds checking
in *strcpy* function.


Some of the unsafe C library functions include:    

+ strcpy(char \*dest, const char \*src)   
+ strcap(char \*dest, const char \*src)   
+ gets(char \*s)     


The main problems is that these functions have no range checking.
One of the possible ways to guard against buffer
overflows is to run Static source code analysis.


References
========================================
[@Boneh "Dan Boneh, CS155 Computer and Network Security 2003, Stanford University"]: http://crypto.stanford.edu/cs155old/cs155-spring03 
[@Wiki "Wikipedia, Morris worm"]: http://en.wikipedia.org/wiki/Morris_worm
[@Commission "Ted Eisenberg, Cornel Commission findings, 1989, Cornell University"]: http://www.cs.cornell.edu/courses/cs1110/2009sp/assignments/a1/p706-eisenberg.pdf 
