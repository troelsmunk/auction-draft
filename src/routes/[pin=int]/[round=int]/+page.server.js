import { admin } from "$lib/admin.server"
import { COOKIE_NAME } from "$lib/constants"
import { error, fail } from "@sveltejs/kit"

/** @type {import('@sveltejs/kit').Actions} */
export const actions = {
  submit: async (event) => {
    const uid = event.cookies.get(COOKIE_NAME)
    if (!uid) {
      throw error(401, "Please log in")
    }
    const formData = await event.request.formData()
    /** @type {Array<number|null>} bids */
    const bids = JSON.parse(formData?.get("bids"))
    const round = parseInt(event.params.round)
    const pin = event.params.pin
    if (!round) {
      throw error(500, "The round is not a number")
    }
    if (bids.length != 15) {
      return fail(400, {
        error: "Wrong number of bids",
        bids: bids,
      })
    }
    let sum = 0
    let bidsForDatabase
    try {
      bidsForDatabase = bids.map((bid) => {
        if (bid === null) return 0
        if (typeof bid !== "number") {
          throw error(400, "The bids should be numbers.")
        }
        if (bid < 0) {
          throw error(400, "The bids can't be negative.")
        }
        sum += bid
        return bid
      })
    } catch (error) {
      return fail(error.status, {
        error: error.body,
        bids: bids,
      })
    }
    const seat = await admin
      .database()
      .ref(`auctions/${pin}/seats/${uid}`)
      .get()
      .then((snap) => snap.val())
    const scoreboard = await admin
      .database()
      .ref(`auctions/${pin}/scoreboard/${seat}`)
      .get()
      .then((snap) => snap.val())
    if (scoreboard < sum) {
      return fail(400, {
        error: "Insufficient funds",
        bids: bids,
      })
    }
    await admin
      .database()
      .ref(`auctions/${pin}/bids/${uid}`)
      .set(bidsForDatabase)
    await admin.database().ref(`auctions/${pin}/readys/${uid}`).set(round)
    return { success: true }
  },
}
