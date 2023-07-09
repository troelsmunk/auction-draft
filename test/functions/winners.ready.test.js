const assert = require("assert/strict")
const { adminDatabase } = require("./setupFunctionsTesting.js")
const {
  initFakeAuction,
  setDataAndCallWrappedFunction,
  signUpFakeBidders,
} = require("./winners.data-generator.js")
const alice = "alice"
const bob = "bob"
const carl = "carl"

describe("The function determining the auction winners", function () {
  describe("triggered by a change to readiness", function () {
    describe("where everyone is ready with zero-bids", function () {
      it("leaves the readiness in place", async function () {
        const pin = 1242
        const size = 2
        const round = 2
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob)
        const everyoneReady = { alice: round, bob: round }
        await setDataAndCallWrappedFunction(pin, everyoneReady)

        const aliceReadyRef = adminDatabase.ref(
          `auctions/${pin}/readys/${alice}`
        )
        const readySnap = await aliceReadyRef.once("value")
        const actual = readySnap.val()
        assert.equal(
          actual,
          round,
          `Alice's readiness should be ${round}, but was ${actual}`
        )
      })
      it("updates the round from 1 to 2", async function () {
        const pin = 1244
        const size = 2
        const round = 1
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob)
        const everyoneReady = { alice: round, bob: round }
        await setDataAndCallWrappedFunction(pin, everyoneReady)

        const roundRef = adminDatabase.ref(`auctions/${pin}/round`)
        const roundSnap = await roundRef.once("value")
        const actual = roundSnap.val()
        const expected = 2
        assert.equal(
          actual,
          expected,
          `The round should have been ${expected}, but was ${actual}`
        )
      })
      it("increases the round by 1", async function () {
        const pin = 1245
        const size = 2
        const round = 2
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob)
        const everyoneReady = { alice: round, bob: round }
        await setDataAndCallWrappedFunction(pin, everyoneReady)

        const roundRef = adminDatabase.ref(`auctions/${pin}/round`)
        const roundSnap = await roundRef.once("value")
        const actual = roundSnap.val()
        const expected = 3
        assert.equal(
          actual,
          expected,
          `The round should have been ${expected}, but was ${actual}`
        )
      })
      it("finds some result for round 1", async function () {
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
      it("finds some result for round 2", async function () {
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
      it("finds som result for the first card", async function () {
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
      it("finds a winner and winning bid for the first card", async function () {
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
          `The result should have values for card 0, but didn't`
        )
      })
      it("chooses Alice over Bob in round 1, by priority", async function () {
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
      it("chooses Bob over Alice in round 2, by priority", async function () {
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
      it("chooses Bob over Alice in round 4, by priority", async function () {
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
      it("chooses Alice over Bob and Carl in round 4, by priority", async function () {
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
      it("finds 0 to be best bid for card 0", async function () {
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
    })
  })
})
