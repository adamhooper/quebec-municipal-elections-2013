window.QME ?= {}
window.QME.Models ?= {}
class QME.Models.State extends Backbone.Model
  defaults:
    districtId: null
    postalCode: null
    postalCodeInput: ''
    postalCodeError: null

  initialize: (attributes, options) ->
    throw 'must pass options.router, a Backbone.Router' if !options.router?
    throw 'must pass options.districtIdFinder, an Object with a byPostalCode method' if !options.districtIdFinder?
    @router = options.router
    @districtIdFinder = options.districtIdFinder

    @listenTo(@router, 'route:postalCode', (input) => @handlePostalCode(input))
    @listenTo(@router, 'route:district', (input) => @handleDistrictId(input))

  setPostalCode: (postalCode) ->
    @handlePostalCode(postalCode)
    if postalCode
      @router.navigate("/postal-code/#{postalCode}", replace: true)
    else
      @router.navigate('', replace: true)

  setDistrictId: (districtId) ->
    @handleDistrictId(districtId)
    if districtId
      @router.navigate("/district/#{districtId}", replace: true)
    else
      @router.navigate('', replace: true)

  handleDistrictId: (districtId) ->
    newAttrs = if districtId
      districtId: districtId
      postalCode: null
      postalCodeInput: ''
      postalCodeError: null
    else
      districtId: null
      postalCode: null
      postalCodeInput: ''
      postalCodeError: null

    @set(newAttrs)

  handlePostalCode: (input) ->
    emptyRegex = /^\s*$/
    validRegex = /^\s*([A-Z][0-9][A-Z])\s*([0-9][A-Z][0-9])\s*$/

    newAttrs = if emptyRegex.test(input)
      districtId: null
      postalCode: null
      postalCodeInput: input
      postalCodeError: null
    else if (m = validRegex.exec(input.toUpperCase()))?
      postalCode = "#{m[1]}#{m[2]}"
      if (districtId = @districtIdFinder.byPostalCode(postalCode))?
        districtId: districtId
        postalCode: postalCode
        postalCodeInput: input
        postalCodeError: null
      else
        districtId: null
        postalCode: null
        postalCodeInput: input
        postalCodeError: 'NotFound'
    else
      districtId: null
      postalCode: null
      postalCodeInput: input
      postalCodeError: 'Invalid'

    @set(newAttrs)
