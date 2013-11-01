window.QME ?= {}
window.QME.Models ?= {}
class QME.Models.DistrictIdFinder
  constructor: (districtToPostalCodes) ->
    @postalCodeToDistrict = {}

    for district, postalCodes of districtToPostalCodes
      for postalCode in postalCodes
        @postalCodeToDistrict[postalCode] = district

  byPostalCode: (postalCode) ->
    while postalCode.length > 0
      if (districtId = @postalCodeToDistrict[postalCode])?
        return districtId
      postalCode = postalCode.slice(0, -1)

    null
