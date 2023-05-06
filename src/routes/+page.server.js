import { error, redirect } from "@sveltejs/kit"
import { admin } from "$lib/admin.server"
import { COOKIE_NAME } from "$lib/constants"

/** @type {import('@sveltejs/kit').Actions} */
export const actions = {
  create: async (event) => {
    const formData = await event.request.formData()
    if (!formData?.get("auction-size")) {
      console.error(
        "Error BlAuDr: Invalid data. formData: %s, auction-size: %s",
        formData,
        formData.get("auction-size")
      )
      return
    }
    const auctionSize = validateAuctionSize(formData.get("auction-size"))
    const uid = event.cookies.get(COOKIE_NAME)
    const pin = await getNextPin()
    if (!auctionSize || !uid || !pin) {
      console.error(
        "Error BlAuDr: Invalid data. auctionSize from formData: %s, " +
          "uid from cookie: %s, calculated pin: %s",
        auctionSize,
        uid,
        pin
      )
      return
    }
    await setupAuctionAndBidder(auctionSize, uid, pin)
    throw redirect(303, `/${pin}/1`)
  },
  join: async (event) => {
    const formData = await event.request.formData()
    const pin = parseInt(formData.get("pin"))
    const uid = event.cookies.get(COOKIE_NAME)
    if (!uid || !pin) {
      console.error(
        "Error BlAuDr: Invalid data. uid from cookie: %s, pin from formData: %s",
        uid,
        pin
      )
      return
    }
    await enrollBidderInAuction(uid, pin)
    throw redirect(303, `/${pin}/1`)
  },
}

/**
 * Calculates the next PIN from the previous PIN
 * Done using the prime 9973 and its primitive root 11
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
 * Checks that the given size is a number in the allowed interval.
 * @param {any} sizeFromForm The size input from the user
 * @returns {number} The validated size of the auction
 */
function validateAuctionSize(sizeFromForm) {
  const size = parseInt(sizeFromForm)
  if (size == null || size < 1 || size > 6) {
    throw error(400, "The size of the auction must be between 1 and 6")
  }
  return size
}

/**
 * Calculates the next PIN to be used from the currently newest PIN
 * @returns {Promise<number>} The next PIN to be used
 */
async function getNextPin() {
  return admin
    .database()
    .ref("newestPin")
    .transaction(calculateNextPin, null, false)
    .then((result) => result.snapshot.val())
}

/**
 * Creates the auction in the database, as well as the first bidder
 * @param {number} auctionSize The requested size of the auction
 * @param {string} uid The UID of the user who requested the auction
 * @param {number} pin The calculated auction PIN
 * @returns {Promise<void>}
 */
function setupAuctionAndBidder(auctionSize, uid, pin) {
  const scoreboard = {}
  for (let index = 0; index < auctionSize; index++) {
    scoreboard[index] = 200
  }
  return admin
    .database()
    .ref(`auctions/${pin}`)
    .update({
      round: 1,
      size: auctionSize,
      timestamp: Date.now(),
      scoreboard: scoreboard,
      seats: { [uid]: 0 },
      readys: { [uid]: -1 },
    })
}

/**
 * Enrolls a bidder into an auction in the database
 * @param {string} uid The UID of the bidder that requested to join
 * @param {number} pin The PIN of the auction to join
 * @returns {Promise<void>}
 */
async function enrollBidderInAuction(uid, pin) {
  const auctionRef = admin.database().ref(`auctions/${pin}`)
  const size = await auctionRef
    .child("size")
    .once("value")
    .then((snap) => snap.val())
  if (!size) {
    console.error("Error BlAuDr: Invalid data. size from database: %s", size)
    return
  }
  const findSeatForUid = findSeatReducer(uid, pin, size)
  const transactionResult = await auctionRef
    .child("seats")
    .transaction(findSeatForUid, null, false)
  if (!transactionResult?.committed || !transactionResult?.snapshot.exists()) {
    console.error(
      "Error BlAuDr: Transaction on seats failed. transaction: %s, " +
        "committed: %s, snapshot: %s",
      transactionResult,
      transactionResult.committed,
      transactionResult.snapshot.val()
    )
    return
  }
  return auctionRef.child("readys").update({ [uid]: -1 })
}

/**
 * Produce a function that can find a seat during a transaction
 * @param {string} uid The UID of the bidder that is to be seated
 * @param {number} pin The PIN of the auction
 * @param {number} auctionSize The size of the auction
 * @returns {(seats:?object) => object} The reduced function for the transaction
 */
function findSeatReducer(uid, pin, auctionSize) {
  return function (seatsData) {
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
