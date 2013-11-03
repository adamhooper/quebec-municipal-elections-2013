window.QME ?= {}
window.QME.Views ?= {}
class QME.Views.Main extends Backbone.View
  initialize: (options) ->
    throw 'Must pass options.topology, a TopoJSON Object' if !options.topology?
    throw 'Must pass options.database, a QME.Models.Database' if !options.database?
    throw 'Must pass options.state, a QME.Models.State' if !options.state?
    throw 'Must pass options.districtLoader, a QME.Models.DistrictLoader' if !options.districtLoader?

    @state = options.state
    @database = options.database
    @districtLoader = options.districtLoader

    @postalCodeView = new QME.Views.PostalCode(state: @state)
    @districtView = new QME.Views.District()
    @mapView = new QME.Views.Map
      state: @state
      collection: @database.districts
      topology: options.topology
      googleApiKey: options.googleApiKey

    @listenTo(@database.districts, 'add', (model) => @_onDistrictLoaded(model))
    @listenTo(@postalCodeView, 'search', (postalCode) => @state.handlePostalCode(postalCode, fromUser: true))
    @listenTo(@state, 'change:districtId', => @_renderDistrict())
    @listenTo(@mapView, 'googleMapsLoaded', => @trigger('googleMapsLoaded'))

  render: ->
    @postalCodeView.render()
    @mapView.render()
    @districtView.render()

    @$el.append(@postalCodeView.el)
    @$el.append(@mapView.el)
    @$el.append(@districtView.el)

    @_renderDistrict()
    this

  _renderDistrict: ->
    districtId = @state.get('districtId')
    if districtId
      district = @database.districts.get(@state.get('districtId'))

      if !district?
        @districtView.setDistrictAndPosts(null, null)
        @districtLoader.maybeLoadDistrictById(districtId)
      else
        posts = @database.postsForDistrictId(districtId)
        postsWithCandidates = for post in posts
          post: post
          candidatesJson: @database.postCandidatesJson(post)

        @districtView.setDistrictAndPosts(district, postsWithCandidates)
    else
      @districtView.setDistrictAndPosts(null, null)

  _onDistrictLoaded: (district) ->
    @_renderDistrict() if @state.get('districtId') == district.id
