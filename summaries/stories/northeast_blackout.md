Title: Northeast Blackout of 2003
Date: 2014-02-28 17:36
Category: III Lessons from History
Tags: pelican, publishing
Author: David Avedissian
Summary: Northeast Blackout of 2003

The Northeast Blackout of 2003 was a widespread power outage that occured on
Thursday, August 14 2003. It affected parts of Northeastern United States and
Ontario, Canada.

![Blackout](images/blackout.png)

The root cause of the blackout was a race condition which existed in GE Energy's
energy managment system XA/21, which was based on Unix.[@SecurityFocus] Once the
race condition was triggered, it caused the control room alarm system to stall
for over an hour.

After the alarm system was stalled, events were not being processed and subsequently
became queued up, causing the primary server to fail within 30 minutes. Once the
primary server failed, all applications were transferred to the back-up server,
which ended up failing because of the same exact race condition that plagued the
primary server. The server failures caused a slowdown of the refresh rate of the
operators' consoles to a minute per screen compared to the usual 1-3 seconds.[@Harvard]

There were at least eleven fatalities which had a connection to the blackout, which
would have been easily preventable had there been proper checks of the software before
being deployed. Static analysis of the program code would have caught the race
condition and allowed GE Energy to fix the problem.

References
==========
[@SecurityFocus "Software Bug Contributed to Blackout"]: http://www.securityfocus.com/news/8016
[@Harvard "Interim Report on the August 14, 2003 Blackout"]: http://www.hks.harvard.edu/hepg/Papers/NYISO.blackout.report.8.Jan.04.pdf
[@Image "Areas affected by blackout"]: http://en.wikipedia.org/wiki/File:Map_of_North_America,_blackout_2003.svg