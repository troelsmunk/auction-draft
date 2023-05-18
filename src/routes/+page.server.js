import { error, fail, redirect } from "@sveltejs/kit"
import { admin } from "$lib/admin.server"
import { COOKIE_NAME } from "$lib/constants"

/** @type {import('@sveltejs/kit').Actions} */
export const actions = {
  create: async (event) => {
    const uid = event.cookies.get(COOKIE_NAME)
    if (!uid) {
      fail(400, {
        create: {
          error: "Please log in",
        },
      })
    }
    const data = await event.request.formData()
    const auctionSize = parseInt(data?.get("auction-size"))
    if (auctionSize < 1 || auctionSize > 6) {
      fail(400, {
        create: {
          auctionSize: data?.get("auction-size"),
          error: "The auction size should be a number between 1 and 6",
        },
      })
    }
    let pin
    try {
      pin = await getNextPin()
      await setupAuctionAndBidder(auctionSize, uid, pin)
    } catch (error) {
      return fail(500, {
        create: {
          pin: pin,
          auctionSize: auctionSize,
          error: "Enrollment into the auction failed. Please verify the PIN.",
        },
      })
    }
    throw redirect(303, `/${pin}/1`)
  },
  join: async (event) => {
    const uid = event.cookies.get(COOKIE_NAME)
    if (!uid) {
      fail(400, {
        join: {
          error: "Please log in",
        },
      })
    }
    const data = await event.request.formData()
    const pin = parseInt(data?.get("pin"))
    if (!pin) {
      fail(400, {
        join: {
          pin: data?.get("pin"),
          error: "Please verify the PIN",
        },
      })
    }
    try {
      await enrollBidderInAuction(uid, pin)
    } catch (error) {
      return fail(500, {
        join: {
          pin: pin,
          error: "Enrollment into the auction failed. Please verify the PIN.",
        },
      })
    }
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
 * @param {number} pin The PIN of the auction
 * @returns {Promise<void>}
 */
async function enrollBidderInAuction(uid, pin) {
  const auctionRef = admin.database().ref(`auctions/${pin}`)
  const auctionSize = await auctionRef
    .child(`size`)
    .get()
    .then((snap) => snap.val())
  if (!auctionSize) {
    throw error(500, "Auction size doesn't exist")
  }
  const findSeatForUid = findSeatReducer(uid, pin, auctionSize)
  const transactionResult = await auctionRef
    .child("seats")
    .transaction(findSeatForUid, null, false)
  if (!transactionResult?.committed || !transactionResult?.snapshot.exists()) {
    throw error(500, "Transaction failed")
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
      return seatsData
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
