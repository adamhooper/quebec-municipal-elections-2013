window.QME ?= {}
window.QME.init = ->
  database = new QME.Models.Database(QME.data)

  GoogleApiKey = 'AIzaSyBbcerjoK66hpuBRxpiUXszty65nxpkYKw'
  FusionTableId = '1YrM5MJTEdyZVHdry95nnCrpVBSp36LsCFPCycnA'

  router = new QME.Models.Router()

  districtIdFinder = new QME.Models.DistrictIdFinder
    knownDistricts: QME.data.districtIdToPostalCodes
    googleApiKey: GoogleApiKey
    fusionTableId: FusionTableId

  districtLoader = new QME.Models.DistrictLoader
    boroughs: database.boroughs
    districts: database.districts
    candidates: database.candidates
    posts: database.posts
    urlPrefix: 'cached-donnees.electionsmunicipales.gouv.qc.ca'

  state = new QME.Models.State({}, router: router, districtIdFinder: districtIdFinder)

  $ ->
    view = new QME.Views.Main
      state: state
      database: database
      districtLoader: districtLoader
      googleApiKey: GoogleApiKey
      fusionTableId: FusionTableId

    view.once('googleMapsLoaded', -> districtIdFinder.setGoogle(google))

    view.render()
    $('.app').append(view.el)

    Backbone.history.start()

QME.init()
