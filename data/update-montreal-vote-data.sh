#!/bin/sh
#
# Updates media.xml and sends the changed files to Amazon S3. Repeats
# every five minutes. (To be run while election results are coming in.)
#
# You must set $MTLELECTION_PASSWORD as an environment variable. Otherwise,
# the download will fail.

DIR=$(dirname $0)
RAW_DIR="$DIR/raw"
WEBDIR="$DIR/../webapp"

set -x

while true; do
  curl ftp://ftp-ville-election2013.tinkweb.ca/media.xml \
    --user "mtlelection:$MTLELECTION_PASSWORD" \
    -o "$RAW_DIR/media.xml" \
    && \
    \
    $DIR/gen-montreal-vote-data.py && \
    \
    $DIR/finalize.py && \
    \
    cp $DIR/data.js $DIR/../../webapp/app/scripts/data.js && \
    (cd "$WEBDIR"; grunt build) && \
    \
    aws s3 cp "$WEBDIR"/dist/scripts/*.vendor.js s3://mtl-election/scripts/ --region us-east-1 --acl public-read && \
    aws s3 cp "$WEBDIR"/dist/scripts/*.main.js s3://mtl-election/scripts/ --region us-east-1 --acl public-read && \
    aws s3 cp "$WEBDIR"/dist/index.html s3://mtl-election/index.html --region us-east-1 --acl public-read

  sleep 300
done
