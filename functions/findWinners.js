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
  const orderedBidders = Object.keys(bids)
  console.log("ordered-ish bidders: " + orderedBidders)
  const firstInLine = orderedBidders[0]
  const defaultWinnerAndBid = {
    uid: firstInLine,
    bid: 0,
  }
  let winnersAndBids = {}
  for (let i = 1; i <= 15; i++) {
    winnersAndBids[i] = defaultWinnerAndBid
  }
  console.log("default winners and bids: ")
  console.log(winnersAndBids)

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
