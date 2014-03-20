Title: V-22 Osprey Crash
Date: 2014-03-19 13:53
Category: III. Lessons from History
Tags: pelican, publishing
Author: David Avedissian
Summary: V-22 Osprey Crash

On 11th December 2000, a V-22 Osprey had a flight control error and crashed,
killing all four people onboard. One of the three hydraulic lines supplying
the tilt-rotor of the aircraft ruptured under pressure. When the line ruptured,
a program signaled the pilot to press the Primary Flight Control System (PFCS)
reset button.

A previously undiscovered error in the aircrafts control software caused it
uncontrollably decelerate in response to the eight attempts to reset the software
as prompted by the PFCS alert. As a result, the aircraft which had been rendered
uncontrollable fell 490m and crashed into a forest.[@Sandra]

The Marine Corps then grounded its entire fleet of eight V-22 Ospreys.

![Osprey](images/osprey.jpg)

Rather than resetting the computer, the software changed the pitch of the rotors.[@NYTimes] 
This was most likely caused by the wrong subroutine being called, which could've
been solved by proper unit testing and static analysis of the code to ensure that
all code paths could be reached and pre/post conditions are met.

References
==========
[@Sandra "Sandra Jontz: Hydraulics problem, software glitch led to fatal Osprey crash"]: http://www.fas.org/man/dod-101/sys/ac/docs/man-ac-v22-010407.htm
[@NYTimes "James Dao: After North Carolina Crash, Marines Ground Osprey Program"]: http://www.nytimes.com/2000/12/13/us/after-north-carolina-crash-marines-ground-osprey-program.html?pagewanted=all