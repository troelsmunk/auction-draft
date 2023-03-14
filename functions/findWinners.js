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

  let winnersAndBids = {
    1: { uid: null, bid: -1 },
    2: { uid: null, bid: -1 },
    3: { uid: null, bid: -1 },
    4: { uid: null, bid: -1 },
    5: { uid: null, bid: -1 },
    6: { uid: null, bid: -1 },
    7: { uid: null, bid: -1 },
    8: { uid: null, bid: -1 },
    9: { uid: null, bid: -1 },
    10: { uid: null, bid: -1 },
    11: { uid: null, bid: -1 },
    12: { uid: null, bid: -1 },
    13: { uid: null, bid: -1 },
    14: { uid: null, bid: -1 },
    15: { uid: null, bid: -1 },
  }
  const bids = await auctionRef
    .child("bids")
    .get()
    .then((snap) => snap.val())
  const orderedBidders = Object.keys(bids)
  for (const uid of orderedBidders) {
    for (const [card, bid] of Object.entries(bids[uid])) {
      console.log(`User bid ${bid} on card ${card} with uid ${uid}`)
      if (bid > winnersAndBids[card].bid) {
        console.log("New bid takes the lead!")
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
