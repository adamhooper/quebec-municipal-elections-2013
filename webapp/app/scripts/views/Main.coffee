window.QME ?= {}
window.QME.Views ?= {}
class QME.Views.Main extends Backbone.View
  initialize: (options) ->
    throw 'Must pass options.database, a QME.Models.Database' if !options.database?
    throw 'Must pass options.state, a QME.Models.State' if !options.state?

    @state = options.state
    @database = options.database

    @postalCodeView = new QME.Views.PostalCode(state: @state)
    @districtView = new QME.Views.District()

    @listenTo(@postalCodeView, 'search', (postalCode) => @state.handlePostalCode(postalCode, fromUser: true))
    @listenTo(@state, 'change:districtId', => @_renderDistrict())

  render: ->
    @postalCodeView.render()
    @districtView.render()

    @$el.append(@postalCodeView.el)
    @$el.append(@districtView.el)

    @_renderDistrict()
    this

  _renderDistrict: ->
    districtId = @state.get('districtId')
    if districtId
      district = @database.districts.get(@state.get('districtId'))

      posts = @database.postsForDistrictId(districtId)
      postsWithCandidates = for post in posts
        post: post
        candidatesJson: @database.postCandidatesJson(post)

      @districtView.setDistrictAndPosts(district, postsWithCandidates)
    else
      @districtView.setDistrictAndPosts(null, null)
