#!/usr/bin/env coffee

fs = require('fs')

JSON_PATH = "#{__dirname}/../../webapp/app/cached-donnees.electionsmunicipales.gouv.qc.ca/"
OUT_FILENAME = "#{__dirname}/municipalities.txt"

formatInteger = (i) ->
  "#{i}".replace(/(\d)(\d{3})\b/, '$1,$2')

data = fs.readdirSync(JSON_PATH)
  .filter((filename) -> /^\d{5}\.json$/.test(filename))
  .map((filename) -> fs.readFileSync("#{JSON_PATH}/#{filename}", 'utf-8'))
  .map(JSON.parse)

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

outFile = fs.openSync(OUT_FILENAME, 'w')

data.sort((a, b) -> a.ville.region.localeCompare(b.ville.region) || a.ville.nom.localeCompare(b.ville.nom))

lastRegion = null
lastMunicipality = null

for ville in data
  ville = ville.ville # we're nested. Whoops.

  if lastRegion != ville.region
    lastRegion = ville.region
    lastMunicipality = null
    fs.writeSync(outFile, "\nREGION: #{lastRegion}\n\n")
  if lastMunicipality != ville.nom
    lastMunicipality = ville.nom
    fs.writeSync(outFile, "\nMUNICIPALITY: #{lastMunicipality}\n\n")

  arrondissements = {} # id to name
  for a in ville.arrondissements
    arrondissements[a.id] = a.nom

  for poste in ville.postes
    postName = "#{TYPES_POSTE[poste.type_poste]}#{if (poste.no && poste.no != '0') then " (#{poste.no})" else ''}"

    fs.writeSync(outFile, "\nPOST: #{postName}\n")
    if poste.nom
      fs.writeSync(outFile, "      a.k.a. #{poste.nom}\n")
    if poste.id_arrondissement
      fs.writeSync(outFile, "      in borough #{arrondissements[poste.id_arrondissement]}\n")

    candidates = []
    for candidat in poste.candidats
      party = candidat.parti
      party = 'Independent' if party == 'Indépendant'

      candidates.push
        name: "#{candidat.prenom} #{candidat.nom}".replace(/&#039;/, "'")
        party: party
        nVotes: candidat.nb_vote
        state: ETATS[candidat.etat]
    candidates.sort((a, b) -> b.nVotes - a.nVotes || a.name.localeCompare(b.name))

    for candidate in candidates
      fs.writeSync(outFile, candidate.name)
      if candidate.party
        fs.writeSync(outFile, ", #{candidate.party}")
      fs.writeSync(outFile, "\t#{formatInteger(candidate.nVotes)}\n")

fs.closeSync(outFile)
