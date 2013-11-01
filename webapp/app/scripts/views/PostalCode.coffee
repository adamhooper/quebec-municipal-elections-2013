ErrorKeyToMessage =
  Invalid: 'Please enter a postal code of the form "H1H 1H1".'
  NotFound: 'The postal code you entered does not seem to be in Montreal. Please try another.'

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
      state: @state
      errorMessage: ErrorKeyToMessage[@state.get('postalCodeError')]

    @$el.html(html)
    @$input = @$('input')
    @$error = @$('.error')

  render: ->
    if !@$input?
      @_initialRender()
    else
      errorMessage = ErrorKeyToMessage[@state.get('postalCodeError')] ? ''
      @$error.toggleClass('no-error', !errorMessage)
      @$error.text(errorMessage)

    this

  _search: (e) ->
    e.preventDefault()
    @trigger('search', @$input.val())
