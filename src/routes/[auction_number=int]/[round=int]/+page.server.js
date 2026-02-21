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
    const round = parseInt(event.params.round)
    const insertBids = await db
      .prepare(
        "INSERT INTO bids (user_id, round, bid_values) VALUES (?,?,json(?)) " +
          "ON CONFLICT (user_id, round) DO UPDATE SET bid_values = excluded.bid_values",
      )
      .bind(userId, round, JSON.stringify(bidsConvertedToOptions))
      .run()
    if (insertBids.error) {
      console.error("Failed to write bids to database for uid: ", uid)
      return error(500, "Database error")
    }
    const auctionNumber = parseInt(event.params.auction_number)
    /**
     * @typedef {Object} SeatAndBidsRow
     * @property {number} seat
     * @property {string} bids
     */
    const selectBids = await db
      .prepare(
        "SELECT users.seat_number as seat, bids.bid_values as bids " +
          "FROM users JOIN bids ON users.id = bids.user_id " +
          "WHERE users.auction_id = ? AND bids.round = ?",
      )
      .bind(auctionId, round)
      .run()
    if (selectBids.results.length === auctionSize) {
      /**
       * @typedef {Object} ResultForItem
       * @property {number|null} seat
       * @property {number} bid
       */

      const numberOfBids = bidsConvertedToOptions.length

      /** @type {ResultForItem[]} */
      let results = Array(numberOfBids)
      console.log("empty, results: ", results)
      results.fill({ seat: null, bid: 0 })
      results.forEach((result, index) => {
        results[index] = { seat: null, bid: 0 }
      })
      console.log("filled, results: ", results)
      results[2].bid = 2
      console.log("one set, results: ", results)

      selectBids.results.forEach((/** @type {SeatAndBidsRow}*/ record) => {
        const thisSeat = record.seat
        const theseBids = JSON.parse(record.bids)
        results.forEach((resultForItem, index) => {
          if (resultForItem.bid < theseBids[index]) {
            resultForItem.seat = thisSeat
            resultForItem.bid = theseBids[index]
          }
        })
      })
      console.log("calculated, results: ", results)
      const insertResults = await db
        .prepare(
          "INSERT INTO results (auction_id, round, results) VALUES (?,?,json(?)) " +
            "ON CONFLICT (auction_id, round) DO NOTHING",
        )
        .bind(auctionId, round, JSON.stringify(results))
        .run()
      if (insertResults.success) {
        const update = { newRound: round + 1 }
        broadcastUpdate(update, auctionNumber)
      }
    }
    return { success: insertBids.success }
  },
}
