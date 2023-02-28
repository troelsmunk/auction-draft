const transaction = require("./transaction")

/**
 *
 * @param {import("firebase-functions").Change<import("firebase-functions").database.DataSnapshot>} readysChange
 * @param {import("firebase-functions").EventContext} context
 */
module.exports = async function findWinners(readysChange, context) {
  try {
    const readysRef = readysChange.after.ref
    const auctionRef = readysRef.parent
    const roundRef = auctionRef.child("round")
    const roundSnap = await roundRef.once("value")
    const currentRound = roundSnap.val()
    const sizeSnap = await auctionRef.child("size").once("value")
    const auctionSize = sizeSnap.val()

    const transactionResult = await transaction(readysRef, name)

    if (!transactionResult.committed) return
    /* how to rectify the situation below? 
    when the transaction commits {}, because there are no readys, 
    which will only happen on a dead test */
    if (!transactionResult.snapshot.exists()) return

    const resultRoundRef = auctionRef.child(`results/rounds/${currentRound}`)
    const resultCardRef = resultRoundRef.child(`cards/0`)
    let winner = currentRound % auctionSize
    let bid = 0
    return Promise.all([
      roundRef.set(currentRound + 1),
      resultCardRef.set({ winner: winner, bid: bid }),
    ])

    /**
     * @param {any} previousReadys
     */
    function name(previousReadys) {
      if (previousReadys === null) return null
      const bidderUids = Object.keys(previousReadys)
      if (bidderUids.length !== auctionSize) return
      let everyoneUnready = {}
      for (let index = 0; index < bidderUids.length; index++) {
        const uid = bidderUids[index]
        if (previousReadys[uid] !== currentRound) return
        everyoneUnready[uid] = -1
      }
      return everyoneUnready
    }
  } catch (error) {
    if (process.env.FUNCTIONS_EMULATOR === "false") {
      console.error(error)
    }
    console.error(error)
  }
}
