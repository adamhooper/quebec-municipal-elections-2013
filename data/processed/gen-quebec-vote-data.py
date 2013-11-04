#!/usr/bin/env python3

import json
import os
import os.path
import re

JSON_FILES = os.path.join(os.path.dirname(__file__), '..', 'municipal-jsons')
OUT_FILE = os.path.join(os.path.dirname(__file__), 'municipal-data.json')

# Returns a dict from district ID to "postes" data.
#
# Data:
#
#  {
#    parties: [
#      'id': id,
#      'name': name
#    ],
#    candidates: [
#      'id': id,
#      'name': full name,
#      'partyId': id,
#      'postId': id,
#      'nVotes': Number
#    ],
#    posts: [
#      'id': id,
#      'type': type,
#      'districtId': id or null,
#      'boroughId': id or null,
#      'nVoters': Number,
#      'nVotes': Number,
#      'nBallotsRejected': Number,
#      'nStations': Number,
#      'nStationsReported': Number
#    ],
#    boroughs: [
#      'id': id,
#      'name': name
#    ],
#    districts: [
#      'id': id,
#      'boroughId': id,
#      'name': name
#    ]
#  }
def readData():
    print('Reading from %s/*.json' % (JSON_FILES,))
    regex = re.compile('^(\d{5}).json$')

    districts = []
    posts = []
    candidates = []
    parties = []

    for filename in os.listdir(JSON_FILES):
        if m = regex.match(filename):
            filepath = os.path.join(JSON_FILES, m.group(0))
            # 24 is "QC"; that plus other five parts of JSON filename are StatCan CSDUID
            districtId = '24%s' % (m.group(1),)

            with open(filepath) as f:
                townJson = json.load(f)
            
            districts.append({ 'id': districtId, name: 
