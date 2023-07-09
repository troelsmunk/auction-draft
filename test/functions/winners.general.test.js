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
    describe("where everyone is ready", function () {
      it("leaves the readiness in place when all are ready", async function () {
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
    })
  })
})
