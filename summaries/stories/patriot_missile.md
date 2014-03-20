Title: Patriot Missile System
Date: 2014-03-16 07:26
Category: III. Lessons from History
Tags: pelican, publishing
Author: Ilija Radosavovic
Summary: Patriot Missile System

The Patriot Missile system was a surface-to-air system used by the United States army,
originally designed to protect against Soviet cruise missiles and medium to high attitude
aircraft. During the Gulf War in the early 1990's it was used in the Operation Desert Storm
as a part of the Patriot missile air defence system. Patriot battalions were placed in
strategic positions in order to defend military personnel and citizens against Scud missiles
launched by Iraqi forces.[@Lum]

![PatriotSystem](images/Patriot_missile_launch_b.jpg)

Patriots weapon control computer operates in several stages:
1. Based on information such as velocity, longitude and latitude system searches for objects with Scud missile characteristics on its radar.
2. The missile is tracked by the system as it approaches and a range gate calculates an area in the air where the system should look next for the incoming missile.
3. Once the incoming missile is in range, the Patriot system launches one of its own missiles.

The following figure shows correctly calculated range area:

![PatriotCorrect](images/patriot_correct.gif)

In February of 1991, the Israeli troops had discovered that if system runs for too long, it becomes inaccurate.
After the Patriot System has been in operation for more than 8 consecutive hours, system's radar range gate shifts by significant 20%:

![Patriot8h](images/patriot_8h.gif)

After 20 hours of continuous use, the inaccurate time calculation becomes sufficiently large to cause the radar to look for the target in the wrong place:

![PatriotIncorrect](images/patriot_incorrect.gif)

On February 25th 1991, at Dhahran, the system had been running for over 100 hours and had failed to intercept an incoming SCUD missile.
The SCUD missile hit an army barracks, which resulted in deaths of 28 people.

This was caused by a software rounding error, which led to miscalculation of interception range.
The prediction was calculated based on the targets velocity and the time of the last radar detection.
The algorithm used to predict the next interception range, required velocity and time to be stored as real numbers.
Since the system only has 24 bit fixed point registers and the time was measured as the number of tenth seconds,
the value 1/10, which has a non-terminating binary expansion, was chopped at 24 bits after the radix point.
The small chopping error, when multiplied by the large number giving the time in tenths of a second, led to a significant error. [@Douglas]


References
========================================
[@Morgan "Tom Morgan and Jason Roberts, 2010, An analysis of the patriot missile system"]: http://seeri.etsu.edu/SECodeCases/ethicsC/patriotmissile.htm#_ftn3
[@Lum "Andrew Lum, Patriot missile software problem"]: http://sydney.edu.au/engineering/it/~alum/patriot_bug.html
[@Wiki "Wikipedia, MIM-104 Patriot"]: http://en.wikipedia.org/wiki/MIM-104_Patriot
[@Douglas "Arnold Douglas, Two Disasters caused by Computer Arithmetic Errors"]: http://www.ima.umn.edu/~arnold/455.f96/disasters.html

