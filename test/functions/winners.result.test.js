const assert = require("assert/strict")
const { adminDatabase } = require("./setupFunctionsTesting.js")
const {
  initFakeAuction,
  setDataAndCallWrappedFunction,
  signUpFakeBidders,
} = require("./winners.data-generator")
const alice = "alice"
const bob = "bob"
const carl = "carl"

describe("The function determining the auction winners", function () {
  describe("triggered by a change to readiness", function () {
    describe("where everyone is ready with actual bids", function () {
      it("chooses the high bid and the corresponding bidder")
      it("chooses the high bid and bidder for cards separately")
      it("can choose different winners for different rounds")
      it("chooses the richest bidder if the bids are tied")
      it("chooses the richest bidder only among the tied bidders")
      it("chooses the highest priority if bids and wealth are tied")
      it("chooses the highest priority only among the richest, tied bidders")
    })
  })
})
