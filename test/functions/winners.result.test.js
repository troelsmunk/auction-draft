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
    describe("where everyone is ready", function () {
      it("writes some sort of result for round 1", async function () {
        const pin = 1246
        const size = 2
        const round = 1
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob)
        const everyoneReady = { alice: round, bob: round }
        await setDataAndCallWrappedFunction(pin, everyoneReady)
        const resultRef = adminDatabase.ref(
          `auctions/${pin}/results/rounds/${round}`
        )
        const resultSnap = await resultRef.once("value")
        const actual = resultSnap.exists()
        assert.equal(actual, true, `The result should exist, but didn't`)
      })
      it("writes some sort of result to round 2", async function () {
        const pin = 1247
        const size = 2
        const round = 2
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob)
        const everyoneReady = { alice: round, bob: round }
        await setDataAndCallWrappedFunction(pin, everyoneReady)

        const resultRef = adminDatabase.ref(
          `auctions/${pin}/results/rounds/${round}`
        )
        const resultSnap = await resultRef.once("value")
        const actual = resultSnap.exists()
        assert.equal(actual, true, `The result should exist, but didn't`)
      })
      it("writes some sort of result for card 0", async function () {
        const pin = 1248
        const size = 2
        const round = 2
        const card = 0
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob)
        const everyoneReady = { alice: round, bob: round }
        await setDataAndCallWrappedFunction(pin, everyoneReady)

        const resultRef = adminDatabase.ref(
          `auctions/${pin}/results/rounds/${round}/${card}`
        )
        const resultSnap = await resultRef.once("value")
        const actual = resultSnap.exists()
        assert.equal(actual, true, `The result should exist, but didn't`)
      })
      it("writes something as winner and winning bid in the result for card 0", async function () {
        const pin = 1249
        const size = 2
        const round = 1
        const card = 0
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob)
        const everyoneReady = { alice: round, bob: round }
        await setDataAndCallWrappedFunction(pin, everyoneReady)
        const resultRef = adminDatabase.ref(
          `auctions/${pin}/results/rounds/${round}/${card}`
        )
        const winnerSnap = await resultRef.child("seat").once("value")
        const winningBidSnap = await resultRef.child("bid").once("value")
        const actual = winnerSnap.exists() && winningBidSnap.exists()
        assert.equal(
          actual,
          true,
          `The result should have branches under card 0, but didn't`
        )
      })
      it("chooses bidder 0 over 1 for card 0 in round 0 with no bids", async function () {
        const pin = 1250
        const size = 2
        const round = 1
        const card = 0
        const expectedWinner = 0
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob)
        const everyoneReady = { alice: round, bob: round }
        await setDataAndCallWrappedFunction(pin, everyoneReady)
        const resultRef = adminDatabase.ref(
          `auctions/${pin}/results/rounds/${round}/${card}`
        )
        const winnerSnap = await resultRef.child(`seat`).once("value")
        const actualWinner = winnerSnap.val()
        assert.equal(
          actualWinner,
          expectedWinner,
          `The winner of card ${card} should be ${expectedWinner}, but was ${actualWinner}`
        )
      })
      it("chooses bidder 1 over 0 for card 0 in round 1 with no bids", async function () {
        const pin = 1251
        const size = 2
        const round = 2
        const card = 0
        const expectedWinner = 1
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob)
        const everyoneReady = { alice: round, bob: round }
        await setDataAndCallWrappedFunction(pin, everyoneReady)
        const resultRef = adminDatabase.ref(
          `auctions/${pin}/results/rounds/${round}/${card}`
        )
        const winnerSnap = await resultRef.child(`seat`).once("value")
        const actualWinner = winnerSnap.val()
        assert.equal(
          actualWinner,
          expectedWinner,
          `The winner of card ${card} should be ${expectedWinner}, but was ${actualWinner}`
        )
      })
      it("chooses bidder 1 over 0 for card 0 in round 3 with no bids", async function () {
        const pin = 1252
        const size = 2
        const round = 4
        const card = 0
        const expectedWinner = 1
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob)
        const everyoneReady = { alice: round, bob: round }
        await setDataAndCallWrappedFunction(pin, everyoneReady)
        const resultRef = adminDatabase.ref(
          `auctions/${pin}/results/rounds/${round}/${card}`
        )
        const winnerSnap = await resultRef.child(`seat`).once("value")
        const actualWinner = winnerSnap.val()
        assert.equal(
          actualWinner,
          expectedWinner,
          `The winner of card ${card} should be ${expectedWinner}, but was ${actualWinner}`
        )
      })
      it("chooses bidder 0 over 1,2 for card 0 in round 3 with no bids", async function () {
        const pin = 1253
        const size = 3
        const round = 4
        const card = 0
        const expectedWinner = 0
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob, carl)
        const everyoneReady = { alice: round, bob: round, carl: round }
        await setDataAndCallWrappedFunction(pin, everyoneReady)
        const resultRef = adminDatabase.ref(
          `auctions/${pin}/results/rounds/${round}/${card}`
        )
        const winnerSnap = await resultRef.child(`seat`).once("value")
        const actualWinner = winnerSnap.val()
        assert.equal(
          actualWinner,
          expectedWinner,
          `The winner of card ${card} should be ${expectedWinner}, but was ${actualWinner}`
        )
      })
      it("chooses bidder 0 over 1 for card 0 in round 1 when bidder 0 did bid")
      it("chooses bidder 1 over 0 for card 0 in round 2 when bidder 1 did bid")

      // winningBids
      it("finds 0 to be best bid for card 0 with no bids", async function () {
        const pin = 1254
        const size = 2
        const round = 1
        const card = 0
        const expectedWinningBid = 0
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob)
        const everyoneReady = { alice: round, bob: round }
        await setDataAndCallWrappedFunction(pin, everyoneReady)
        const resultRef = adminDatabase.ref(
          `auctions/${pin}/results/rounds/${round}/${card}`
        )
        const bidSnap = await resultRef.child(`bid`).once("value")
        const actualBid = bidSnap.val()
        assert.equal(
          actualBid,
          expectedWinningBid,
          `The winning bid for card ${card} should be ${expectedWinningBid}, but was ${actualBid}`
        )
      })
      it("finds 1 to be best bid for card 0 with bid of 1 from bidder 0")
      it(
        "finds 2 to be best bid for card 0 with bids of 1 from bidder 0 and 2 from bidder 1"
      )
      it("can choose different winners for different rounds")
      it("can choose different winners for different cards")
      it("chooses the richest bidder if the bids are tied")
      it("chooses the richest bidder only among the tied bidders")
    })
  })
})
