import assert from "assert/strict"
import setup from "./setupFunctionsTesting.js"
const { adminDatabase, test } = setup
import functions from "../functions/index.js"
const { createAuction, createBidder } = functions

const wrappedCreateBidderFunction = test.wrap(createBidder)
const wrappedCreateAuctionFunction = test.wrap(createAuction)
const alice = "alice"
const bob = "bob"
const robot = "robot"

/**
 * Prepares the createAuction function with the auctionSize data and UID context.
 * The function is triggered by a user with uid "robot"
 * @param {number} auctionSize The requested size of the auction
 */
async function callWrappedCreateAuction(auctionSize) {
  const snap = test.database.makeDataSnapshot(
    auctionSize,
    `index/${robot}/auctionSize`
  )
  const context = { params: { uid: robot } }
  await wrappedCreateAuctionFunction(snap, context)
}

async function createAuctionAndGetPin(auctionSize) {
  await callWrappedCreateAuction(auctionSize)
  const indexRobotPinRef = adminDatabase.ref(`index/${robot}/pin`)
  const pinSnap = await indexRobotPinRef.once("value")
  return pinSnap.val()
}

/**
 * Prepares the createBidder function with the PIN data and UID context.
 * @param {number} pin The PIN to be inserted in the index
 * @param {string} uid The UID of the user writing the pin
 */
async function callWrappedCreateBidder(pin, uid) {
  const snap = test.database.makeDataSnapshot(pin, `index/${uid}/pin`)
  const context = { params: { uid: uid } }
  await wrappedCreateBidderFunction(snap, context)
}

function fakeAuctionCreation(pin, size) {
  const auctionSizeRef = adminDatabase.ref(`auctions/${pin}/size`)
  return auctionSizeRef.set(size)
}

describe("creating a new bidder, when writing a PIN to the index", function () {
  it("doesn't create the bidder if there is no auction", async function () {
    const pin = 1
    await callWrappedCreateBidder(pin, alice)
    const seatAliceRef = adminDatabase.ref(`auctions/${pin}/seats/${alice}`)
    const seat = await seatAliceRef.once("value")
    assert.equal(
      seat.exists(),
      false,
      `There was a seat in an nonexistant auction`
    )
  })
  it("sets the readiness of the bidder in the auction", async function () {
    const pin = await createAuctionAndGetPin(4)
    await callWrappedCreateBidder(pin, alice)
    const readyAliceRef = adminDatabase.ref(`auctions/${pin}/readys/${alice}`)
    const ready = await readyAliceRef.once("value")
    const actual = ready.val()
    const expected = -1
    assert.equal(
      actual,
      expected,
      `The ready value should have been ${expected}, but was ${actual}`
    )
  })
  it("works for Bob as well", async function () {
    const pin = await createAuctionAndGetPin(4)
    await callWrappedCreateBidder(pin, bob)
    const seatBobRef = adminDatabase.ref(`auctions/${pin}/seats/${bob}`)
    const seat = await seatBobRef.once("value")
    const actual = seat.exists()
    const expected = true
    assert.equal(actual, expected, `The seat should exist, but didn't`)
  })
  it("works for auctions that are not the first", async function () {
    const newestPinRef = adminDatabase.ref("newestPin")
    await newestPinRef.set(2)
    const pin = await createAuctionAndGetPin(4)
    await callWrappedCreateBidder(pin, alice)
    const seatAliceRef = adminDatabase.ref(`auctions/${pin}/seats/${alice}`)
    const seat = await seatAliceRef.once("value")
    const actual = seat.exists()
    const expected = true
    assert.equal(actual, expected, `The seat should exist, but didn't`)
  })
  it("puts the bidder in seat 0 when it's the only seat in the auction", async function () {
    const pin = 3
    const size = 1
    await fakeAuctionCreation(pin, size)
    await callWrappedCreateBidder(pin, alice)
    const seatRef = adminDatabase.ref(`auctions/${pin}/seats/${alice}`)
    const seat = await seatRef.once("value")
    const actual = seat.val()
    const expected = 0
    assert.equal(
      actual,
      expected,
      `The seat should have been ${expected}, but was ${actual}`
    )
  })
  it("puts the first bidder in seat 0 in an auction with size 2 and even PIN", async function () {
    const pin = 12
    const size = 2
    await fakeAuctionCreation(pin, size)
    await callWrappedCreateBidder(pin, alice)
    const seatRef = adminDatabase.ref(`auctions/${pin}/seats/${alice}`)
    const seat = await seatRef.once("value")
    const actual = seat.val()
    const expected = 0
    assert.equal(
      actual,
      expected,
      `The seat should have been ${expected}, but was ${actual}`
    )
  })
  it("puts the first bidder in seat 1 in an auction with size 2 and odd PIN", async function () {
    const pin = 11
    const size = 2
    await fakeAuctionCreation(pin, size)
    await callWrappedCreateBidder(pin, bob)
    const seatRef = adminDatabase.ref(`auctions/${pin}/seats/${bob}`)
    const seat = await seatRef.once("value")
    const actual = seat.val()
    const expected = 1
    assert.equal(
      actual,
      expected,
      `The seat should have been ${expected}, but was ${actual}`
    )
  })
  it("puts the second bidder in seat 1 in an auction with size 2 and even PIN", async function () {
    const pin = 14
    const size = 2
    await fakeAuctionCreation(pin, size)
    await callWrappedCreateBidder(pin, alice)
    await callWrappedCreateBidder(pin, bob)
    const seatRef = adminDatabase.ref(`auctions/${pin}/seats/${bob}`)
    const seat = await seatRef.once("value")
    const actual = seat.val()
    const expected = 1
    assert.equal(
      actual,
      expected,
      `The seat should have been ${expected}, but was ${actual}`
    )
  })
  it("distributes seats to three bidders", async function () {
    const pin = 9
    const size = 3
    const carl = "carl"
    await fakeAuctionCreation(pin, size)
    await callWrappedCreateBidder(pin, alice)
    await callWrappedCreateBidder(pin, bob)
    await callWrappedCreateBidder(pin, carl)
    const seatsRef = adminDatabase.ref(`auctions/${pin}/seats`)
    const seatsSnap = await seatsRef.once("value")
    const actual = seatsSnap.val()
    const expected = {
      alice: 0,
      bob: 2,
      carl: 1,
    }
    assert.deepEqual(
      actual,
      expected,
      `The seat should have been ${expected}, but was ${actual}`
    )
  })
  it("adds the bidder to the scoreboard with 200 points", async function () {
    const pin = 9
    const size = 4
    await fakeAuctionCreation(pin, size)
    await callWrappedCreateBidder(pin, alice)
    const seat = pin % size
    const scoreboardRef = adminDatabase.ref(
      `auctions/${pin}/scoreboard/${seat}`
    )
    const scoreSnap = await scoreboardRef.once("value")
    const actual = scoreSnap.val()
    const expected = 200
    assert.equal(
      actual,
      expected,
      `The scoreboard should have said ${expected}, but said ${actual}`
    )
  })
  it("won't recalculate the seat if the bidder already has one", async function () {
    const pin = 11
    const size = 4
    await fakeAuctionCreation(pin, size)
    await callWrappedCreateBidder(pin, alice)
    const seatRef = adminDatabase.ref(`auctions/${pin}/seats/${alice}`)
    let seat = await seatRef.once("value")
    const expected = seat.val()
    await callWrappedCreateBidder(pin, alice)
    seat = await seatRef.once("value")
    const actual = seat.val()
    assert.equal(
      actual,
      expected,
      `The seat should have been ${expected}, but was ${actual}`
    )
  })
  it.skip("writes an error message in the index if there isn't room in the auction", async function () {
    const pin = 11
    const size = 1
    await fakeAuctionCreation(pin, size)
    await callWrappedCreateBidder(pin, alice)
    await callWrappedCreateBidder(pin, bob)
    const errorRef = adminDatabase.ref(`index/${bob}/error`)
    const errorSnap = await errorRef.once("value")
    const actual = errorSnap.val()
    const expected = 1 //Message text
    assert.equal(
      actual,
      expected,
      `The error should have said ${expected}, but said ${actual}`
    )
  })
  it.skip("writes an error message in the index if there is no auction", async function () {
    await callWrappedCreateBidder(11, alice)
    const errorRef = adminDatabase.ref(`index/${alice}/error`)
    const errorSnap = await errorRef.once("value")
    const actual = errorSnap.val()
    const expected = 2
    assert.equal(
      actual,
      expected,
      `The error should have said ${expected}, but said ${actual}`
    )
  })
})
