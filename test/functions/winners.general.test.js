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
      it("doesn't produce more bidders in the readys", async function () {
        const pin = 1236
        const size = 2
        const round = 1
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob)
        const everybodyReady = { alice: round, bob: round }
        await setDataAndCallWrappedFunction(pin, everybodyReady)

        const readyRef = adminDatabase.ref(`auctions/${pin}/readys`)
        const readySnap = await readyRef.once("value")
        const actual = readySnap.numChildren()
        assert.equal(
          actual,
          size,
          `The number of bidders in readys should have been ${size}, but was ${actual}`
        )
      })
      it("sets Alice and Bob as unready, when both are ready for round 1", async function () {
        const pin = 1241
        const size = 2
        const round = 1
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob)
        const aliceBobReady = { alice: round, bob: round }
        await setDataAndCallWrappedFunction(pin, aliceBobReady)

        const aliceReadyRef = adminDatabase.ref(
          `auctions/${pin}/readys/${alice}`
        )
        const aliceReadySnap = await aliceReadyRef.once("value")
        const actual = aliceReadySnap.val()
        assert.equal(
          actual,
          -1,
          `Alice should have readiness -1, but had ${actual}`
        )
        const bobReadyRef = adminDatabase.ref(`auctions/${pin}/readys/${bob}`)
        const bobReadySnap = await bobReadyRef.once("value")
        const bobActual = bobReadySnap.val()
        assert.equal(
          bobActual,
          -1,
          `Bob should have readiness -1, but had ${bobActual}`
        )
      })
      it("sets Alice as unready when both are ready for round 2", async function () {
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
          -1,
          `Alice's readiness should be -1, but was ${actual}`
        )
      })
      it("sets Carl to unready when all three are ready for round 1", async function () {
        const pin = 1243
        const size = 3
        const round = 1
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob, carl)
        const everybodyReady = { alice: round, bob: round, carl: round }
        await setDataAndCallWrappedFunction(pin, everybodyReady)

        const carlReadyRef = adminDatabase.ref(`auctions/${pin}/readys/${carl}`)
        const carlReadySnap = await carlReadyRef.once("value")
        const actual = carlReadySnap.val()
        assert.equal(
          actual,
          -1,
          `Carl should have readiness -1, but had ${actual}`
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
