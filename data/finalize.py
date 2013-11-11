#!/usr/bin/env python
#
# Writes data.js, a JavaScript file that defines our data.
#
# This lets us bundle the data in the same JavaScript file as our code.

import json
import os.path

DISTRICT_TO_POSTAL_CODES = os.path.join(os.path.dirname(__file__), 'processed', 'district-to-postal-codes.json')
MONTREAL_DATA            = os.path.join(os.path.dirname(__file__), 'processed', 'montreal-data.json')
OUTPUT                   = os.path.join(os.path.dirname(__file__), 'processed', 'data.js')

def main():
    fullJson = {}

    with open(DISTRICT_TO_POSTAL_CODES, 'r') as f:
        fullJson['districtIdToPostalCodes'] = json.load(f)

    with open(MONTREAL_DATA, 'r') as f:
        fullJson.update(json.load(f))

    with open(OUTPUT, 'w') as f:
        f.write('if(!window.QME)window.QME={};window.QME.data=')
        json.dump(fullJson, f, separators=(',', ':'))
        f.write(';')

if __name__ == '__main__':
    main()
