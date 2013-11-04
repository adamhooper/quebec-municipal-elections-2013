window.QME ?= {}
window.QME.Util =
  formatInteger: (i) ->
    "#{i}".replace(/(\d)(\d{3})\b/, '$1,$2')
