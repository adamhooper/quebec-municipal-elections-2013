data = require('./as_module')
csv = require('csv')

out = [[
  'Region'
  'Municipality'
  'Arrondissement ID'
  'Arrondissement name'
  'Post ID'
  'Post #'
  'District'
  'Post type'
  'Candidate ID'
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
    for candidat in poste.candidats
      out.push([
        ville.region
        ville.nom
        poste.id_arrondissement
        arrondissements[poste.id_arrondissement] ? ''
        poste.id
        poste.no
        poste.nom
        TYPES_POSTE[poste.type_poste]
        candidat.id
        "#{candidat.prenom} #{candidat.nom}"
        candidat.nb_vote
        ETATS[candidat.etat]
      ])

csv().from(out).to('./municipalities.csv')
