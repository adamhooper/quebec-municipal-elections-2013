* media.xml: demo sent from Je Vote Pour Ma Ville
* DistrictElect.zip: from http://www.donnees.gouv.qc.ca/
* elections-2013-section-vote-par-adresse.zip: from http://donnees.ville.montreal.qc.ca/dataset/elections-2013-section-vote-par-adresse/resource/d0be2e73-2554-47cc-a081-81b6c75b6011
* gcsd000b11a_e.zip: from http://www12.statcan.gc.ca/census-recensement/2011/geo/bound-limit/bound-limit-2011-eng.cfm: "Cartographic Boundary File", "ArcGIS", "English"
* fsa-to-csduid.csv: hand-made (see below)

fsa-to-csduid.csv
-----------------

The problem: we want postal-code lookups to be fast and not quota-encumbered.

Solution: cache a mapping of postal code -> electoral region and use that instead of a web service. Outside of Montreal, electoral regions correspond with StatCan Census Subdivisions.

The problem with that: postal codes are copyrighted by Canada Post. The only public data is Forward Sortation Areas, published by StatCan (at the URL above).

Solution: cache whenever a FSA lies entirely within a CSD.

The query looks like this:

```sql
-- '24' is the PRUID for Quebec. It's also the prefix of all CSDs within Quebec.
-- '2466023' is the CSDUID for Montreal. We exclude it.
WITH
  fsas AS (SELECT wkb_geometry, ST_Area(wkb_geometry) AS area, cfsauid AS fsa FROM gfsa000b11a_e WHERE pruid = '24'),
  csds AS (SELECT wkb_geometry, ST_Area(wkb_geometry) AS area, csduid AS csd FROM gcsd000b11a_e WHERE pruid = '24' AND csduid <> '2466023'),
  fsa_csd_overlaps AS (
    SELECT
      fsas.fsa,
      csds.csd,
      fsas.area AS fsa_area,
      csds.area AS csd_area,
      ST_Area(ST_Intersection(fsas.wkb_geometry, csds.wkb_geometry)) AS shared_area
    FROM fsas
    INNER JOIN csds ON ST_Intersects(csds.wkb_geometry, fsas.wkb_geometry)
  )
SELECT
  fsa,
  csd,
  (shared_area / fsa_area * 100) AS percent
FROM fsa_csd_overlaps
WHERE shared_area / fsa_area > 0.99
```
