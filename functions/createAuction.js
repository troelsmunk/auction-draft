import transaction from "./transaction.js"

/**
 * Finds the next PIN from the newestPin
 * * Writes the PIN to newestPin atomically using the transaction method
 *
 * When that is done, and the user index doesn't already contain a PIN:
 * * Writes the PIN to the user index
 * * Initializes the auction
 * @param {import("@firebase/database-types").DataSnapshot} auctionSizeSnap
 * @param {import("firebase-functions").EventContext} context
 */
export default async function transactionOnNewestPin(auctionSizeSnap, context) {
  try {
    const rootRef = auctionSizeSnap.ref.root
    const indexPinRef = rootRef.child(`index/${context.params.uid}/pin`)
    if (await referenceOccupied(indexPinRef)) {
      throw new Error("There already exists a PIN in the index")
    }
    const newestPinRef = rootRef.child("newestPin")
    const transactionResult = await transaction(newestPinRef, calculateNextPin)

    if (!transactionResult.committed) {
      throw new Error("The createAuction transaction didn't commit")
    }
    if (!transactionResult.snapshot) {
      throw new Error(
        "The createAuction transaction didn't pass any database snapshot"
      )
    }
    /* This is if two runs of the function are running in parallel 
    and one write the PIN while the other is calculating the next */
    if (await referenceOccupied(indexPinRef)) {
      throw new Error("There already exists a PIN in the index")
    }
    const newPin = transactionResult.snapshot.val()
    const auctionRef = rootRef.child(`auctions/${newPin}`)
    /** The number of bidders in the auction, as inputted by the user.
     *  @type {number} */
    const auctionSize = auctionSizeSnap.val()
    return Promise.all([
      indexPinRef.set(newPin),
      initializeAuction(auctionRef, auctionSize),
    ])
  } catch (error) {
    if (process.env.FUNCTIONS_EMULATOR === "false") {
      console.error(error)
    }
  }
}

/**
 * Calculates the next PIN from the a previous PIN
 * @param {any} previousPin The previous PIN which the calculation is based upon
 * @returns {number} The next PIN to be used in the transaction
 */
function calculateNextPin(previousPin) {
  if (typeof previousPin === "number") {
    return (previousPin * 11) % 9973
  }
  return 1
}

/**
 * Checks to see if the database reference holds any data
 * @param {import("@firebase/database-types").Reference} ref The database location to check
 * @returns {Promise<boolean>} Indication of whether the reference holds any data
 */
async function referenceOccupied(ref) {
  const snapshot = await ref.once("value")
  return snapshot.exists()
}

/**
 * Initializes an auction, writing round, timestamp and size
 * @param {import("@firebase/database-types").Reference} auctionRef The database location where the auction should be
 * @param {number} auctionSize The number of bidders in the auction
 */
function initializeAuction(auctionRef, auctionSize) {
  return auctionRef.update({
    round: 1,
    timestamp: Date.now(),
    size: auctionSize,
  })
}
