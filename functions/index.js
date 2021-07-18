import functions from "firebase-functions"
const { region } = functions
import createAuctionFunction from "./createAuction.js"
import createBidderFunction from "./createBidder.js"

const db = region("europe-west1").database
const createAuction = db
  .ref("index/{uid}/auctionSize")
  .onCreate(createAuctionFunction)
const createBidder = db.ref("index/{uid}/pin").onCreate(createBidderFunction)

export default { createAuction, createBidder }
