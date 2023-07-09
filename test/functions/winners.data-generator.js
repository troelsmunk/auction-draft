const { adminDatabase, test } = require("./setupFunctionsTesting")
const { findWinners } = require("../../functions")
const winnerWrapped = test.wrap(findWinners)

/** Fake an auction by setting size and round
 * with a given PIN
 * @param {number} pin
 * @param {number} size
 * @param {number} round
 */
function initFakeAuction(pin, size, round) {
  const auctionRef = adminDatabase.ref(`auctions/${pin}`)
  const sizeRef = auctionRef.child("size")
  const roundRef = auctionRef.child("round")
  return Promise.all([sizeRef.set(size), roundRef.set(round)])
}

/** Fake a set of bidders in a given auction.
 * The bidders are set as unready, with 200 points and seated in the order listed
 * Also bids are set as zeroes
 * @param {number} pin
 * @param {string[]} uids
 */
function signUpFakeBidders(pin, ...uids) {
  const auctionRef = adminDatabase.ref(`auctions/${pin}`)
  const seatsRef = auctionRef.child("seats")
  const readysRef = auctionRef.child("readys")
  const scoreboardRef = auctionRef.child("scoreboard")
  const bidsRef = auctionRef.child("bids")
  let noOneReady = {}
  let seats = {}
  let scoreboard = {}
  let bids = {}
  const zeroBids = new Array(15).fill(0)
  uids.forEach((uid, index) => {
    noOneReady[uid] = -1
    seats[uid] = index
    scoreboard[index] = 200
    bids[uid] = zeroBids
  })
  return Promise.all([
    seatsRef.set(seats),
    readysRef.set(noOneReady),
    scoreboardRef.set(scoreboard),
    bidsRef.set(bids),
  ])
}

/** These test-helpers assume that the
 * functions-under-test use:
 *    - the relevant data in the database
 *    - the "after"-state of the change object
 * but not:
 *    - the "before"-state of the change object
 * This means "before" is not needed in
 * test.makeChange(before, after)
 */
/** Call the wrapped findWinners functions with the given readys. Since this test
 * snapshot doesn't actually affect the database, the same data is written to the
 * database at the beginning of this helper. This way the function has access to
 * the same data in the test as it would have in with a real data change
 * @param {number} pin
 * @param {any} readysToBeSet
 */
async function setDataAndCallWrappedFunction(pin, readysToBeSet) {
  const pathToReadys = `auctions/${pin}/readys`
  await adminDatabase.ref(pathToReadys).set(readysToBeSet)
  const context = { params: { pin: pin } }
  const readysSnap = test.database.makeDataSnapshot(readysToBeSet, pathToReadys)
  return winnerWrapped(test.makeChange(readysSnap, readysSnap), context)
}

/**
 *
 * @param {number} pin
 * @param {string} uid
 * @param {[number]} bid
 */
async function setBid(pin, uid, bid) {
  const bidRef = adminDatabase.ref(`auctions/${pin}/bids/${uid}`)
  return bidRef.set(bid)
}

module.exports = {
  initFakeAuction,
  signUpFakeBidders,
  setDataAndCallWrappedFunction,
  setBid,
}
