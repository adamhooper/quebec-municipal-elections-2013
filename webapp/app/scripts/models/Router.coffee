window.QME ?= {}
window.QME.Models ?= {}
class QME.Models.Router extends Backbone.Router
  routes:
    'postal-code/:postalCode': 'postalCode'
    '': 'home'
