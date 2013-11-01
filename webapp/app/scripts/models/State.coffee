window.QME ?= {}
window.QME.Models ?= {}
class QME.Models.State extends Backbone.Model
  defaults:
    page: 'home'
    postalCode: null
    postalCodeInput: ''
    postalCodeError: null

  initialize: (attributes, options) ->
    throw 'must pass options.router, a Backbone.Router' if !options.router?
    throw 'must pass options.districtIdFinder, an Object with a byPostalCode method' if !options.districtIdFinder?
    @router = options.router
    @districtIdFinder = options.districtIdFinder

    @router.on('route:postalCode', (input) => @handlePostalCode(input))

  handlePostalCode: (input) ->
    emptyRegex = /^\s*$/
    validRegex = /^\s*([A-Z][0-9][A-Z])\s*([0-9][A-Z][0-9])\s*$/

    newAttrs = if emptyRegex.test(input)
      page: 'home'
      districtId: null
      postalCode: null
      postalCodeInput: input
      postalCodeError: null
    else if (m = validRegex.exec(input.toUpperCase()))?
      postalCode = "#{m[1]}#{m[2]}"
      if (districtId = @districtIdFinder.byPostalCode(postalCode))?
        page: 'district'
        districtId: districtId
        postalCode: postalCode
        postalCodeInput: input
        postalCodeError: null
      else
        page: 'home'
        districtId: null
        postalCode: null
        postalCodeInput: input
        postalCodeError: 'NotFound'
    else
      page: 'home'
      districtId: null
      postalCode: null
      postalCodeInput: input
      postalCodeError: 'Invalid'

    @set(newAttrs)
