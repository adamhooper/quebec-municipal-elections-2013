window.QME ?= {}
window.QME.Models ?= {}
class QME.Models.Router extends Backbone.Router
  routes:
    '': 'district'
    'district/:district': 'district'
