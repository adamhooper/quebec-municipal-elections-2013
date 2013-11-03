window.QME ?= {}
window.QME.Models ?= {}
class QME.Models.Database
  constructor: (data) ->
    @districts = new QME.Collections.Districts(data.districts)
    @boroughs = new QME.Collections.Boroughs(data.boroughs)
    @posts = new QME.Collections.Posts(data.posts)
    @candidates = new QME.Collections.Candidates(data.candidates)
    @parties = new QME.Collections.Parties(data.parties)

  # Given a district ID, returns a Backbone.Model per Post relevant to that
  # district.
  #
  # This includes mayoral posts.
  postsForDistrictId: (districtId) ->
    district = @districts.get(districtId)

    if district?
      if districtId.length < 5
        boroughId = district.get('boroughId')

        postsForDistrict = @posts.where({ districtId: districtId })
        postsForBorough = @posts.where({ boroughId: boroughId, districtId: null })
        postsForCity = @posts.where({ boroughId: null })

        postsForDistrict.concat(postsForBorough, postsForCity)
      else
        @posts.where({ districtId: districtId })
    else
      []

  # Given a Post, returns a JSON object describing the candidates. (This is
  # suitable for viewing.)
  #
  # The JSON:
  #
  # [
  #   {
  #     id: 'id',
  #     party: { id: 'id', name: 'name' },
  #     name: 'name',
  #     nVotes: Number
  #   },
  #   ... (losers)
  # ]
  postCandidatesJson: (post) ->
    models = @candidates.where({ postId: post.id })
    models.sort((a, b) -> b.get('nVotes') - a.get('nVotes'))

    for model in models
      partyId = model.get('partyId')

      id: model.id,
      party:
        id: partyId
        name: @parties.get(partyId)?.get('name') ? null
      name: model.get('name')
      nVotes: model.get('nVotes')
