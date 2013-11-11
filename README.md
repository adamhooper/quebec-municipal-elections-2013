Election results
================

This web app is composed entirely of flat files. Here is [its published incarnation](mtl-election.s3.amazonaws.com/index.html).

What it does
------------

* Incorporates new results relatively quickly, sending them to the live site.
* Shows the electoral districts on a map:
    * Montreal district shapefiles come from the city.
    * Outside the City of Montreal, we operate on the assumption that Municipal Affairs groups results by Census Subdivision. We use Statistics Canada shapefiles.
* Allows searching for results by postal code. This is hard:
    * We precompute cities' postal code to district IDs, using a list of all voting households.
    * We precompute some Forward Sortation Areas to Census Subdivision IDs, when the FSA is entirely contained within the Census Subdivision.
    * For the rest, we geocode using Google Maps and then find the electoral region ID by searching for the matching polygon with a Fusion Tables query. (This would work in all cases, but we use the above two strategies to avoid hitting our quota.)

What is sent when
-----------------

* A Google Fusion Table holds all electoral regions and their IDs. Users see this map on page load. They also query it when searching for some postal codes outside of Montreal.
* When the user searches for some postal codes outside of Montreal, we send a request to the Google Maps Geocoder (with just the postal code).
* When the user chooses a Montreal district (by clicking or searching by postal code), we request a topojson file to display on top of the Fusion Table.
* When the user chooses a non-Montreal district (by clicking or searching by postal code), we request a topojson file to display on top of the Fusion Table, _and_ we request the election results.

Why certain decisions were made
-------------------------------

The design is the way it is because it provided all features on deadline. It's not the best.

To make it better:

* Montreal election results shouldn't be baked into the JSON. (The municipalities' aren't.) Results should be separate.

How to deploy
-------------

This section assumes you're comfortable with the command-line and typical web development tools.

1. Prerequisites: [NodeJS](http://nodejs.org), [Python 3.x](http://python.org), Bash (the default shell on Mac OS X and most Linux varieties)
2. Node Package Manager dependencies: `npm install -g bower grunt-cli coffee-script`
3. Download the files described in `data/raw/README.md`
4. If you want to re-generate polygons (you don't have to):
    1. Install [GDAL's ogr2ogr](http://trac.osgeo.org/gdal/wiki/DownloadingGdalBinaries).
    2. `data/gen-shapefile.sh` to build `data/processed/polygons/*.json` and `data/processed/tmp/districts.shp`.
    3. `cp data/processed/polygons webapp/app/polygons` to copy the polygons into the web app.
    4. Upload `data/processed/tmp/districts.shp` to a new Google Fusion Tables table.
    5. Publish the Fusion Table, and edit the id in `webapp/app/scripts/main.coffee` to be the one you just published.
5. `data/gen-postal-code-to-district.py` to create `data/processed/district-to-postal-codes.json`, which helps convert from postal code to district. (Why the backwards name? Inverting the lookup table takes fewer bytes; the client will re-generate the original from the inverted one.)
6. `data/gen-montreal-vote-data.py` to create `data/processed/montreal-data.json`, the Montreal election results
7. `data/finalize.py && cp data/processed/data.js webapp/app/scripts/data.js` to put the postal-code data and Montreal election results in a JavaScript file.
8. Edit `webapp/app/scripts/main.coffee` and set a Google API Key you generate yourself. To generate an API Key: go to https://cloud.google.com/console, choose "APIs & auth", "Registered apps" and "Register app".
9. Edit `webapp/app/index.html` and change the Google Analytics ID.
10. Start the webapp locally to test it works:
    1. `cd webapp` (we'll be here for the rest of this step)
    2. `npm install && bower install` to download dependencies (locally)
    3. `grunt server` to run a server locally (it will open in your browser). Press Ctrl-C when satisfied, or leave it running throughout.
11. Add the non-Montreal election results:
    1. `mkdir -p webapp/app/cached-donnees.electionsmunicipales.gouv.qc.ca && cd webapp/app/cached-donnees.electionsmunicipales.gouv.qc.ca` (we'll be here for the rest of this step)
    2. Download all the files: `for uid in $(cat ../../../data/raw/json-list.txt); do echo "$uid..."; curl "http://donnees.electionsmunicipales.gouv.qc.ca/$uid.json?CACHE_BUST=${RANDOM}${RANDOM}" -o "$uid.json" "-#"; sleep 1; done` (or use curl instead of wget)
12. Deploy the server:
    1. `cd webapp && grunt build`
    2. Copy the contents of `webapp/dist` onto any static file server. Point users at the `index.html` file within.
