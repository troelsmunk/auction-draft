// Jeg har skrevet testene ud fra en antagelse om at funktionen ikke bruger change.before, men kun change.after
// samt databasen som den ser ud lige før wrappet, altså resultatet af setup og real data som skal sørge for at
// den simulerede data er repræsenteret i databasen og ikke kun i den simulerede, wrappede data

const { adminDatabase, test } = require("./setupFunctionsTesting")
const { findWinners } = require("../../functions")
const winnerWrapped = test.wrap(findWinners)

/** Mimic the createAuction function by setting size and round for an auction
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

/** Mimic the createBidder function by adding the bidders to the given auction.
 * The bidders are set as unready, with 200 points and seated in the order listed
 * @param {number} pin
 * @param {string[]} uids
 */
function signUpFakeBidders(pin, ...uids) {
  const auctionRef = adminDatabase.ref(`auctions/${pin}`)
  const seatsRef = auctionRef.child("seats")
  const readysRef = auctionRef.child("readys")
  const scoreboardRef = auctionRef.child("scoreboard")
  let noOneReady = {}
  let seats = {}
  let scoreboard = {}
  for (let index = 0; index < uids.length; index++) {
    const uid = uids[index]
    noOneReady[uid] = -1
    seats[uid] = index
    scoreboard[index] = 200
  }
  return Promise.all([
    seatsRef.set(seats),
    readysRef.set(noOneReady),
    scoreboardRef.set(scoreboard),
  ])
}

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
 * @param {number} round
 * @param {number} seat
 * @param {object} bid
 */
function setBid(pin, round, seat, bid) {
  const bidRef = adminDatabase.ref(
    `auctions/${pin}/bids/rounds/${round}/${seat}`
  )
  return bidRef.set(bid)
}

module.exports = {
  initFakeAuction,
  signUpFakeBidders,
  setDataAndCallWrappedFunction,
  setBid,
}
