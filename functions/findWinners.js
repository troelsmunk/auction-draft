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
  console.log("everyone is ready: " + everyoneIsReady)
  if (!everyoneIsReady) return

  const bids = await auctionRef
    .child("bids")
    .get()
    .then((snap) => snap.val())
  const orderedBidders = await sortCustom(auctionRef, currentRound)
  console.log("orderedBidders: " + orderedBidders)
  let winnersAndBids = getDefaultWinnerAndBids(orderedBidders[0])

  for (const uid of orderedBidders) {
    for (const [card, bid] of Object.entries(bids[uid])) {
      // console.log(`User bid ${bid} on card ${card} with uid ${uid}`)
      if (bid > winnersAndBids[card].bid) {
        winnersAndBids[card] = {
          uid: uid,
          bid: bid,
        }
      }
    }
  }

  const resultRoundRef = auctionRef.child(`results/rounds/${currentRound}`)
  return resultRoundRef.set(winnersAndBids)
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

function getDefaultWinnerAndBids(firstUid) {
  const defaultWinnerAndBids = {
    uid: firstUid,
    bid: 0,
  }
  let winnersAndBids = {}
  for (let i = 1; i <= 15; i++) {
    winnersAndBids[i] = defaultWinnerAndBids
  }
  return winnersAndBids
}

/**
 * @param {object} seats
 * @param {number} round
 * @returns {(uid: string) => number}
 */
function priorityReducer(seats, round) {
  const auctionSize = seats.length
  return function (uid) {
    return (seats[uid] + round + auctionSize) % auctionSize
  }
}

/**
 * @param {object} seats
 * @param {object} scoreboard
 * @returns {(uid: string) => number}
 */
function scoreReducer(seats, scoreboard) {
  return function (uid) {
    return scoreboard[seats[uid]]
  }
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
