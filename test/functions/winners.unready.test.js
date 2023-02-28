const assert = require("assert/strict")
const { adminDatabase } = require("./setupFunctionsTesting.js")
const {
  initFakeAuction,
  setDataAndCallWrappedFunction,
  signUpFakeBidders,
} = require("./winners.data-generator")
const alice = "alice"
const bob = "bob"

describe("The function determining the auction winners", function () {
  describe("triggered by a change to readiness", function () {
    describe("where not everyone is ready", function () {
      it("doesn't set Bob as unready when he is ready for round 1 and Alice is not", async function () {
        const pin = 1234
        const size = 2
        const round = 1
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob)
        const bobReady = { alice: -1, bob: round }
        await setDataAndCallWrappedFunction(pin, bobReady)

        const bobReadyRef = adminDatabase.ref(`auctions/${pin}/readys/${bob}`)
        const bobReadySnap = await bobReadyRef.once("value")
        const actual = bobReadySnap.val()
        assert.equal(
          actual,
          round,
          `Bob should have readiness ${round}, but had ${actual}`
        )
      })
      it("doesn't set Alice as unready when she is ready for round 1 and Bob is not", async function () {
        const pin = 1235
        const size = 2
        const round = 1
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob)
        const aliceReady = { alice: round, bob: -1 }
        await setDataAndCallWrappedFunction(pin, aliceReady)

        const aliceReadyRef = adminDatabase.ref(
          `auctions/${pin}/readys/${alice}`
        )
        const aliceReadySnap = await aliceReadyRef.once("value")
        const actual = aliceReadySnap.val()
        assert.equal(
          actual,
          round,
          `Alice should have readiness ${round}, but had ${actual}`
        )
      })
      it("leaves Alice as ready for round 2 when Bob is ready for round 1", async function () {
        const pin = 1237
        const size = 2
        const round = 2
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob)
        const readyForDiffRounds = { alice: round, bob: 1 }
        await setDataAndCallWrappedFunction(pin, readyForDiffRounds)

        const aliceReadyRef = adminDatabase.ref(
          `auctions/${pin}/readys/${alice}`
        )
        const readySnap = await aliceReadyRef.once("value")
        const actual = readySnap.val()
        assert.equal(
          actual,
          round,
          `Alice's readiness should still be ${round}, but was ${actual}`
        )
      })
      it("leaves Alice as ready if Bob has not yet joined the auction", async function () {
        const pin = 1238
        const size = 2
        const round = 1
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice)
        const aliceReady = { alice: round }
        await setDataAndCallWrappedFunction(pin, aliceReady)

        const aliceReadyRef = adminDatabase.ref(
          `auctions/${pin}/readys/${alice}`
        )
        const readySnap = await aliceReadyRef.once("value")
        const actual = readySnap.val()
        assert.equal(
          actual,
          round,
          `Alice's readiness should still be ${round}, but was ${actual}`
        )
      })
      it("doesn't post a result when not every bidder is ready", async function () {
        const pin = 1239
        const size = 2
        const round = 1
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob)
        const aliceReady = { alice: round, bob: -1 }
        await setDataAndCallWrappedFunction(pin, aliceReady)
        const resultRef = adminDatabase.ref(
          `auctions/${pin}/results/rounds/${round}`
        )
        const resultSnap = await resultRef.once("value")
        const actual = resultSnap.exists()
        assert.equal(actual, false, `The result shouldn't exist, but did`)
      })
      it("doesn't change the scoreboard after round 0")
      it("doesn't change the round when Alice is ready, but Bob is not", async function () {
        const pin = 1240
        const size = 2
        const round = 1
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob)
        const everyoneReady = { alice: round, bob: -1 }
        await setDataAndCallWrappedFunction(pin, everyoneReady)

        const roundRef = adminDatabase.ref(`auctions/${pin}/round`)
        const roundSnap = await roundRef.once("value")
        const actual = roundSnap.val()
        assert.equal(
          actual,
          round,
          `The round should have been ${round}, but was ${actual}`
        )
      })
    })
  })
})
