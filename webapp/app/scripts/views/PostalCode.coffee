ErrorKeyToMessage =
  Invalid: 'Please enter a postal code of the form "H1H 1H1".'
  NotFound: 'Is this postal code in Quebec? Please try another.'
  FusionError: 'We failed our search. Please click on the map instead.'

InfoKeyToMessage =
  Searching: 'Searching for your postal code...'

window.QME ?= {}
window.QME.Views ?= {}
class QME.Views.PostalCode extends Backbone.View
  events:
    'click button': '_search'
    'submit form': '_search'

  className: 'postal-code'

  template: JST['app/scripts/templates/postal-code-input.ejs']

  initialize: (options) ->
    throw 'Must pass options.state, a State' if !options.state?

    @state = options.state

    @listenTo(@state, 'change', => @render())

  _initialRender: ->
    html = @template
      errorMessage: ErrorKeyToMessage[@state.get('error')]
      infoMessage: InfoKeyToMessage[@state.get('info')]

    @$el.html(html)
    @$input = @$('input')
    @$error = @$('.error')
    @$info = @$('.info')

  render: ->
    if !@$error?
      @_initialRender()
    else
      errorMessage = ErrorKeyToMessage[@state.get('error')] ? ''
      infoMessage = InfoKeyToMessage[@state.get('info')] ? ''
      @$error.toggleClass('no-error', !errorMessage)
      @$error.text(errorMessage)
      @$info.toggleClass('no-info', !infoMessage)
      @$info.text(infoMessage)

    this

  _search: (e) ->
    e.preventDefault()
    @trigger('search', @$input.val())
