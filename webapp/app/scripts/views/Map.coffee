NormalPolygonOptions =
  fillColor: '#000000'
  fillOpacity: 0.05
  strokeColor: '#000000'
  strokeWidth: 1
  strokeOpacity: 0.3

OverlayPolygonOptions =
  clickable: false
  fillColor: '#ffffff'
  fillOpacity: 0.4
  strokeColor: '#970a00'
  strokeWidth: 3
  strokeOpacity: 0.7

window.QME ?= {}
window.QME.Views ?= {}
class QME.Views.Map extends Backbone.View
  className: 'map-wrapper'

  initialize: (options) ->
    throw 'Must pass options.state, a State' if !options.state?
    throw 'Must pass options.googleApiKey, a String' if !options.googleApiKey?
    throw 'Must pass options.fusionTableId, a String' if !options.fusionTableId?

    @state = options.state
    @topology = options.topology

  render: ->
    script = document.createElement("script")
    script.type = "text/javascript"
    script.src = "https://maps.googleapis.com/maps/api/js?key=#{@options.googleApiKey}&sensor=false&callback=QME.Views.Map.initialize"
    document.body.appendChild(script)
    QME.Views.Map.global.once('googleMapsLoaded', => @_realRender())
    QME.Views.Map.global.once('googleMapsLoaded', => @trigger('googleMapsLoaded'))

    @_geoJson = {} # Promise objects for GeoJSON of a single polygon

    $contents = $('<div class="map-wrapper2"><div class="map"></div></div>')
    @$el.append($contents)
    @$map = @$('.map')

  _fetchDistrictIdToPolygons: (districtId) ->
    deferred = $.Deferred()

    request = $.ajax
      url: "polygons/#{districtId}.json"

    request
      .then((json) => topojson.feature(json, json.objects[districtId]))
      .then (geojson) =>
        polygons = new GeoJSON(geojson, OverlayPolygonOptions)
        polygons = [polygons] if !_.isArray(polygons)
        polygons

  _districtIdToPolygonsAsync: (districtId) ->
    @_geoJson[districtId] ?= @_fetchDistrictIdToPolygons(districtId)

  # Render, once Google Maps is loaded
  _realRender: ->
    mapOptions =
      zoom: 8
      center: new google.maps.LatLng(45.5086699, -73.553992499)
      mapTypeId: google.maps.MapTypeId.ROADMAP
      mapTypeControl: false
      overviewMapControl: false
      streetViewControl: false
      minZoom: 5

    window.google.maps.visualRefresh = true
    @map = new google.maps.Map(@$map[0], mapOptions)

    fusionTableOptions =
      map: @map
      query:
        from: @options.fusionTableId
      suppressInfoWindows: true
      styles: [
        polygonOptions: NormalPolygonOptions
      ]
    fusionLayer = new google.maps.FusionTablesLayer(fusionTableOptions)

    google.maps.event.addListener fusionLayer, 'click', (e) =>
      districtId = e.row?.id?.value
      if districtId
        if districtId.length > 5
          districtId = districtId.slice(2)
        @trigger('districtIdClicked', districtId)

    zoomToPolygonBounds = (polygons) =>
      bounds = new google.maps.LatLngBounds()
      for p in polygons
        p.getPath().forEach((q) -> bounds.extend(q))
      polygons[0].getMap().fitBounds(bounds)

    lastPolygonsDistrictId = null
    lastPolygons = []

    setDistrictId = (districtId) =>
      polygon.setMap(null) for polygon in lastPolygons
      lastPolygons = []
      lastPolygonsDistrictId = districtId

      if lastPolygonsDistrictId?
        @_districtIdToPolygonsAsync(districtId).done (polygons) =>
          return if districtId != lastPolygonsDistrictId
          polygon.setMap(@map) for polygon in polygons
          zoomToPolygonBounds(polygons)
          lastPolygons = polygons
          undefined

    setDistrictId(@state.get('districtId'))
    @listenTo(@state, 'change:districtId', (model, value) -> setDistrictId(value))

QME.Views.Map.global = _.clone(Backbone.Events)
QME.Views.Map.initialize = ->
  QME.Views.Map.global.trigger('googleMapsLoaded')
