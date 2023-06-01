/**
 * @param {import("firebase-functions").Change<import("firebase-functions").database.DataSnapshot>} readysChange
 * @param {import("firebase-functions").EventContext} context
 */
module.exports = async function findWinners(readysChange, context) {
  try {
    const auctionRef = readysChange.after.ref.parent
    if (!auctionRef) {
      console.error("Error BlAuDr: readysChange doesn't have a auctionRef: ")
      console.error(readysChange)
      return
    }
    const roundRef = auctionRef.child("round")
    const round = await roundRef.get().then((snap) => snap.val())
    if (typeof round !== "number") {
      console.error("Error BlAuDr: database/round is not a number: ")
      console.error(round)
      return
    }

    const everyoneIsReady = await checkReadiness(roundRef, readysChange.after)
    if (!everyoneIsReady) return

    const bids = await auctionRef
      .child("bids")
      .get()
      .then((snap) => snap.val())
    if (!bids) {
      console.error("Error BlAuDr: database/bids is null or undefined")
      return
    }
    const orderedBidders = await sortCustom(auctionRef, round)
    const seats = await auctionRef
      .child("seats")
      .get()
      .then((snap) => snap.val())
    if (!seats) {
      console.error("Error BlAuDr: database/seats is null or undefined")
      return
    }
    let winnersAndBids = getDefaultWinnerAndBids(seats[orderedBidders[0]])

    for (const uid of orderedBidders) {
      /** @type {[number]} */
      const bidsFromBidder = bids[uid]
      bidsFromBidder.forEach((bid, card) => {
        if (bid > winnersAndBids[card].bid) {
          winnersAndBids[card] = {
            seat: seats[uid],
            bid: bid,
          }
        }
      })
    }
    const scoreboardRef = auctionRef.child("scoreboard")
    const scoreboard = await scoreboardRef.get().then((snap) => snap.val())
    if (!scoreboard) {
      console.error("Error BlAuDr: database/scoreboard is null or undefined")
      return
    }
    for (const winnerAndBid of Object.values(winnersAndBids)) {
      scoreboard[winnerAndBid.seat] -= winnerAndBid.bid
    }

    const resultRoundRef = auctionRef.child(`results/rounds/${round}`)
    return Promise.all([
      resultRoundRef.set(winnersAndBids),
      scoreboardRef.set(scoreboard),
    ])
  } catch (error) {
    console.error("Error BlAuDr in findWinners: ", error)
  }
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
  if (!seats) {
    console.error("Error BlAuDr: database/seats is null or undefined")
    return []
  }
  const bidders = Object.keys(seats)
  const size = bidders.length
  const scoreboard = await auctionRef
    .child("scoreboard")
    .get()
    .then((snap) => snap.val())
  if (!scoreboard) {
    console.error("Error BlAuDr: database/scoreboard is null or undefined")
    return []
  }
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
  for (let i = 0; i <= 14; i++) {
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
    if (transactionResult.committed) {
      if (transactionResult.snapshot.exists()) {
        return true
      } else {
        console.error(
          "Error BlAuDr: Transaction on roundRef failed: ",
          transactionResult
        )
      }
    }
    return false
  })
}

/**
 * Returns a reduced function for use in transactions on the round-reference.
 * @param {import("firebase-functions").database.DataSnapshot} readySnap The current readys, used to reduce the function
 */
function readyCheckerReducer(readySnap) {
  const valuesFromReadys = Object.values(readySnap.val())
  /**
   * The reduced function to be used in a transaction-call
   * @param {any} previousRound The current value at the round-reference - or nothing on the first pass
   * @returns {any} The next round to write in the database - or nothing if input is not valid
   */
  return function (previousRound) {
    if (typeof previousRound != "number") {
      return previousRound
    }
    const everyoneReady = valuesFromReadys.every(
      (value) => value === previousRound
    )
    if (everyoneReady) {
      return previousRound + 1
    } else return
  }
}
