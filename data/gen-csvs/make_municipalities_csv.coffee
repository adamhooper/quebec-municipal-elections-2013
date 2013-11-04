#!/usr/bin/env coffee

fs = require('fs')

JSON_PATH = "#{__dirname}/../../webapp/app/cached-donnees.electionsmunicipales.gouv.qc.ca/"

data = fs.readdirSync(JSON_PATH)
  .filter((filename) -> /^\d{5}\.json$/.test(filename))
  .map((filename) -> fs.readFileSync("#{JSON_PATH}/#{filename}", 'utf-8'))
  .map(JSON.parse)

csv = require('csv')

out = [[
  'Region'
  'Municipality'
  #'Arrondissement ID'
  #'Arrondissement name'
  #'Post ID'
  #'Post #'
  #'District'
  'Post type'
  #'Candidate ID'
  'Candidate'
  'Party'
  'Votes'
  'State'
]]

TYPES_POSTE =
  M: 'Mayor'
  CA: 'Borough councillor'
  CV: 'Town councillor'
  C: 'Councillor'

ETATS =
  CAN: 'Not elected'
  ELU: 'Elected'
  ESO: 'Elected without opposition'

for ville in data
  ville = ville.ville # we're nested. Whoops.

  arrondissements = {} # id to name
  for a in ville.arrondissements
    arrondissements[a.id] = a.nom

  for poste in ville.postes
    candidates = []
    for candidat in poste.candidats
      party = candidat.parti
      party = 'Independent' if party == 'Indépendant'

      candidates.push([
        ville.region
        ville.nom
        #poste.id_arrondissement
        #arrondissements[poste.id_arrondissement] ? ''
        #poste.id
        #poste.no
        #poste.nom
        "#{TYPES_POSTE[poste.type_poste]}#{if (poste.no && poste.no != '0') then " (#{poste.no})" else ''}"
        #candidat.id
        "#{candidat.prenom} #{candidat.nom}"
        party
        candidat.nb_vote
        ETATS[candidat.etat]
      ])
    candidates.sort((a, b) -> b[5] - a[5] || b[4] - a[4] || a[3].localeCompare(b[3]))

    out.push(candidate) for candidate in candidates

csv().from(out).to('./municipalities.csv', delimiter: '\t')
