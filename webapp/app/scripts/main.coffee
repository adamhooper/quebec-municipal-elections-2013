window.QME ?= {}
window.QME.init = ->
  database = new QME.Models.Database(QME.data)

  router = new QME.Models.Router()
  districtIdFinder = new QME.Models.DistrictIdFinder(QME.data.districtIdToPostalCodes)
  state = new QME.Models.State({}, router: router, districtIdFinder: districtIdFinder)

  $ ->
    view = new QME.Views.Main(state: state, database: database)
    view.render()
    $('.app').append(view.el)

    Backbone.history.start()

QME.init()
