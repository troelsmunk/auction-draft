const functions = require("firebase-functions")
const findWinnersFunction = require("./findWinners")
const kitSsrFunction = require("./kitSSR")

const functionsRegion = functions.region("europe-west1")

const kitSSR = functionsRegion.https.onRequest(kitSsrFunction)
const findWinners = functionsRegion.database
  .ref("auctions/{pin}/readys")
  .onUpdate(findWinnersFunction)

module.exports = { kitSSR, findWinners }
