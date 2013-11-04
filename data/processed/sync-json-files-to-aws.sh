#!/bin/bash

DIR=`dirname $0`
TMP="$DIR/tmp/municipal-json"

SRC="http://donnees.electionsmunicipales.gouv.qc.ca"
LOCAL_DEST="$DIR/../municipal-jsons"
WORK_DEST="$DIR/../../webapp/app/cached-donnees.electionsmunicipales.gouv.qc.ca"
WORK_DEST2="$DIR/../../webapp/dist/cached-donnees.electionsmunicipales.gouv.qc.ca"
S3_DEST="s3://mtl-election/cached-donnees.electionsmunicipales.gouv.qc.ca"

mkdir -p "$TMP"

CACHE_BUST="$RANDOM"000

while true; do
  CACHE_BUST=$(($CACHE_BUST + 1))
  for district_id in $(cat "$DIR/../json-list.txt"); do
    filename="$district_id.json"
    rm -f "$TMP/$filename" && \
      echo "$SRC/$filename" && \
      curl -o "$TMP/$filename" "$SRC/$filename?CACHE_BUST=$CACHE_BUST" '-#' && \
      cp "$TMP/$filename" "$LOCAL_DEST/$filename" && \
      cp "$TMP/$filename" "$WORK_DEST/$filename" && \
      cp "$TMP/$filename" "$WORK_DEST2/$filename" && \
      aws s3 cp "$TMP/$filename" "$S3_DEST/$filename" --region=us-east-1 --acl public-read
    sleep 0.2
  done
done
