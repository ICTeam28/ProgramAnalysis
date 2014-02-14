Title: Example page
Date: 2014-01-27 21:00
Category: Analysis
Tags: pelican, publishing
Slug: static-analysis-is-the-bomb
Author: Nic Prettejohn
Summary: Static Analysis

This is an example post demonstrating how to write new content and summaries.

Some things to remember:
 * Use cool markdown features.
 * You can *emphasise* things if you like.
 * But the main structuring is left to the layout program of the static site 
generator.

Images go in theme/static/images

Covers go in theme/static/images/cover and must be in jpg format.

Give references a reference ID using the at sign @ as a prefix for the 
identifier.
When the website is compiled an extension will look for these ids and
substitute in the correct markdown to make the references look nice in HTML.

This saves having to number them all manually and worry about formatting.

Johnson [@Johnson2006] didn't agree with ...


Be sure to do citations!
========================
I learned that all frogs are actually toads. [@a]

Don't forget all the vital meta-data at the top of the page.

Reference links do not have to numbered or even put in the correct order - 
this is done at compile time.


[@a]: http://google.com/?q=Frogs+Are+Toads
Reference links must be the last thing on the page. Any content inbetween
 links will not appear in the compiled page.

Try to refernece a particular section of the page where possible. Do this
within quotes as below and it will be included next to a link to the reference
wikipedia style!

[@Johnson2006 "Page 6, section 2"]: http://dx.doi.org/10.1002/aris.201
