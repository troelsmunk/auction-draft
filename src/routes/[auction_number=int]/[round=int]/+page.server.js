import { COOKIE_NAME } from "$lib/constants"
import { broadcastUpdate } from "$lib/sseManager"
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
    const bids = JSON.parse(formData?.get("bids")?.toString() || "[]")
    const round = parseInt(event.params.round)
    if (!round) {
      throw error(500, "The round is not a number")
    }
    if (bids.length != 15) {
      return fail(400, {
        error: "Wrong number of bids",
        bids: bids,
      })
    }
    const filteredBids = bids.map((bid) => {
      return bid || 0
    })
    if (
      filteredBids.some((bid) => typeof bid !== "number") ||
      filteredBids.some((bid) => bid < 0)
    ) {
      return fail(400, {
        error: "The bids should be nonnegative numbers",
        bids: bids,
      })
    }
    const db = event.platform?.env?.db
    if (!db) {
      console.error("Error: Could not connect to database.")
      return error(500, "Database error")
    }
    /** @type {number|null} */
    const pointsRemaining = await db
      .prepare("SELECT points_remaining FROM users WHERE uid = ?")
      .bind(uid)
      .first("points_remaining")
    if (typeof pointsRemaining != "number") {
      console.error("Could not find points for UID: ", uid)
      return error(500, "Database error")
    }
    const sumOfBids = filteredBids.reduce((sum, value) => sum + value)
    if (pointsRemaining < sumOfBids) {
      return fail(400, {
        error: "Insufficient funds",
        bids: bids,
      })
    }
    const update = {
      uid: uid,
      bids: sumOfBids,
    }
    broadcastUpdate(update, parseInt(event.params.auction_number))
  },
}
