window.QME ?= {}
window.QME.Models ?= {}
class QME.Models.DistrictIdFinder
  constructor: (options) ->
    throw 'Must pass options.knownDistricts, an Object mapping district ID to list of postal codes' if !options.knownDistricts?
    throw 'Must pass options.fusionTableId, a String' if !options.fusionTableId
    throw 'Must pass options.googleApiKey, a String' if !options.googleApiKey

    @options = options

    @knownDistricts = {}
    @_google = $.Deferred()
    @_geocodeOps = {} # postalCode -> $.Promise

    for district, postalCodes of options.knownDistricts
      for postalCode in postalCodes
        @knownDistricts[postalCode] = district

    undefined

  setGoogle: (google) ->
    @_google.resolve(google)

  byPostalCode: (postalCode) ->
    while postalCode.length > 0
      if (districtId = @knownDistricts[postalCode])?
        return districtId
      postalCode = postalCode.slice(0, -1)

    null

  _getGeocoderAsync: ->
    @_geocoder ?= @_google.then((google) -> new google.maps.Geocoder())

  _geocodeAsync: (postalCode) ->
    fusionTableId = @options.fusionTableId
    googleApiKey = @options.googleApiKey
    deferred = new $.Deferred()
    google = null
    @_google.done((g) -> google = g)

    @_getGeocoderAsync().done (geocoder) ->
      findDistrictFromLatLngAsync = (latitude, longitude) ->
        $.ajax
          url: 'https://www.googleapis.com/fusiontables/v1/query'
          data:
            key: googleApiKey
            sql: "SELECT id FROM #{fusionTableId} WHERE ST_INTERSECTS(geometry,RECTANGLE(LATLNG(#{latitude},#{longitude}),LATLNG(#{latitude},#{longitude})))"
          success: (json) ->
            id = json?.rows?[0]?[0]
            realId = if id
              if id.length == 7
                id.slice(2)
              else
                id
            else
              null
            deferred.resolve(realId)
          error: -> deferred.reject('FusionError')

      geocoder.geocode {
        address: 'H3H1Z1',
        region: 'CA',
        componentRestrictions: { postalCode: 'H3H1Z1' }
      }, (results, status) ->
        if status == google.maps.GeocoderStatus.ZERO_RESULTS || !(results?.length)
          deferred.reject('NotFound')
        else if status == google.maps.GeocoderStatus.OK
          latLng = results[0].geometry.location
          findDistrictFromLatLngAsync(latLng.lat(), latLng.lng())
        else
          console?.log("Could not geocode: #{status}")

    deferred

  byPostalCodeAsync: (postalCode) ->
    @_geocodeOps[postalCode] ?= @_geocodeAsync(postalCode)
