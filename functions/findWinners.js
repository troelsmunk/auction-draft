/**
 * @param {import("firebase-functions").Change<import("firebase-functions").database.DataSnapshot>} readysChange
 * @param {import("firebase-functions").EventContext} context
 */
module.exports = async function findWinners(readysChange, context) {
  const readysRef = readysChange.after.ref
  const auctionRef = readysRef.parent
  const roundRef = auctionRef.child("round")
  const currentRound = await roundRef.get().then((snap) => snap.val())
  // -----
  // const everyoneIsReady = checkReadiness(roundRef, readysChange.after)
  const readyChecker = readyCheckerReducer(readysChange.after)
  const transactionResult = await roundRef.transaction(readyChecker)
  if (!transactionResult.committed) return
  if (!transactionResult.snapshot.exists()) return
  // -----
  // if (!everyoneIsReady) return

  const bids = await auctionRef
    .child("bids")
    .get()
    .then((snap) => snap.val())

  for (const [uid, cards] of Object.entries(bids)) {
    for (const [card, bid] of Object.entries(cards)) {
      console.log(`User bid ${bid} on card ${card} with uid ${uid}`)
    }
  }

  const resultRoundRef = auctionRef.child(`results/rounds/${currentRound}`)
}

/**
 * @param {import("firebase-functions").database.DataSnapshot} readySnap
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
