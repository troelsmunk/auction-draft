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
        "SELECT id, points_remaining, seat_number, auction_id FROM users WHERE uid = ?",
      )
      .bind(uid)
      .first()
    const pointsRemaining = userSelect?.points_remaining
    const userId = userSelect?.id
    const seat = userSelect?.seat_number
    const auctionId = userSelect?.auction_id
    if (
      typeof pointsRemaining != "number" ||
      typeof userId != "number" ||
      typeof seat != "number" ||
      typeof auctionId != "number"
    ) {
      console.error("Could not find user data for UID: ", uid)
      return error(500, "Database error")
    }
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
    const stringifiedBids = JSON.stringify(bidsConvertedToOptions)
    const writeToDb = await db
      .prepare(
        "INSERT INTO bids (user_id, round, bid_values) VALUES (?,?,json(?)) " +
          "ON CONFLICT (user_id, round) DO UPDATE SET bid_values = excluded.bid_values",
      )
      .bind(userId, event.params.round, stringifiedBids)
      .run()
    if (writeToDb.error) {
      console.error("Failed to write bids to database for uid: ", uid)
      return error(500, "Database error")
    }
    findWinnerIfEveryoneHasBid(db, event)
    return { success: writeToDb.success }
  },
}

async function findWinnerIfEveryoneHasBid(db, event) {
  const something = await db
    .prepare("SELECT bid_values as count FROM bids ORDER BY id DESC LIMIT 1")
    .first("count")
  const json = JSON.parse(something)
  const update = {
    json: json,
    json1: json[1],
  }
  broadcastUpdate(update, parseInt(event.params.auction_number))
}
