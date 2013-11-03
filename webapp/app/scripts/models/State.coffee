window.QME ?= {}
window.QME.Models ?= {}
class QME.Models.State extends Backbone.Model
  defaults:
    districtId: null # or String ID. CSDs are 5 chars long, MISSING initial "24".
    info: null # 'Searching' or null
    error: null # 'Invalid', 'NotFound', 'FusionError' or null

  initialize: (attributes, options) ->
    throw 'must pass options.router, a Backbone.Router' if !options.router?
    throw 'must pass options.districtIdFinder, an Object with a byPostalCode method' if !options.districtIdFinder?
    @router = options.router
    @districtIdFinder = options.districtIdFinder

    @_searchPromise = null

    @listenTo(@router, 'route:district', (input) => @handleDistrictId(input))

  _foundDistrict: (districtId) ->
    @set
      districtId: districtId
      info: null
      error: null
    @_save()

  _findingDistrict: ->
    @set
      districtId: null
      info: 'Searching'
      error: null

  _error: (error) ->
    @set
      districtId: null
      info: null
      error: error

  _home: ->
    @set
      districtId: null
      info: null
      error: null
    @_save()

  _save: ->
    if (districtId = @get('districtId'))?
      @router.navigate("/district/#{districtId}", replace: true)
    else
      @router.navigate("", replace: true)

  setDistrictId: (districtId) ->
    return if districtId == @get('districtId')
    @handleDistrictId(districtId)
    if districtId
      @router.navigate("/district/#{districtId}", replace: true)
    else
      @router.navigate('', replace: true)

  handleDistrictId: (districtId) ->
    if districtId?
      @_foundDistrict(districtId)
    else
      @_home()

  handlePostalCode: (input) ->
    emptyRegex = /^\s*$/
    validRegex = /^\s*([A-Z][0-9][A-Z])\s*([0-9][A-Z][0-9])\s*$/

    if emptyRegex.test(input)
      @_home()
    else if (m = validRegex.exec(input.toUpperCase()))?
      postalCode = "#{m[1]}#{m[2]}"
      if (districtId = @districtIdFinder.byPostalCode(postalCode))?
        @_foundDistrict(districtId)
      else
        @_findingDistrict()
        searchPromise = @_searchPromise = @districtIdFinder.byPostalCodeAsync(postalCode)
        # This .done() can't be merged into one JS line (see test "re-entering a found postal code")
        searchPromise.done (districtId) =>
            return if searchPromise != @_searchPromise
            if districtId?
              @_foundDistrict(districtId)
            else
              @_error('NotFound')
          .fail (error) =>
            return if searchPromise != @_searchPromise
            @_error(error)
    else
      @_error('Invalid')
