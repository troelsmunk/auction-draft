import { error, redirect } from "@sveltejs/kit"
import { admin } from "$lib/admin.server"
import { COOKIE_NAME } from "$lib/constants"

/** @type {import('@sveltejs/kit').Actions} */
export const actions = {
  create: async (event) => {
    const formData = await event.request.formData()
    const auctionSize = validateAuctionSize(formData.get("auction-size"))
    const uid = event.cookies.get(COOKIE_NAME)
    const pin = await getNextPin()
    await setupAuctionAndBidder(auctionSize, uid, pin)
    throw redirect(303, `/${pin}/1`)
  },
  join: async (event) => {
    const formData = await event.request.formData()
    const pin = parseInt(formData.get("pin"))
    const uid = event.cookies.get(COOKIE_NAME)
    await enrollBidderInAuction(uid, pin)
    throw redirect(303, `/${pin}/1`)
  },
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
 * @returns {number} The next PIN to be used
 */
async function getNextPin() {
  const transactionResult = await admin
    .database()
    .ref("newestPin")
    .transaction(calculateNextPin, null, false)
  return transactionResult.snapshot.val()
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
  const pinRef = admin.database().ref(`auctions/${pin}`)
  const sizeSnap = await pinRef.child("size").once("value")
  const findSeatForUid = findSeatReducer(uid, pin, sizeSnap.val())
  await pinRef.child("seats").transaction(findSeatForUid, null, false)
  return pinRef.child("readys").update({ [uid]: -1 })
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
