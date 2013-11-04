window.QME ?= {}
window.QME.Views ?= {}
class QME.Views.District extends Backbone.View
  events:
    'click li.post': '_openPost'

  template: JST['app/scripts/templates/district.ejs']

  className: 'district'

  render: ->
    if @district?
      html = @template
        district: @district.attributes
      @$el
        .html(html)
        .attr('data-district-id', @district.id)

      $ul = @$('ul')
      for obj in @postsAndCandidates
        view = new QME.Views.Post(model: obj.post, candidatesJson: obj.candidatesJson)
        view.render()
        $ul.append(view.$el)
    else
      @$el.html('').removeAttr('data-district-id')

    this

  setDistrictAndPosts: (@district, @postsAndCandidates) ->
    @render()

  _openPost: (e) ->
    e.preventDefault()
    @$('li.post.open').removeClass('open')
    $(e.target).closest('li.post').addClass('open')
