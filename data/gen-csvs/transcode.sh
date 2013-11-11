#!/bin/bash

DIR=`dirname $0`
OUT="$DIR/out"

mkdir -p "$OUT"
for txt_name in $(ls $DIR/*.txt); do
  txt_basename=$(basename $txt_name .txt)
  iconv -f utf-8 -t windows-1252 "$DIR"/$txt_basename.txt > "$OUT"/$txt_basename.windows-1252.txt
  iconv -f utf-8 -t macintosh "$DIR"/$txt_basename.txt > "$OUT"/$txt_basename.macintosh.txt
  iconv -f utf-8 -t utf-8 "$DIR"/$txt_basename.txt > "$OUT"/$txt_basename.utf-8-without-bom.txt
  echo -ne '\xEF\xBB\xBF' > "$OUT"/$txt_basename.utf-8-with-bom.txt
  iconv -f utf-8 -t utf-8 "$DIR"/$txt_basename.txt >> "$OUT"/$txt_basename.utf-8-with-bom.txt
  echo -ne '\xFF\xFE' > "$OUT"/$txt_basename.utf-16le.txt
  iconv -f utf-8 -t utf-16le "$DIR"/$txt_basename.txt >> "$OUT"/$txt_basename.utf-16le.txt
  echo -ne '\xFE\xFF' > "$OUT"/$txt_basename.utf-16be.txt
  iconv -f utf-8 -t utf-16be "$DIR"/$txt_basename.txt >> "$OUT"/$txt_basename.utf-16be.txt
done
