#!/usr/bin/env python3

import csv
import os.path
import json
from xml.etree import ElementTree

XML_FILE = os.path.join(os.path.dirname(__file__), '..', 'raw', 'media.xml')
OUT_FILE = os.path.join(os.path.dirname(__file__), 'montreal-data.csv')

# Returns a dict with { id, name, party, nVotes }
def parseCandidateNode(node):
    candidate = { 'id': node.attrib['id'] }
    firstName = None
    lastName = None
    for childNode in node:
        if childNode.tag == 'prenom':
            firstName = childNode.text
        elif childNode.tag == 'nom':
            lastName = childNode.text
        elif childNode.tag == 'parti':
            candidate['party'] = childNode.text
        elif childNode.tag == 'nb_voix_obtenues':
            candidate['nVotes'] = int(childNode.text)
    candidate['name'] = "%s %s" % (firstName, lastName)

    return candidate

# Returns a "Post" JSON-like object.
def parsePostNode(postNode):
    if postNode.tag == 'sommaire':
        postId = '0,00'
    else:
        postId = postNode.attrib['id']
    post = { 'id': postId, 'district': None, 'borough': None }
    post['candidates'] = candidates = []

    boroughId = None
    districtId = None
    for childNode in postNode:
        if childNode.tag == 'type':
            post['type'] = childNode.text
        elif childNode.tag == 'arrondissement' and childNode.text:
            post['borough'] = childNode.text
        elif childNode.tag == 'district' and childNode.text:
            post['district'] = childNode.text
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
            candidate = parseCandidateNode(childNode)
            candidates.append(candidate)

    post['candidates'].sort(key=lambda c: -c['nVotes'])

    return post

# Returns a list of posts from the XML file
#    posts: [
#      'id': id,
#      'type': type,
#      'district': String or null,
#      'borough': String or null,
#      'nVoters': Number,
#      'nVotes': Number,
#      'nBallotsRejected': Number,
#      'nStations': Number,
#      'nStationsReported': Number,
#      candidates: List of {
#        'id': id,
#        'name': full name,
#        'party': String,
#        'nVotes': Number
#      }
#    ]
#  }
def readData():
    print('Reading from %s...' % (XML_FILE,))

    posts = []

    tree = ElementTree.parse(XML_FILE)
    root = tree.getroot()

    for node in root:
        if node.tag == 'resultats_postes':
            for postNode in node:
                post = parsePostNode(postNode)
                posts.append(post)

        elif node.tag == 'resultats_maire':
            # The mayor post does not appear elsewhere. (The borough one does.)
            for postNode in node:
                if postNode.tag == 'sommaire':
                    post = parsePostNode(postNode)
                    post['type'] = 'M'
                    posts.append(post)

    posts.sort(key=lambda p: p['id'])

    return posts

def main():
    posts = readData()

    with open(OUT_FILE, 'w') as outFile:
        writer = csv.writer(outFile, delimiter='\t')
        writer.writerow([
            'Borough',
            'District',
            'Post type',
            'Candidate',
            'Votes',
            'State'
        ])
        for post in posts:
            for rank, candidate in enumerate(post['candidates']):
                postType = {
                    'M': 'Mayor',
                    'CA': 'Borough councillor',
                    'CV': 'City councillor',
                    'C': 'Councillor',
                    'MC': 'Borough mayor'
                }[post['type']]

                if len(post['candidates']) == 1:
                    state = 'Elected without opposition'
                elif rank == 0:
                    state = 'Elected'
                else:
                    state = 'Not elected'

                writer.writerow([
                    post['borough'],
                    post['district'],
                    postType,
                    candidate['name'],
                    candidate['nVotes'],
                    state
                ])

if __name__ == '__main__':
    main()
