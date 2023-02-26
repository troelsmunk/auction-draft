const transaction = require("./transaction")

/**
 * Creates the bidder in the specified auction, choosing a seat and initializing the scoreboard
 * and the readiness. The function triggers when a PIN is written to the user index.
 * @param {import("@firebase/database-types").DataSnapshot} indexPinSnapshot
 * @param {import("firebase-functions").EventContext} context
 */
module.exports = async function createBidder(indexPinSnapshot, context) {
  try {
    const rootRef = indexPinSnapshot.ref.root
    const uid = context.params.uid
    const pin = indexPinSnapshot.val()
    const auctionRef = rootRef.child(`auctions/${pin}`)
    const sizeSnap = await auctionRef.child("size").once("value")
    if (!sizeSnap.exists()) {
      throw new Error("There is no auction to join")
    }
    const auctionSize = sizeSnap.val()
    const seatsRef = auctionRef.child("seats")
    const chooseAvailableSeat = chooseAvailableSeatReducer(
      uid,
      pin,
      auctionSize
    )
    const transactionResult = await transaction(seatsRef, chooseAvailableSeat)
    if (!transactionResult.committed) {
      throw new Error("The seat transaction didn't commit")
    }
    const seats = transactionResult.snapshot.val()
    const biddersSeat = seats[uid]
    const scoreboardRef = auctionRef.child(`scoreboard/${biddersSeat}`)
    const readyRef = auctionRef.child(`readys/${uid}`)
    return Promise.all([scoreboardRef.set(200), readyRef.set(-1)])
  } catch (error) {
    if (process.env.FUNCTIONS_EMULATOR === "false") {
      console.error(error)
    }
  }
}

/**
 * Reduce the context to a function which can act on its own in the transaction.
 * @param {string} uid The UID of user
 * @param {number} pin The PIN of the auction
 * @param {number} auctionSize The size of the auction
 * @returns {(seats:?object) => object} The reduced function
 */
function chooseAvailableSeatReducer(uid, pin, auctionSize) {
  /**
   * Assign an available seat to the bidder and add it to the list of taken seats
   * @param {?object} seatsData The seats already occupied in the auction
   * @returns {object} The new list of occupied seats
   */
  return function chooseAvailableSeat(seatsData) {
    if (!seatsData) {
      return { [uid]: pin % auctionSize }
    }
    if (Object.keys(seatsData).includes(uid)) {
      return
    }
    let availableSeats = new Array()
    const takenSeats = Object.values(seatsData)
    for (let index = 0; index < auctionSize; index++) {
      if (!takenSeats.includes(index)) {
        availableSeats.push(index)
      }
    }
    const numberOfSeats = availableSeats.length
    if (numberOfSeats <= 0) {
      return
    }
    const modulo = pin % numberOfSeats
    const assignedSeat = availableSeats[modulo]
    return { ...seatsData, [uid]: assignedSeat }
  }
}
