import { BID_OPTIONS, COOKIE_NAME } from "$lib/constants"
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
    /** @type {Record<string, number|null>|null} */
    const userSelect = await db
      .prepare(
        "SELECT points_remaining, seat_number, auction_id FROM users WHERE uid = ?",
      )
      .bind(uid)
      .first()
    const pointsRemaining = userSelect?.points_remaining
    if (typeof pointsRemaining != "number") {
      console.error("Could not find points for UID: ", uid)
      return error(500, "Database error")
    }
    const seat = userSelect?.seat_number
    if (typeof seat != "number") {
      return error(500, "Database error")
    }
    const auctionId = userSelect?.auction_id
    /** @type {number|null} */
    const auctionSize = await db
      .prepare("SELECT count(1) as count FROM users WHERE auction_id = ?")
      .bind(auctionId)
      .first("count")
    if (typeof auctionSize != "number") {
      console.error(
        "Could not find size for auction_id: ",
        auctionId,
        " related to UID: ",
        uid,
      )
      return error(500, "Database error")
    }
    const optionsForThisUser = BID_OPTIONS.get(auctionSize)?.at(seat)
    const bidsConvertedToOptions = filteredBids.map((bid) => {
      return optionsForThisUser?.at(bid) || 0
    })
    const sumOfBids = bidsConvertedToOptions.reduce((sum, value) => sum + value)
    if (pointsRemaining < sumOfBids) {
      return fail(400, {
        error: "Insufficient funds",
        bids: bidsConvertedToOptions,
      })
    }
    const update = {
      uid: uid,
      bids: bidsConvertedToOptions,
      sumOfBids: sumOfBids,
      pointsRemaining: pointsRemaining,
    }
    broadcastUpdate(update, parseInt(event.params.auction_number))
  },
}
