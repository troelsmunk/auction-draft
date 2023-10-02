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
    const resultRoundRef = auctionRef.child(`results/rounds/${round}`)
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
    const seats = await auctionRef
      .child("seats")
      .get()
      .then((snap) => snap.val())
    if (!seats) {
      console.error("Error BlAuDr: database/seats is null or undefined")
      return
    }
    const scoreboardRef = auctionRef.child("scoreboard")
    /** @type {number[]} */
    const scoreboard = await scoreboardRef.get().then((snap) => snap.val())
    if (!scoreboard) {
      console.error("Error BlAuDr: database/scoreboard is null or undefined")
      return
    }
    const leaderBoard = generateLeaderBoard(seats, scoreboard, bids)
    let winnersAndBids = {}
    leaderBoard.forEach((leader, card) => {
      const luckyNumber = Math.floor(Math.random() * leader.highBidders.length)
      const winner = leader.highBidders[luckyNumber]
      scoreboard[winner] -= leader.highBid
      winnersAndBids[card] = {
        seat: winner,
        bid: leader.highBid,
      }
    })
    return Promise.all([
      resultRoundRef.set(winnersAndBids),
      scoreboardRef.set(scoreboard),
    ])
  } catch (error) {
    console.error("Error BlAuDr in findWinners: ", error)
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

/**
 * Auction leader board for a card
 * @typedef {Object} Leader
 * @property {number[]} highBidders - The list of bidders that are in the lead
 * @property {number} highBid - The bid that was given by the lead bidders
 * @property {number} bankSum - The amount each lead bidder had at their disposal
 */

/**
 * Generate the list of potential winners for the round and their bids
 * @param {Object} seats
 * @param {number[]} scoreboard
 * @param {Object} bids
 * @returns {Leader[]}
 */
function generateLeaderBoard(seats, scoreboard, bids) {
  const defaultLeader = {
    highBidders: [],
    highBid: 0,
    bankSum: 0,
  }
  /** @type {Leader[]} */
  let leaderBoard = Array(15).fill(defaultLeader)
  for (const [uid, seat] of Object.entries(seats)) {
    const score = scoreboard[seat]
    /** @type {number[]} */
    const bidsFromBidder = bids[uid]
    bidsFromBidder.forEach((bid, card) => {
      const leader = leaderBoard[card]
      if (bid >= leader.highBid) {
        if (bid > leader.highBid || score > leader.bankSum) {
          leaderBoard[card] = {
            highBidders: [seat],
            highBid: bid,
            bankSum: score,
          }
        } else if (score == leader.bankSum) {
          leaderBoard[card] = {
            highBidders: [...leader.highBidders, seat],
            highBid: bid,
            bankSum: score,
          }
        }
      }
    })
  }
  return leaderBoard
}
