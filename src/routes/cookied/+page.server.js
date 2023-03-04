import { error, redirect } from "@sveltejs/kit"
import admin from "firebase-admin"

admin.initializeApp()

/** @type {import('@sveltejs/kit').Actions} */
export const actions = {
  create: async (event) => {
    const formData = await event.request.formData()
    const auctionSize = parseInt(formData.get("auction-size"))
    if (auctionSize == null || auctionSize < 1 || auctionSize > 6) {
      throw error(400, "The size of the auction must be between 1 and 6")
    }
    const uid = await admin
      .auth()
      .verifyIdToken(formData.get("token"), false)
      .then((decodedIdToken) => {
        return decodedIdToken.uid
      })
    const db = admin.database()
    const newestPinRef = db.ref("newestPin")
    const newestPinSnap = await newestPinRef.get()
    // TODO: use transaction
    const pin = calculateNextPin(newestPinSnap.val())
    await newestPinRef.set(pin)
    const scoreboard = {}
    for (let index = 0; index < auctionSize; index++) {
      scoreboard[index] = 200
    }
    await db.ref(`auctions/${pin}`).update({
      round: 1,
      size: auctionSize,
      timestamp: Date.now(),
      scoreboard: scoreboard,
      seats: { [uid]: 0 },
      readies: { [uid]: -1 },
    })
    throw redirect(303, `/${pin}/welcome`)
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
