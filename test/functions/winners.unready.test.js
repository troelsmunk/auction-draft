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
      it("doesn't change the round when Bob is ready for round 1, but Alice is not", async function () {
        const pin = 1234
        const size = 2
        const round = 1
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob)
        const bobReady = { alice: -1, bob: round }
        await setDataAndCallWrappedFunction(pin, bobReady)

        const actualRound = await adminDatabase
          .ref(`auctions/${pin}/round`)
          .get()
          .then((snap) => snap.val())
        assert.equal(
          actualRound,
          round,
          `The round should be ${round}, but it was ${actualRound}`
        )
      })
      it("doesn't change the round when Alice is ready for round 2, but Bob is ready for round 1", async function () {
        const pin = 1237
        const size = 2
        const round = 2
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob)
        const readyForDiffRounds = { alice: round, bob: 1 }
        await setDataAndCallWrappedFunction(pin, readyForDiffRounds)

        const actualRound = await adminDatabase
          .ref(`auctions/${pin}/round`)
          .get()
          .then((snap) => snap.val())
        assert.equal(
          actualRound,
          round,
          `The round should still be ${round}, but it was ${actualRound}`
        )
      })
      it.skip("TODO: leaves Alice as ready if Bob has not yet joined the auction", async function () {
        const pin = 1238
        const size = 2
        const round = 1
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice)
        const aliceReady = { alice: round }
        await setDataAndCallWrappedFunction(pin, aliceReady)

        const actualRound = await adminDatabase
          .ref(`auctions/${pin}/round`)
          .get()
          .then((snap) => snap.val())
        assert.equal(
          actualRound,
          round,
          `The round should still be ${round}, but it was ${actualRound}`
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
    })
  })
})
