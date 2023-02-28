const assert = require("assert/strict")
const { adminDatabase, test } = require("./setupFunctionsTesting.js")
const { createAuction } = require("../../functions/index.js")
const alice = "alice"
const newestPinRef = adminDatabase.ref("newestPin")
const indexAlicePinRef = adminDatabase.ref(`index/${alice}/pin`)

/**
 * Prepares the createAuction function with the auctionSize data and UID context.
 * @param {number} auctionSize The requested size of the auction
 * @param {string} uid The UID of the user writing the auctionSize
 */
async function callWrappedCreateAuction(auctionSize, uid) {
  const snap = test.database.makeDataSnapshot(
    auctionSize,
    `index/${uid}/auctionSize`
  )
  const context = { params: { uid: uid } }
  await test.wrap(createAuction)(snap, context)
}

describe("The function creating an auction", () => {
  describe("triggered by a size written to the index", () => {
    it("writes a PIN of 1 to the index and newestPin, when there is no newestPin", async function () {
      const expectedPin = 1
      await callWrappedCreateAuction(4, alice)
      const indexPinSnap = await indexAlicePinRef.once("value")
      assert.equal(
        indexPinSnap.val(),
        expectedPin,
        `The index PIN was ${indexPinSnap.val()}, but should be ${expectedPin}`
      )
      const newestPinSnap = await newestPinRef.once("value")
      assert.equal(
        newestPinSnap.val(),
        expectedPin,
        `The newest PIN was ${newestPinSnap.val()}, but should be ${expectedPin}`
      )
    })

    it("writes a PIN of 1 to the index and newestPin, when there is nonsense in newestPin", async function () {
      await newestPinRef.set("Nonsense, I tell you")
      const expectedPin = 1
      await callWrappedCreateAuction(4, alice)
      const indexPinSnap = await indexAlicePinRef.once("value")
      assert.equal(
        indexPinSnap.val(),
        expectedPin,
        `The index PIN was ${indexPinSnap.val()}, but should be ${expectedPin}`
      )
      const newestPinSnap = await newestPinRef.once("value")
      assert.equal(
        newestPinSnap.val(),
        expectedPin,
        `The newest PIN was ${newestPinSnap.val()}, but should be ${expectedPin}`
      )
    })

    it("writes a PIN of 11 to the index and newestPin, when newestPin was 1", async function () {
      await newestPinRef.set(1)
      const expectedPin = 11
      await callWrappedCreateAuction(3, alice)
      const indexPinSnap = await indexAlicePinRef.once("value")
      assert.equal(
        indexPinSnap.val(),
        expectedPin,
        `The index PIN was ${indexPinSnap.val()}, but should be ${expectedPin}`
      )
      const newestPinSnap = await newestPinRef.once("value")
      assert.equal(
        newestPinSnap.val(),
        expectedPin,
        `The newest PIN was ${newestPinSnap.val()}, but should be ${expectedPin}`
      )
    })

    it("writes a PIN of 121 to the index and newestPin, when newestPin was 11", async function () {
      await newestPinRef.set(11)
      const expectedPin = 121
      await callWrappedCreateAuction(4, alice)
      const indexPinSnap = await indexAlicePinRef.once("value")
      assert.equal(
        indexPinSnap.val(),
        expectedPin,
        `The index PIN was ${indexPinSnap.val()}, but should be ${expectedPin}`
      )
      const newestPinSnap = await newestPinRef.once("value")
      assert.equal(
        newestPinSnap.val(),
        expectedPin,
        `The newest PIN was ${newestPinSnap.val()}, but should be ${expectedPin}`
      )
    })

    it("writes a PIN of 1331 to the index of Bob and newestPin, when newestPin was 121", async function () {
      await newestPinRef.set(121)
      const expectedPin = 1331
      const bob = "bob"
      await callWrappedCreateAuction(4, bob)
      const indexPinRef = adminDatabase.ref(`index/${bob}/pin`)
      const indexPinSnap = await indexPinRef.once("value")
      assert.equal(
        indexPinSnap.val(),
        expectedPin,
        `The index PIN was ${indexPinSnap.val()}, but should be ${expectedPin}`
      )
      const newestPinSnap = await newestPinRef.once("value")
      assert.equal(
        newestPinSnap.val(),
        expectedPin,
        `The newest PIN was ${newestPinSnap.val()}, but should be ${expectedPin}`
      )
    })

    it("writes a PIN of 4668 to the index and newestPin, when newestPin was 1331", async function () {
      await newestPinRef.set(1331)
      const expectedPin = 4668
      await callWrappedCreateAuction(4, alice)
      const indexPinSnap = await indexAlicePinRef.once("value")
      assert.equal(
        indexPinSnap.val(),
        expectedPin,
        `The index PIN was ${indexPinSnap.val()}, but should be ${expectedPin}`
      )
      const newestPinSnap = await newestPinRef.once("value")
      assert.equal(
        newestPinSnap.val(),
        expectedPin,
        `The newest PIN was ${newestPinSnap.val()}, but should be ${expectedPin}`
      )
    })

    it("creates the auction data: round, date and size", async function () {
      const startOfTest = new Date().valueOf()
      await newestPinRef.set(2)
      const auctionSize = 4
      await callWrappedCreateAuction(auctionSize, alice)
      const auctionSnap = await adminDatabase.ref("auctions/22").once("value")
      const round = auctionSnap.child("round").val()
      assert.equal(round, 1, `The round was ${round}, but should be 1`)
      const actualTimestamp = auctionSnap.child("timestamp").val()
      assert(
        startOfTest <= actualTimestamp,
        `The test should have started at ${startOfTest} before the auction was created at ${actualTimestamp}`
      )
      const now = new Date().valueOf()
      assert(
        actualTimestamp <= now,
        `The auction should have been created at ${actualTimestamp}, earlier than now ${now}`
      )
      const actualSize = auctionSnap.child("size").val()
      assert.equal(
        actualSize,
        auctionSize,
        `The auctionSize should have been ${auctionSize}, but was ${actualSize}.`
      )
    })

    it("creates the auction data with different values", async function () {
      const startOfTest = new Date().valueOf()
      await newestPinRef.set(3)
      const auctionSize = 6
      await callWrappedCreateAuction(auctionSize, alice)
      const auctionSnap = await adminDatabase.ref("auctions/33").once("value")
      const round = auctionSnap.child("round").val()
      assert.equal(round, 1, `The round was ${round}, but should be 1`)
      const actualTimestamp = auctionSnap.child("timestamp").val()
      assert(
        startOfTest <= actualTimestamp,
        `The test should have started at ${startOfTest} before the auction was created at ${actualTimestamp}`
      )
      const now = new Date().valueOf()
      assert(
        actualTimestamp <= now,
        `The auction should have been created at ${actualTimestamp}, earlier than now ${now}`
      )
      const actualSize = auctionSnap.child("size").val()
      assert.equal(
        actualSize,
        auctionSize,
        `The auctionSize should have been ${auctionSize}, but was ${actualSize}.`
      )
    })

    it("doesn't overwrite another PIN in the index", async function () {
      await newestPinRef.set(1)
      const expectedPin = 11
      const auctionSize = 4
      await callWrappedCreateAuction(auctionSize, alice)
      await callWrappedCreateAuction(auctionSize, alice)
      const indexPin = await indexAlicePinRef.once("value")
      assert.equal(
        indexPin.val(),
        expectedPin,
        `PIN in index should be ${expectedPin}, but was ${indexPin.val()}.`
      )
      const newestPin = await newestPinRef.once("value")
      assert.equal(
        newestPin.val(),
        expectedPin,
        `The newestPin should be ${expectedPin}, but was ${newestPin.val()}.`
      )
      const auctionRef = adminDatabase.ref("auctions/" + expectedPin)
      const auction = await auctionRef.once("value")
      assert(
        auction.exists(),
        `There should have been an auction with PIN ${expectedPin}.`
      )
    })
  })
})
