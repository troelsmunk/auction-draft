/**
 * @param {import("firebase-functions").Change<import("firebase-functions").database.DataSnapshot>} readysChange
 * @param {import("firebase-functions").EventContext} context
 */
module.exports = async function findWinners(readysChange, context) {
  try {
    if (!readysChange || !readysChange.after || !readysChange.after.ref) {
      console.error("Invalid readysChange object: ", readysChange)
      return
    }
    const auctionRef = readysChange.after.ref.parent
    const roundRef = auctionRef.child("round")
    const currentRound = await roundRef.get().then((snap) => snap.val())
    if (typeof currentRound !== "number") {
      console.error("'round' from the database is not a number: ", currentRound)
      return
    }

    const everyoneIsReady = await checkReadiness(roundRef, readysChange.after)
    if (!everyoneIsReady) {
      console.log("Not everyone is ready yet. Skipping winners calculation.")
      return
    }

    const bids = await auctionRef
      .child("bids")
      .get()
      .then((snap) => snap.val())
    if (!bids) {
      console.error("'bids' from the database is null or undefined")
      return
    }
    const orderedBidders = await sortCustom(auctionRef, currentRound)
    const seats = await auctionRef
      .child("seats")
      .get()
      .then((snap) => snap.val())
    if (!seats) {
      console.error("'seats' from the database is null or undefined")
      return
    }
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
    if (!scoreboard) {
      console.error("'scoreboard' from the database is null or undefined")
      return
    }
    for (const winnerAndBid of Object.values(winnersAndBids)) {
      scoreboard[winnerAndBid.seat] -= winnerAndBid.bid
    }

    const resultRoundRef = auctionRef.child(`results/rounds/${currentRound}`)
    return Promise.all([
      resultRoundRef.set(winnersAndBids),
      scoreboardRef.set(scoreboard),
    ])
  } catch (error) {
    console.error("Error while finding winners or writing scoreboard: ", error)
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
    console.error("'seats' from the database is null or undefined")
    return
  }
  const bidders = Object.keys(seats)
  const size = bidders.length
  const scoreboard = await auctionRef
    .child("scoreboard")
    .get()
    .then((snap) => snap.val())
  if (!scoreboard) {
    console.error("'scoreboard' from the database is null or undefined")
    return
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
    if (transactionResult.committed && transactionResult.snapshot.exists()) {
      return true
    } else {
      console.error(
        "Transaction on roundRef failed with result: ",
        transactionResult
      )
      return false
    }
  })
}

/**
 * @param {import("firebase-functions").database.DataSnapshot} readySnap
 */
function readyCheckerReducer(readySnap) {
  const valuesFromReadys = Object.values(readySnap.val())
  return function (previousRound) {
    if (typeof previousRound != "number") {
      // First pass of the transaction receives an empty object
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
