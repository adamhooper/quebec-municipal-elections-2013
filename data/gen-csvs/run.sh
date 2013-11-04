#!/bin/sh

DIR=`dirname $0`
OUT="$DIR/out"

$DIR/make_montreal_csv.py
$DIR/make_municipalities_csv.coffee
$DIR/transcode.sh

rm -f "$OUT"/quebec-municipal-elections-2013-results.zip
zip -j -r "$OUT"/quebec-municipal-elections-2013-results.zip out/*.csv
