#!/bin/sh

DIR=`dirname $0`
RAW_DIR="$DIR/../raw"

TEMP_DIR="$DIR/tmp"

mkdir -p "$TEMP_DIR"
#
#unzip -n "$RAW_DIR/gcsd000b11a_e.zip" -d "$TEMP_DIR"
#unzip -n "$RAW_DIR/districtelect.zip" -d "$TEMP_DIR"
#
#rm -f "$TEMP_DIR/districts.*"
#
## Filter out non-QC subdivisions
## Only select CSDUID, to avoid encoding errors with topojson. And skip Montreal!
#echo "Subdivisions..."
#ogr2ogr \
#  -progress \
#  -overwrite \
#  -t_srs 'EPSG:4326' \
#  -sql "SELECT CSDUID AS id FROM gcsd000b11a_e WHERE PRUID = '24' AND CSDUID <> '2466023'" \
#  "$TEMP_DIR/districts.shp" "$TEMP_DIR/gcsd000b11a_e.shp"
#
#echo "Districts..."
#ogr2ogr \
#  -progress \
#  -update -append \
#  -t_srs 'EPSG:4326' \
#  -sql 'SELECT NUM_DISTRI AS id FROM DistrictElect' \
#  "$TEMP_DIR/districts.shp" "$TEMP_DIR/DistrictElect.shp"
#
#echo "Converting to GeoJSON..."
#ogr2ogr \
#  -f "GeoJSON" \
#  "$TEMP_DIR/districts.json" "$TEMP_DIR/districts.shp"
#
#echo "Splitting into one file per features..."
#mkdir -p "$TEMP_DIR/districts-split-geojson"
#./split-geojson-to-files.py

echo "Converting to TopoJSON..."
mkdir -p "$DIR/polygons"
rm -f "$DIR/polygons/*.json"
for filename in $(cd "$TEMP_DIR/districts-split-geojson" && ls *.json); do
  echo "$filename..."
  topojson \
    -o "$DIR/polygons/$filename" \
    -q 5e5 -s 1e-11 \
    -p 'id' \
    -- \
    "$TEMP_DIR/districts-split-geojson/$filename"
done
