Title: Ariane-5 Rocket
Date: 2014-03-16 07:26
Category: III. Lessons from History
Tags: pelican, publishing
Author: Ilija Radosavovic
Summary: Ariane 5

Ariane 5 is, as part of Ariane rocket family, an expendable launch system used
to deliver payloads into geostationary transfer orbit or Low Earth orbit. 
Ariane 5 succeeded Ariane 4, but was not derived from it directly. 
Development process took ten years and costed $7 bilion.[@Wiki]
     
     
![ariane5_launch](../images/ariane5_launch.jpg)
     
     
On 4 June 1996,the maiden flight of the Ariane 5 launcher ended in a failure.
About forty seconds after initiation of the flight the launcher veered off 
its flight path and exploaded. The destroyed rocket and the cargo were valued
at $500 million.[3]
      
      
![ariane5_explode](../images/ariane5_explode.jpg)    
     
     
A board of inquiry investigated the causes of the explosion and issued a report.[@Board]
It turned out that the technical cause of the failure was the operand error in the inertial
reference system. Namely a 64 bit floating point number, relating to the horizontal
velocity of the rocket with respect to the platform, was converted to a 16 bit signed
integer.[@Douglas] The floating point number that was converted had a value grater
than the 32768, the maximal value that could be represented using 16 bits, thus
the conversion failed. Furthermore, since the backup system was running the same
software, it could not prevent the failure. 




References
========================================
[@Wiki "Wikipedia, Ariane 5"]: http://en.wikipedia.org/wiki/Ariane_5
[@Board "Inquiry Board, Ariane 5 Flight 501 Failure"]: http://www.ima.umn.edu/~arnold/disasters/ariane5rep.html
[@Douglas "Arnold Douglas, Two Disasters caused by Computer Arithmetic Errors"]: http://www.ima.umn.edu/~arnold/455.f96/disasters.html

