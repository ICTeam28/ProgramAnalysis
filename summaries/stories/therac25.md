Title: Therac 25 Radiation Disaster
Date: 2014-03-01 15:08
Category: III Lessons from History
Tags: pelican, publishing
Author: David Avedissian
Summary: Therac 25

The Therac-25 was a computer-controlled linear accelerator used for radiation
therapy produced by Atomic Energy of Canada Limited (AECL). Medical linear accelerators
accelerate electrons to create high-energy beams used to treat tumours with minimal
impact to surrounding tissue. To reach deeper tissue, an X-Ray beam is directed at the
tumour instead which penetrates tissue further than accelerated electrons. [@Leveson]

In the 1970s, AECL worked with a French company called CGR and developed a number of
linear accelerators together. In co-operation they developed the Therac-6 and Therac-20, predecessors of the Therac-25. Software functionality in both machines was limited
and safety mechanics were retained in the hardware.

The Therac-25 was designed to be much more compact and efficient which meant that most
of the hardware safety features and interlocks were instead implemented with software.

![Therac25](images/therac25.jpg "http://1.bp.blogspot.com/_EVf-pfwip2k/TDLaHtDmRgI/AAAAAAAAAGM/me4FE4TiceM/s1600/thumb-21367-radiation_therapy.JPG")

<!-- What went wrong? -->

Between June 1985 and January 1987, a number of patients were killed or seriously
injured as a result of a software bug which caused the machine to deliver fatal
overdoses of radiation.[@Muffy] The accidents occurred when patients were struck with a
high energy electron beam instead of the intended low power beam, and without a beam
spreader plate placed in the correct spot. Previous models had hardware interlocks in
place to prevent this but the Therac-25 had removed them.

Due to a program error, the software interlock could fail due to a race condition. A one
byte counter frequently overflowed and if an operator entered input at exactly the moment
when the counter overflowed, the software interlock would fail to intervene.[@Wiki]

![Therac25Diagram](images/therac25-diagram.png "http://radonc.wikidot.com/localfiles/radiation-accident-therac25/Therac25.png")

<!-- Lessons -->

A lesson to be learned from the incident is to not assume that reused software is
safe in critical programs where lives are at stake. Leveson notes that "A naive assumption is often made that reusing software or using commercial off-the-shelf software will increase safety because the software will have been exercised extensively. Reusing software modules does not guarantee safety in the new system to which they are transferred..."[@Leveson]

References
==========
[@Muffy "The Story of the Therac-25 in LOTOS"]: http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.298.4751&rep=rep1&type=pdf
[@Wiki "Wikipedia - Therac-25"]: http://en.wikipedia.org/wiki/Therac-25
[@Leveson "Medical Devices: The Therac-25"]: http://sunnyday.mit.edu/papers/therac.pdf
