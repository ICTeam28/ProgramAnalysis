Title: Ariane 5 rocket
Date: 2014-03-16 07:26
Category: III. Lessons from History
Tags: pelican, publishing
Author: Ilija Radosavovic
Summary: Ariane 5

Ariane 5 is, as part of Ariane rocket family, an expendable launch system used
to deliver payloads into geostationary transfer orbit (GTO) or low Earth orbit
(LEO). Ariane 5 is the successor the Ariane 4 and can carry up to 21.000kg of
cargo to LEO or up to 10.500kg to GTO, more than twice as much as its
predecessor. Due to the fact that the flight control software for Ariane 4 was
well-tested, it was decided that Ariane 5 should reuse code taken from the
Ariane 4. Development process took ten years and cost $7 bilion. [@Wiki]

![ariane5_launch](images/ariane5_launch.jpg)

On 4 June 1996, the maiden flight of the Ariane 5 launcher, carrying *Cluster*,
a constellation of four sattelites, ended in failure. About forty seconds after
liftoff, of the the launcher veered 90 degrees off its intended flight path and
blew up. The destroyed rocket and the cargo were valued at $500 million.


![ariane5_explode](images/ariane5_explode.jpg)


A board of inquiry investigated the causes of the explosion and issued a report.
[@Board] It turned out that the technical cause of the failure was an operand
error in the inertial reference system. Namely a 64 bit number, relating to the
horizontal velocity of the rocket with respect to the platform, was converted to
a 16 bit signed integer.[@Douglas] The floating point number that was converted
had a value grater than the 32 768, the maximal value that could be represented
using 16 bits, thus the conversion failed. Furthermore, since the backup system
was running the same software, it could not prevent the failure.

The Ada code, which caused the operand error: [@JJLevy]

    -- Overflow is correctly handled for the vertical component
    L_M_BV_32 := TBD.T_ENTIER_16S((1.0 / C_M_LSB_BH) *
                                       G_M_INFO_DERIVE(T_ALG.E_BH));
    if L_M_BV_32 > 32767 then
     P_M_DERIVE(T_ALG.E_BV) := 16#7FFF#;
    elseif L_M_BV_32 < -32768 then
     P_M_DERIVE(T_ALG.E_BV) := 16#8000#;
    else
     P_M_DERIVE(T_ALG.E_BV) := UC_16S_EN_16NS(TBD.T_ENTIER_16S(L_M_BV_32));
    end if;

    -- But not for the horizontal one
    P_M_DERIVE(T_ALG.E_BH) := UC_16S_EN_16NS(TBD.T_ENTIER_16S
                                       ((1.0 / C_M_LSB_BH) *
                                       G_M_INFO_DERIVE(T_ALG.E_BH));

The code originated from the Ariane 4 launcher. It can be seen that the
value for vertical acceleration is clamped to 16 bits (0x8000 - 0x7ffff).
Due to the fact that the flight trajectory for the Ariane 4 was different that
the trajectory for Ariane 5, its horizontal acceleration was much lower and the
value fit into 16 bits. When the code was adapted, programmers forgot to clamp
the horizontal value to the correct range. The code was fixed by adding only
a few lines of code:


    L_M_BV_32 := TBD.T_ENTIER_16S((1.0 / C_M_LSB_BH) *
                                       G_M_INFO_DERIVE(T_ALG.E_BH));
    if L_M_BV_32 > 32767 then
     P_M_DERIVE(T_ALG.E_BV) := 16#7FFF#;
    elseif L_M_BV_32 < -32768 then
     P_M_DERIVE(T_ALG.E_BV) := 16#8000#;
    else
     P_M_DERIVE(T_ALG.E_BV) := UC_16S_EN_16NS(TBD.T_ENTIER_16S(L_M_BV_32));
    end if;

    -- Fixed code, vertical and horizontal components are treated the same way
    L_M_BH_32 := TBD.T_ENTIER_16S((1.0 / C_M_LSB_BH) *
                                       G_M_INFO_DERIVE(T_ALG.E_BH));
    if L_M_BH_32 > 32767 then
     P_M_DERIVE(T_ALG.E_BH) := 16#7FFF#;
    elseif L_M_BH_32 < -32768 then
     P_M_DERIVE(T_ALG.E_BH) := 16#8000#;
    else
     P_M_DERIVE(T_ALG.E_BH) := UC_16S_EN_16NS(TBD.T_ENTIER_16S(L_M_BH_32));
    end if;


References
========================================
[@Wiki "Wikipedia, Ariane 5"]: http://en.wikipedia.org/wiki/Ariane_5
[@Board "Inquiry Board, Ariane 5 Flight 501 Failure"]: http://www.ima.umn.edu/~arnold/disasters/ariane5rep.html
[@Douglas "Arnold Douglas, Two Disasters caused by Computer Arithmetic Errors"]: http://www.ima.umn.edu/~arnold/455.f96/disasters.html
[@JJLevy "Jean-Jacques Levy: Small bug, large boom!"]: http://moscova.inria.fr/~levy/talks/10enslongo/enslongo.pdf
