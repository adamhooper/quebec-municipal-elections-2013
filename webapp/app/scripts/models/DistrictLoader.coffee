window.QME ?= {}
window.QME.Models ?= {}
# Adds to districts, posts and candidates Collections by fetching AJAX requests
# from http://donnees.electionsmunicipales.gouv.qc.ca/
class QME.Models.DistrictLoader
  constructor: (options) ->
    throw 'Must set options.boroughs, a Backbone.Collection' if !options.boroughs?
    throw 'Must set options.districts, a Backbone.Collection' if !options.districts?
    throw 'Must set options.posts, a Backbone.Collection' if !options.posts?
    throw 'Must set options.candidates, a Backbone.Collection' if !options.candidates?
    throw 'Must set options.urlPrefix, a String' if !options.urlPrefix?

    _.extend(this, options)

    @_requests = {} # ID to AJAX request or null if complete

  # Loads all election results for a district based on its ID.
  #
  # If the district data is already loaded, this is a no-op. Otherwise,
  # sends a request to the server. Clients should watch the district Collection
  # for 'add' events: when a district is added, that means the candidates and
  # posts have made it into their respective collections first.
  maybeLoadDistrictById: (districtId) ->
    if districtId not of @_requests
      request = $.ajax
        url: "#{@urlPrefix}/#{districtId}.json"

        success: (json) =>
          @_handleJson(districtId, json)
          @_requests[districtId] = null

      @_requests[districtId] = request

  _handleJson: (districtId, json) ->
    boroughs = ({ id: "#{districtId}-#{o.id}", name: o.nom } for o in json.ville.arrondissements)
    @boroughs.add(boroughs)

    posts = []
    candidates = []

    for post in json.ville.postes
      postId = "#{districtId}-#{post.id}"

      boroughName = if post.id_arrondissement
        @boroughs.get("#{districtId}-#{post.id_arrondissement}")?.get('name')
      else
        ''
      postName = post.nom || ''
      postNum = parseFloat(post.no)
      if postNum
        postNum += 1 # post no. 1 means "Councillor (2)"
      else
        postNum = null # post no. 0 means "Councillor"

      fullPostName = if boroughName
        if postName
          "#{boroughName} / #{postName}"
        else if postNum
          "#{boroughName} #{postNum}"
        else
          boroughName
      else if postName
        if postNum
          "#{postName} #{postNum}"
        else
          postName
      else if postNum
        postNum
      else
        null

      posts.push
        id: postId
        type: post.type_poste
        name: fullPostName
        districtId: districtId
        boroughId: if post.id_arrondissement then "#{districtId}-#{post.id_arrondissement}" else null
        nVoters: null

      for candidate in post.candidats
        candidates.push
          id: "#{districtId}-#{candidate.id}"
          name: "#{candidate.prenom} #{candidate.nom}"
          postId: postId
          partyId: null
          nVotes: parseFloat(candidate.nb_vote)

    @posts.add(posts)
    @candidates.add(candidates)
    @districts.add
      id: districtId
      name: json.ville.nom
