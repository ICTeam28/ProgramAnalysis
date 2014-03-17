Title: GPUVerify
Date: 11.03.2014
Category: IV. Tools for Program Analysis
Tags: pelican, publishing
Author: Nandor Licker
Summary: GPU Verify - formal analysis of GPU Kernels

GPUVerify is a tools which can analyze GPU kernels written in OpenCL or CUDA
and can check for the presence of race conditions or invalid use of memory
barriers. Internally, it converts the OpenCL or CUDA kernels into the *Boogie*
language. *Boogie* is a project developed by Microsoft that can automatically
generate verification conditions and invariants, which are solved using a
theorem prover (Z3 by default). Besides the automatically generated invariants,
GPUVerify allows programmers to specify their own assertions and invariants. [@GPUVerify] [@Boogie] [@Z3]

We are going to use GPUVerify to test and fix a small OpenCL kernel which should
multiply two matrices, but fails to produce correct results.

Race conditions
---------------

Multiplying two matrices together is a common task in computer science, so
we have tried to implement the operation on the GPU. The first implementation
we are going to present contains an obvious mistake: the product of two elements
from A and B is added to an element in matrix C  without synchronisation.
We could have *k* threads trying to increment the same variable at the same
time, generating incorrect results.

This is a classic issue in concurrent programming: when two or more threads try
to increment a shared variable, they might both read in the same value, i
ncrement it and write back a wrong value: instead of computing a + 2, they
would store a + 1 in memory.

In the following example, we assume that the initial value of variable A is 5
and we illustrate what happens when two threads increment the same variable:

| <center>Thread #0</ccenter> | <center>Thread #1</center> | A | a | a' |
|:---------------------------:|:--------------------------:|:-:|:-:|:--:|
| read a = A                  |                            | 5 | 5 |  - |
| increment a                 | read a' = A                | 5 | 6 | 5  |
| write A = a                 | increment a'               | 6 | 6 | 6  |
|                             | write A = a                | 6 | 6 | 6  |

In the end, the value of A will be 6 due to the unfortunate scheduling of
operations and lack of synchronisation.

The following piece of OpenCL code suffers from the issue presented earlier:

    /**
     * Multiplies two matrices together.
     * @note Matrices are stored in memory in row-major order.
     *
     * @param n     Number of rows of A
     * @param m     Number of columns of A & rows of B
     * @param p     Number of columns of B
     * @param matA  Input matrix of size n x m
     * @param matB  Input matrix of size m x p
     * @param matC  Output matrix of size n x p
     */
    __kernel void matrixMultBad( int n
                               , int m
                               , int p
                               , __global __read_only   long *matA
                               , __global __read_only   long *matB
                               , __global __write_only  long *matC
                               )
    {
      int i = get_local_id(0);
      int j = get_local_id(1);
      int k = get_local_id(2);

      // Bad, bad code!
      matC[i * p + j] += matA[i * m + k] * matB[k * p + j];
    }

We ran GPUVerify on the kernel:

    gpuverify --local_size=[8,8,8] --global_size=[512,512,512] multiply.cl


And it immediately detected that multiple threads might attempt to increment
the same variable:

    add.cl: error: possible write-write race on ((char*)matC)[0]:

    Write by work item (1, 0) in work group (0, 0), add.cl:25:3:
      matC[i * p + j] += matA[i * m + k] * matB[k * p + j];

    Write by work item (0, 0) in work group (1, 1), add.cl:25:3:
      matC[i * p + j] += matA[i * m + k] * matB[k * p + j];

    Bitwise values of parameters of 'matrixMult':
      n = <irrelevant>
      m = <irrelevant>
      p = 0

Atomic operations
-----------------

The fastest solution to this problem is to use atomic operations. Atomic
operations are a bit slower than the unsynchronised ones, but they are still
faster than mutexes or semaphores. On most platforms, they are implemented using
an instruction similar to CMPXCHG [@Intel] - CoMPare and eXCHanGe (or atomic_xchg
in OpenCL[@AtomicXCHG]). Compare and exchange usually works with three parameters:
a memory location, an old value and a new value. It reads in the value from the
memory location and compares it with the old value. If they are equal, the new
value is written to memory. To implement atomic addition, one has to read in the
value from memory, increment it and then use CMPXCHG to update the variable. If
the comparison fails, it means that another thread managed to increment the
variable first, so the current thread has to try again by incrementing the
updated value. If the comparison succeds, it means that no other threads
accessed the memory location and we can safely store the new value.

The following is an example on how atomic addition could be implemented on
an Intel CPU, using the lock prefix to guarantee atomicity: [@AtomicADD]

      ; void atomic_add(int64_t *ptr, int64_t val)
      atomic_add:
          push          rbp
          mov           rbp, rsp

          push          rbx
          push          rcx
          push          rdx

          mov           rbx, [rbp + 16]
          mov           rcx, [rbp + 24]
          mov           rax, [rbx]       ; read value from memory

      .loop:
          lea           rdx, [rax + rcx] ; compute incremented value
          lock cmpxchg  [rbx], rdx       ; try doing the swap
          jnz           .loop            ; if comparison fails, repeat

          pop           rdx
          pop           rcx
          pop           rbx

          ret                            ; initial value is returned in rax

Working example
---------------

We have replaced the normal addition with atomic addition:

    /**
     * Multiplies two matrices together.
     * @note Matrices are stored in memory in row-major order.
     *
     * @param n     Number of rows of A
     * @param m     Number of columns of A & rows of B
     * @param p     Number of columns of B
     * @param matA  Input matrix of size n x m
     * @param matB  Input matrix of size m x p
     * @param matC  Output matrix of size n x p
     */
    __kernel void matrixMultOkay( int n
                                , int m
                                , int p
                                , __global __read_only   int *matA
                                , __global __read_only   int *matB
                                , __global __write_only  int *matC
                                )
    {
      int i = get_local_id(0);
      int j = get_local_id(1);
      int k = get_local_id(2);

      atomic_add(&matC[i * p + j], matA[i * m + k] * matB[k * p + j]);
    }

GPUVerify found no problems with the code this time. Although this implementation
seems to be correct, it is far away from being efficient.

    GPUVerify kernel analyser finished with 1 verified, 0 errors
    Verified: add.cl
    - no data races within work groups
    - no data races between work groups
    - no barrier divergence
    - no assertion failures
    (but absolutely no warranty provided)

The complete source code for the examples can be found [here](https://gist.github.com/nandor/9605717).

References
----------

[@GPUVerify "GPUVerify homepage"]: http://multicore.doc.ic.ac.uk/tools/GPUVerify/
[@Boogie "Boogie: A Modular Reusable Verifier for Object-Oriented Programs"]: http://link.springer.com/chapter/10.1007/11804192_17
[@Z3 "Z3: An Effiecient SMT Solver"]: http://link.springer.com/chapter/10.1007/978-3-540-78800-3_24#page-1
[@Intel "Intel 64 and IA-32 Architectures Software Developer Manuals"]: http://www.intel.com/content/www/us/en/processors/architectures-software-developer-manuals.html
[@AtomicXCHG "atomic_cmpxchg"]: http://www.khronos.org/registry/cl/sdk/1.2/docs/man/xhtml/atomic_cmpxchg.html
[@AtomicADD "atomic_add"]: http://www.khronos.org/registry/cl/sdk/1.1/docs/man/xhtml/atomic_add.html
