window.QME ?= {}
window.QME.Collections ?= {}
class QME.Collections.Posts extends Backbone.Collection
  model: QME.Models.Post
