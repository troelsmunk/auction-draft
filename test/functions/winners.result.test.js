const assert = require("assert/strict")
const { adminDatabase } = require("./setupFunctionsTesting.js")
const {
  initFakeAuction,
  setDataAndCallWrappedFunction,
  signUpFakeBidders,
  setBid,
} = require("./winners.data-generator")
const alice = "alice"
const bob = "bob"
const carl = "carl"

describe("The function determining the auction winners", function () {
  describe("triggered by a change to readiness", function () {
    describe("where everyone is ready with actual bids", function () {
      it("chooses the high bid and the corresponding bidder", async function () {
        const pin = 1255
        const size = 2
        const round = 10
        const card = 0
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob)
        const thirteenZeroes = Array(13).fill(0)
        let aliceBid = [3, 2].concat(thirteenZeroes)
        let bobBid = [1, 4].concat(thirteenZeroes)
        const expectedWinningBid = aliceBid[card]
        await setBid(pin, alice, aliceBid)
        await setBid(pin, bob, bobBid)
        const everyoneReady = { alice: round, bob: round }
        await setDataAndCallWrappedFunction(pin, everyoneReady)
        const resultRef = adminDatabase.ref(
          `auctions/${pin}/results/rounds/${round}/${card}`
        )
        const actualWinnerSeat = await resultRef
          .child(`seat`)
          .get()
          .then((snap) => snap.val())
        const actualBid = await resultRef
          .child(`bid`)
          .get()
          .then((snap) => snap.val())
        const aliceSeat = 0
        assert.equal(
          actualWinnerSeat,
          aliceSeat,
          `The winner for card ${card} should be ${aliceSeat}, but was ${actualWinnerSeat}`
        )
        assert.equal(
          actualBid,
          expectedWinningBid,
          `The winning bid for card ${card} should be ${expectedWinningBid}, but was ${actualBid}`
        )
      })
      it("chooses another high bid and bidder for another card", async function () {
        const pin = 1256
        const size = 2
        const round = 13
        const card = 1
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob)
        const thirteenZeroes = Array(13).fill(0)
        let aliceBid = [3, 2].concat(thirteenZeroes)
        let bobBid = [1, 4].concat(thirteenZeroes)
        const expectedWinningBid = bobBid[card]
        await setBid(pin, alice, aliceBid)
        await setBid(pin, bob, bobBid)
        const everyoneReady = { alice: round, bob: round }
        await setDataAndCallWrappedFunction(pin, everyoneReady)
        const resultRef = adminDatabase.ref(
          `auctions/${pin}/results/rounds/${round}/${card}`
        )
        const actualWinnerSeat = await resultRef
          .child(`seat`)
          .get()
          .then((snap) => snap.val())
        const actualBid = await resultRef
          .child(`bid`)
          .get()
          .then((snap) => snap.val())
        const bobSeat = 1
        assert.equal(
          actualWinnerSeat,
          bobSeat,
          `The winner for card ${card} should be ${bobSeat}, but was ${actualWinnerSeat}`
        )
        assert.equal(
          actualBid,
          expectedWinningBid,
          `The winning bid for card ${card} should be ${expectedWinningBid}, but was ${actualBid}`
        )
      })
      it("can choose different winners for different rounds")
      it("chooses the richest bidder if the bids are tied")
      it("chooses the richest bidder only among the tied bidders")
      it("chooses the highest priority if bids and wealth are tied")
      it("chooses the highest priority only among the richest, tied bidders")
    })
  })
})
