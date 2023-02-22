const functions = require("firebase-functions")
const createAuctionFunction = require("./createAuction")
const createBidderFunction = require("./createBidder")

let kitSSRServer
const functionsRegion = functions.region("europe-west1")
exports.kitSSR = functionsRegion.https.onRequest((request, response) => {
  if (!kitSSRServer) {
    functions.logger.info("Initialising SvelteKit SSR entry")
    kitSSRServer = require("./kitSSR/index").default
    functions.logger.info("SvelteKit SSR entry initialised!")
  }
  functions.logger.info("Requested resource: " + request.originalUrl)
  return kitSSRServer(request, response)
})
const db = functionsRegion.database
exports.createAuction = db
  .ref("index/{uid}/auctionSize")
  .onCreate(createAuctionFunction)
exports.createBidder = db.ref("index/{uid}/pin").onCreate(createBidderFunction)
