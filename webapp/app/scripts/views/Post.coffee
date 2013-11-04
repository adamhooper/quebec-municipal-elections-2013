PostTypes =
  CV: 'City Councillor'
  MC: 'Borough Mayor'
  CA: 'Borough Councillor'
  C: 'Councillor'
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

    winner = if @candidatesJson[0]
      if @candidatesJson[1]
        if @candidatesJson[0].nVotes > @candidatesJson[1].nVotes
          @candidatesJson[0]
        else
          null # tie
      else
        @candidatesJson[0] # by acclamation
    else
      @candidatesJson[0] # by number of votes

    html = @template
      post: @model.attributes
      postType: postType
      winner: winner
      candidates: @candidatesJson
      formatInteger: QME.Util.formatInteger
    @$el
      .html(html)
      .attr('data-post-id', @model.id)
      .toggleClass('undecided', !winner?)
    this
