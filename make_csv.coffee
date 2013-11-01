data = require('./as_module')
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
  'Votes'
  'State'
]]

TYPES_POSTE =
  M: 'Mayor'
  CA: 'Arrondissement councillor'
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
      candidates.push([
        ville.region
        ville.nom
        #poste.id_arrondissement
        #arrondissements[poste.id_arrondissement] ? ''
        #poste.id
        #poste.no
        #poste.nom
        "#{TYPES_POSTE[poste.type_poste]}#{if poste.no then " (#{poste.no})" else ''}"
        #candidat.id
        "#{candidat.prenom} #{candidat.nom}"
        candidat.nb_vote
        ETATS[candidat.etat]
      ])
    candidates.sort((a, b) -> b[5] - a[5] || b[4] - a[4] || a[3].localeCompare(b[3]))

    out.push(candidate) for candidate in candidates

csv().from(out).to('./municipalities.csv', delimiter: '\t')
