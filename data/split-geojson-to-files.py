#!/usr/bin/env python3

import os.path
import json

def main(inFilename, outDirname):
    with open(inFilename, 'r') as f:
        data = json.load(f)

    for feature in data['features']:
        featureId = feature['properties']['id']
        if len(featureId) > 5: featureId = featureId[2:]
        del feature['properties']
        with open(os.path.join(outDirname, '%s.json' % (featureId,)), 'w') as f:
            json.dump(feature, f)

if __name__ == '__main__':
    inFilename = os.path.join(os.path.dirname(__file__), 'processed', 'tmp', 'districts.json')
    outDirname = os.path.join(os.path.dirname(__file__), 'processed', 'tmp', 'districts-split-geojson')
    main(inFilename, outDirname)
