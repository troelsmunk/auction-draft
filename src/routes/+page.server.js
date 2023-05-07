import { redirect } from "@sveltejs/kit"
import { admin } from "$lib/admin.server"
import { COOKIE_NAME } from "$lib/constants"
import { isInvalid } from "$lib/validation"

/** @type {import('@sveltejs/kit').Actions} */
export const actions = {
  create: async (event) => {
    const formData = await event.request.formData()
    if (isInvalid(formData, "formData")) return
    const auctionSize = parseInt(formData.get("auction-size"))
    if (isInvalid(auctionSize, "auctionSize from formData")) return
    const uid = event.cookies.get(COOKIE_NAME)
    if (isInvalid(uid, "uid from cookie")) return
    const pin = await getNextPin()
    if (isInvalid(pin, "calculated pin")) return
    await setupAuctionAndBidder(auctionSize, uid, pin)
    throw redirect(303, `/${pin}/1`)
  },
  join: async (event) => {
    const formData = await event.request.formData()
    if (isInvalid(formData, "formData")) return
    const pin = parseInt(formData.get("pin"))
    if (isInvalid(pin, "pin from formData")) return
    const uid = event.cookies.get(COOKIE_NAME)
    if (isInvalid(uid, "uid from cookie")) return
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
  if (isInvalid(size, "size from database")) return
  const findSeatForUid = findSeatReducer(uid, pin, size)
  const transactionResult = await auctionRef
    .child("seats")
    .transaction(findSeatForUid, null, false)
  if (isInvalid(transactionResult, "transactionResult")) return
  if (isInvalid(transactionResult.committed, "transaction committed")) return
  if (isInvalid(transactionResult.snapshot.exists(), "transaction snap")) return
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
