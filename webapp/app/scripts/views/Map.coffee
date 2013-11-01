window.QME ?= {}
window.QME.Views ?= {}

DefaultPolygonOptions =
  clickable: true
  strokeColor: '#888'
  strokeOpacity: 1
  strokeWeight: 1
  fillColor: '#aecaec'
  fillOpacity: .25

UnhighlightedPolygonOptions =
  fillColor: '#aecaec'
  fillOpacity: .25

HighlightedPolygonOptions =
  fillColor: '#9da9da'
  fillOpacity: .4

class QME.Views.Map extends Backbone.View
  className: 'map'

  initialize: (options) ->
    throw 'Must pass options.state, a State' if !options.state?
    throw 'Must pass options.collection, a Districts collection' if !options.collection?
    throw 'Must pass options.topology, a TopoJSON Object with a "districts" key' if !options.topology?

    @state = options.state
    @topology = options.topology

  render: ->
    script = document.createElement("script")
    script.type = "text/javascript"
    script.src = "//maps.googleapis.com/maps/api/js?key=AIzaSyBbcerjoK66hpuBRxpiUXszty65nxpkYKw&sensor=false&callback=QME.Views.Map.initialize"
    document.body.appendChild(script)
    QME.Views.Map.global.once('googleMapsLoaded', => @_realRender())

    # Calculate GeoJSON before it's needed, to spread the load a bit
    @geoJson = topojson.feature(@topology, @topology.objects.districts)

  # Render, once Google Maps is loaded
  _realRender: ->
    mapOptions =
      zoom: 8
      center: new google.maps.LatLng(45.5086699, -73.553992499)
      mapTypeId: google.maps.MapTypeId.ROADMAP

    window.google.maps.visualRefresh = true
    @map = new google.maps.Map(@el, mapOptions)

    districts = new GeoJSON(@geoJson, DefaultPolygonOptions)

    @districtIdToPolygon = districtIdToPolygon = {}

    addToMapRecursive = (feature) =>
      if _.isArray(feature)
        addToMapRecursive(f) for f in feature
      else
        featureId = feature.geojsonProperties.id
        (districtIdToPolygon[featureId] ||= []).push(feature)
        feature.setMap(@map)
        google.maps.event.addListener feature, 'click', =>
          console.log('Click', featureId)
          @state.setDistrictId(featureId)
      undefined

    addToMapRecursive(districts)

    lastPolygon = null

    zoomToPolygonBounds = (polygon) =>
      bounds = new google.maps.LatLngBounds()
      for p in polygon
        p.getPath().forEach((q) -> bounds.extend(q))
      polygon[0].getMap().fitBounds(bounds)

    setDistrictId = (districtId) =>
      if lastPolygon?
        p.setOptions(UnhighlightedPolygonOptions) for p in lastPolygon
      lastPolygon = districtIdToPolygon[districtId]
      if lastPolygon?
        p.setOptions(HighlightedPolygonOptions) for p in lastPolygon
        zoomToPolygonBounds(lastPolygon)

      undefined

    setDistrictId(@state.get('districtId'))
    @listenTo(@state, 'change:districtId', (model, value) -> setDistrictId(value))

    undefined

QME.Views.Map.global = _.clone(Backbone.Events)
QME.Views.Map.initialize = ->
  QME.Views.Map.global.trigger('googleMapsLoaded')
