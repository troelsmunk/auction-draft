const functions = require("firebase-functions")
const createAuctionFunction = require("./createAuction")
const createBidderFunction = require("./createBidder")
const kitSsrFunction = require("./kitSSR")

const functionsRegion = functions.region("europe-west1")

const kitSSR = functionsRegion.https.onRequest(kitSsrFunction)
const createAuction = functionsRegion.database
  .ref("index/{uid}/auctionSize")
  .onCreate(createAuctionFunction)
const createBidder = functionsRegion.database
  .ref("index/{uid}/pin")
  .onCreate(createBidderFunction)

module.exports = { kitSSR, createAuction, createBidder }
