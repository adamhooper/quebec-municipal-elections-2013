#!/usr/bin/env python3

import os.path
import json
from xml.etree import ElementTree

XML_FILE = os.path.join(os.path.dirname(__file__), 'raw', 'media.xml')
OUT_FILE = os.path.join(os.path.dirname(__file__), 'processed', 'montreal-data.json')

# Returns a dict with { id, name, partyId, postId, nVotes }
#
# Modifies partyIdToName in-place.
def parseCandidateNode(node, partyIdToName):
    candidate = { 'id': node.attrib['id'] }
    firstName = None
    lastName = None
    for childNode in node:
        if childNode.tag == 'prenom':
            firstName = childNode.text
        elif childNode.tag == 'nom':
            lastName = childNode.text
        elif childNode.tag == 'parti':
            partyIdToName[childNode.attrib['id']] = childNode.text
            candidate['partyId'] = childNode.attrib['id']
        elif childNode.tag == 'nb_voix_obtenues':
            candidate['nVotes'] = int(childNode.text)
    candidate['name'] = "%s %s" % (firstName, lastName)

    return candidate

# Returns a "Post" JSON-like object.
#
# Modifies the "candidates" list and other dictionaries in-place.
def parsePostNode(postNode, candidates, partyIdToName, districtIdToName, boroughIdToName, districtIdToBoroughId):
    if postNode.tag == 'sommaire':
        postId = '0,00'
    else:
        postId = postNode.attrib['id']
    post = { 'id': postId, 'districtId': None, 'boroughId': None }

    boroughId = None
    districtId = None
    for childNode in postNode:
        if childNode.tag == 'type':
            post['type'] = childNode.text
        elif childNode.tag == 'arrondissement' and childNode.text:
            boroughId = childNode.attrib['id']
            boroughIdToName[boroughId] = childNode.text
            post['boroughId'] = boroughId
        elif childNode.tag == 'district' and childNode.text:
            districtId = childNode.attrib['id']
            districtIdToName[districtId] = childNode.text
            post['districtId'] = districtId
        elif childNode.tag == 'nb_electeurs_inscrits':
            post['nVoters'] = int(childNode.text)
        elif childNode.tag == 'nb_total_voix_recueillies':
            post['nVotes'] = int(childNode.text)
        elif childNode.tag == 'nb_bulletins_rejetes':
            post['nBallotsRejected'] = int(childNode.text)
        elif childNode.tag == 'nb_bureaux_total':
            post['nStations'] = int(childNode.text)
        elif childNode.tag == 'nb_bureaux_depouilles':
            post['nStationsReported'] = int(childNode.text)
        elif childNode.tag == 'candidat':
            candidate = parseCandidateNode(childNode, partyIdToName)
            candidate['postId'] = postId
            candidates.append(candidate)

    if districtId and boroughId:
        districtIdToBoroughId[districtId] = boroughId

    return post

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
    print('Reading from %s...' % (XML_FILE,))

    data = {
        'parties': [],
        'candidates': [],
        'posts': [],
        'boroughs': [],
        'districts': []
    }

    tree = ElementTree.parse(XML_FILE)
    root = tree.getroot()

    partyIdToName = {}
    districtIdToName = {}
    boroughIdToName = {}
    districtIdToBoroughId = {}

    for node in root:
        if node.tag == 'resultats_postes':
            for postNode in node:
                post = parsePostNode(postNode, data['candidates'], partyIdToName, districtIdToName, boroughIdToName, districtIdToBoroughId)
                data['posts'].append(post)

        elif node.tag == 'resultats_maire':
            # The mayor post does not appear elsewhere. (The borough one does.)
            for postNode in node:
                if postNode.tag == 'sommaire':
                    post = parsePostNode(postNode, data['candidates'], partyIdToName, districtIdToName, boroughIdToName, districtIdToBoroughId)
                    post['type'] = 'M'
                    data['posts'].append(post)

    for id, name in partyIdToName.items():
        data['parties'].append({ 'id': id, 'name': name })

    for id, name in boroughIdToName.items():
        data['boroughs'].append({ 'id': id, 'name': name })

    for id, name in districtIdToName.items():
        data['districts'].append({
            'id': id,
            'name': name,
            'boroughId': districtIdToBoroughId[id]
        })

    return data

def main():
    data = readData()

    with open(OUT_FILE, 'w') as outFile:
        print('Writing to %s...' % (OUT_FILE,))
        outFile.write(json.dumps(data))

if __name__ == '__main__':
    main()
