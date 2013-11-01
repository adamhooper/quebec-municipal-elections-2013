#!/bin/sh

DIR=`dirname $0`
RAW_DIR="$DIR/../raw"

TEMP_DIR="$DIR/tmp"

mkdir -p "$TEMP_DIR"

unzip -n "$RAW_DIR/gcsd000b11a_e.zip" -d "$TEMP_DIR"
unzip -n "$RAW_DIR/districtelect.zip" -d "$TEMP_DIR"

rm -f "$TEMP_DIR/districts.*"

# Filter out non-QC subdivisions
# Only select CSDUID, to avoid encoding errors with topojson. And skip Montreal!
echo "Subdivisions..."
ogr2ogr \
  -progress \
  -overwrite \
  -t_srs 'EPSG:4326' \
  -sql "SELECT CSDUID AS id FROM gcsd000b11a_e WHERE PRUID = '24' AND CSDUID <> '2466023'" \
  "$TEMP_DIR/districts.shp" "$TEMP_DIR/gcsd000b11a_e.shp"

echo "Districts..."
ogr2ogr \
  -progress \
  -update -append \
  -t_srs 'EPSG:4326' \
  -sql 'SELECT NUM_DISTRI AS id FROM DistrictElect' \
  "$TEMP_DIR/districts.shp" "$TEMP_DIR/DistrictElect.shp"

rm -f "$DIR/topology.json"
topojson \
  -o "$DIR/topology.json" \
  -q 5e5 -s 3e-9 \
  -p 'id' \
  -- \
  "$TEMP_DIR/districts.shp"
