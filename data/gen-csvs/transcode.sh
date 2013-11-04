#!/bin/bash

DIR=`dirname $0`
OUT="$DIR/out"

mkdir -p "$OUT"
for csv_name in $(ls $DIR/*.csv); do
  csv_basename=$(basename $csv_name .csv)
  iconv -f utf-8 -t windows-1252 "$DIR"/$csv_basename.csv > "$OUT"/$csv_basename.windows-1252.csv
  iconv -f utf-8 -t macintosh "$DIR"/$csv_basename.csv > "$OUT"/$csv_basename.macintosh.csv
  iconv -f utf-8 -t utf-8 "$DIR"/$csv_basename.csv > "$OUT"/$csv_basename.utf-8-without-bom.csv
  echo -ne '\xEF\xBB\xBF' > "$OUT"/$csv_basename.utf-8-with-bom.csv
  iconv -f utf-8 -t utf-8 "$DIR"/$csv_basename.csv >> "$OUT"/$csv_basename.utf-8-with-bom.csv
  echo -ne '\xFF\xFE' > "$OUT"/$csv_basename.utf-16le.csv
  iconv -f utf-8 -t utf-16le "$DIR"/$csv_basename.csv >> "$OUT"/$csv_basename.utf-16le.csv
  echo -ne '\xFE\xFF' > "$OUT"/$csv_basename.utf-16be.csv
  iconv -f utf-8 -t utf-16be "$DIR"/$csv_basename.csv >> "$OUT"/$csv_basename.utf-16be.csv
done
