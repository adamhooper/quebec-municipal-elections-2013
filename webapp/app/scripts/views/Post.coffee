PostTypes =
  CV: 'City Councillor'
  MC: 'Borough Mayor'
  CA: 'Borough Councillor'
  M: 'Mayor'

window.QME ?= {}
window.QME.Views ?= {}
class QME.Views.Post extends Backbone.View
  template: JST['app/scripts/templates/post-results.ejs']

  tagName: 'li'
  className: 'post'

  initialize: (options) ->
    throw 'Must pass options.model, a Post' if !@model?
    throw 'Must pass options.candidatesJson, a JSON object' if !options.candidatesJson?

    @candidatesJson = options.candidatesJson

  render: ->
    postTypeKey = @model.get('type')
    postType = PostTypes[postTypeKey]
    throw "Could not understand post type #{postTypeKey}" if !postType

    html = @template
      post: @model.attributes
      postType: postType
      candidates: @candidatesJson
    @$el
      .html(html)
      .attr('data-post-id', @model.id)
    this
