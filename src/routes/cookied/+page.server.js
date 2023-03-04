import { error, redirect } from "@sveltejs/kit"
import admin from "firebase-admin"

admin.initializeApp()

/** @type {import('@sveltejs/kit').Actions} */
export const actions = {
  create: async (event) => {
    const formData = await event.request.formData()
    const auctionSize = validateAndGetAuctionSize(formData.get("auction-size"))
    const uid = await validateUserAndGetUid(formData.get("token"))
    const pin = await getNextPin()
    await setupAuctionAndBidder(auctionSize, uid, pin)
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
function validateAndGetAuctionSize(sizeFromForm) {
  const size = parseInt(sizeFromForm)
  if (size == null || size < 1 || size > 6) {
    throw error(400, "The size of the auction must be between 1 and 6")
  }
  return size
}

/**
 * Checks the idToken against the admin.auth service
 * @param {any} idToken The idToken sent alongside the form input from the user
 * @returns {Promise<string>} The UID of the validated user
 */
function validateUserAndGetUid(idToken) {
  return admin
    .auth()
    .verifyIdToken(idToken, false)
    .then((decodedIdToken) => {
      return decodedIdToken.uid
    })
}

/**
 * Calculates the next PIN to be used from the currently newest PIN
 * @returns {number} The next PIN to be used
 */
async function getNextPin() {
  const newestPinRef = admin.database().ref("newestPin")
  const newestPinSnap = await newestPinRef.get()
  // TODO: use transaction
  const pin = calculateNextPin(newestPinSnap.val())
  await newestPinRef.set(pin)
  return pin
}

/**
 * Creates the auction in the database, as well as the first bidder
 * @param {number} auctionSize The requested size of the auction
 * @param {string} uid The UID of the user who requested the auction
 * @param {number} pin The calculated auction PIN
 */
async function setupAuctionAndBidder(auctionSize, uid, pin) {
  const scoreboard = {}
  for (let index = 0; index < auctionSize; index++) {
    scoreboard[index] = 200
  }
  await admin
    .database()
    .ref(`auctions/${pin}`)
    .update({
      round: 1,
      size: auctionSize,
      timestamp: Date.now(),
      scoreboard: scoreboard,
      seats: { [uid]: 0 },
      readies: { [uid]: -1 },
    })
}
