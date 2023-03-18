/**
 * @param {import("firebase-functions").Change<import("firebase-functions").database.DataSnapshot>} readysChange
 * @param {import("firebase-functions").EventContext} context
 */
module.exports = async function findWinners(readysChange, context) {
  const readysRef = readysChange.after.ref
  const auctionRef = readysRef.parent
  const roundRef = auctionRef.child("round")
  const currentRound = await roundRef.get().then((snap) => snap.val())

  const everyoneIsReady = await checkReadiness(roundRef, readysChange.after)
  if (!everyoneIsReady) return

  const bids = await auctionRef
    .child("bids")
    .get()
    .then((snap) => snap.val())
  const orderedBidders = await sortCustom(auctionRef, currentRound)
  const seats = await auctionRef
    .child("seats")
    .get()
    .then((snap) => snap.val())
  let winnersAndBids = getDefaultWinnerAndBids(seats[orderedBidders[0]])

  for (const uid of orderedBidders) {
    for (const [card, bid] of Object.entries(bids[uid])) {
      if (bid > winnersAndBids[card].bid) {
        winnersAndBids[card] = {
          seat: seats[uid],
          bid: bid,
        }
      }
    }
  }
  const scoreboardRef = auctionRef.child("scoreboard")
  const scoreboard = await scoreboardRef.get().then((snap) => snap.val())
  for (const winnerAndBid of Object.values(winnersAndBids)) {
    scoreboard[winnerAndBid.seat] -= winnerAndBid.bid
  }

  const resultRoundRef = auctionRef.child(`results/rounds/${currentRound}`)
  return Promise.all([
    resultRoundRef.set(winnersAndBids),
    scoreboardRef.set(scoreboard),
  ])
}

/**
 * @param {import("@firebase/database-types").Reference} auctionRef
 * @param {number} round
 * @returns {Promise<string[]>}
 */
async function sortCustom(auctionRef, round) {
  const seats = await auctionRef
    .child("seats")
    .get()
    .then((snap) => snap.val())
  const bidders = Object.keys(seats)
  const size = bidders.length
  const scoreboard = await auctionRef
    .child("scoreboard")
    .get()
    .then((snap) => snap.val())
  bidders.sort((uidA, uidB) => {
    const prioA = (((seats[uidA] + 1 - round) % size) + size) % size
    const prioB = (((seats[uidB] + 1 - round) % size) + size) % size
    return prioA - prioB
  })
  bidders.sort((uidA, uidB) => {
    return scoreboard[seats[uidB]] - scoreboard[seats[uidA]]
  })
  return bidders
}

function getDefaultWinnerAndBids(seat) {
  const defaultWinnerAndBids = {
    seat: seat,
    bid: 0,
  }
  let winnersAndBids = {}
  for (let i = 1; i <= 15; i++) {
    winnersAndBids[i] = defaultWinnerAndBids
  }
  return winnersAndBids
}

/**
 * @param {import("@firebase/database-types").Reference} roundRef
 * @param {import("firebase-functions").database.DataSnapshot} readysAfterChange
 * @returns {Promise<boolean>}
 */
async function checkReadiness(roundRef, readysAfterChange) {
  const readyChecker = readyCheckerReducer(readysAfterChange)
  return roundRef.transaction(readyChecker).then((transactionResult) => {
    return transactionResult.committed && transactionResult.snapshot.exists()
  })
}

/**
 * @param {import("firebase-functions").database.RefBuilder} readySnap
 */
function readyCheckerReducer(readySnap) {
  return function (previousRound) {
    console.log("checking readyness. previousRound: " + previousRound)
    if (typeof previousRound != "number") return previousRound
    const readyObject = readySnap.val()
    const readys = Object.values(readyObject)
    const everyoneReady = readys.every((value) => value == previousRound)
    if (everyoneReady) return previousRound + 1
    else return
  }
}
