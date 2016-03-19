exports.getText = function (message) {
  var FLOW_LIST = [
    "Hi, " + message + " <br> It's a pleasure to meet you. Would you like to hear a joke?",
    "Great. Knock Knock.",
    "Orange",
    "Orange you glad to see me?"
  ]
  return FLOW_LIST[window.FLOW_POSITION]
}

exports.getSpokenText = function (message) {
  var FLOW_LIST = [
    "Hi, ^200 " + message + ". ^500 It's ^50 a ^50 pleasure ^50 to ^50 meet ^50 you. ^500 Would ^50 you ^50 like ^50 to ^50 hear ^50 a ^50 joke?",
    "Great. ^500 Knock ^50 Knock.",
    "Orange.",
    "Orange ^50 you ^50 glad ^50 to ^50 see ^50 me?"
  ]

  return FLOW_LIST[window.FLOW_POSITION]
}
