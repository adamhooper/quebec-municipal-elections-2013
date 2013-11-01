#!/usr/bin/env python

import json
import os.path

DISTRICT_TO_POSTAL_CODES = os.path.join(os.path.dirname(__file__), 'district-to-postal-codes.json')
MONTREAL_DATA = os.path.join(os.path.dirname(__file__), 'montreal-data.json')
TOPOJSON_DATA = os.path.join(os.path.dirname(__file__), 'topology.json')
OUTPUT = os.path.join(os.path.dirname(__file__), 'data.js')

def main():
    fullJson = {}

    with open(DISTRICT_TO_POSTAL_CODES, 'r') as f:
        fullJson['districtIdToPostalCodes'] = json.load(f)

    with open(MONTREAL_DATA, 'r') as f:
        fullJson.update(json.load(f))

    with open(TOPOJSON_DATA, 'r') as f:
        fullJson['topology'] = json.load(f)

    with open(OUTPUT, 'w') as f:
        f.write('if(!window.QME)window.QME={};window.QME.data=')
        json.dump(fullJson, f, separators=(',', ':'))
        f.write(';')

if __name__ == '__main__':
    main()
