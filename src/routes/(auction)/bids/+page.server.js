import { BID_OPTIONS, COOKIE_NAME } from "$lib/constants"
import { broadcastUpdate } from "$lib/sseManager"
import { error, fail } from "@sveltejs/kit"

/**
 * @typedef {Object} UsersRow
 * @property {number} id
 * @property {string} uid
 * @property {number} auction_id
 * @property {number} points_remaining
 * @property {number} seat_number
 *
 * @typedef {Object} BidsRow
 * @property {number} id
 * @property {number} user_id
 * @property {number} round
 * @property {string} bid_values
 *
 * @typedef {Object} ResultsRow
 * @property {number} id
 * @property {number} auction_id
 * @property {number} round
 * @property {string} results
 */

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
    const selectBids = await db
      .prepare(
        "SELECT users.id, users.points_remaining, users.seat_number, bids.bid_values " +
          "FROM users JOIN bids ON users.id = bids.user_id " +
          "WHERE users.auction_id = ? AND bids.round = ?",
      )
      .bind(auctionId, round)
      .run()
    const usersAndBidsFromDb = /** @type {(UsersRow & BidsRow)[]} */ (
      selectBids.results
    )
    if (usersAndBidsFromDb.length === auctionSize) {
      /** @type {{seat:number|null, bid:number}[]} */
      let preliminaryResults = []
      // Set default state for every item in a bid
      bidsConvertedToOptions.forEach(() => {
        preliminaryResults.push({ seat: null, bid: 0 })
      })
      usersAndBidsFromDb.forEach((record) => {
        const seatForUser = record.seat_number
        const bidsFromUser = JSON.parse(record.bid_values)
        preliminaryResults.forEach((item, index) => {
          if (item.bid < bidsFromUser[index]) {
            item.seat = seatForUser
            item.bid = bidsFromUser[index]
          }
        })
      })
      const insertResults = await db
        .prepare(
          "INSERT INTO results (auction_id, round, results) VALUES (?,?,json(?)) " +
            "ON CONFLICT (auction_id, round) DO NOTHING",
        )
        .bind(auctionId, round, JSON.stringify(preliminaryResults))
        .run()
      if (!insertResults.meta.changed_db) {
        return { success: insertBids.success }
      }
      /** @type {Array<Promise<D1Result>>} */
      const promises = new Array()
      usersAndBidsFromDb.forEach((user) => {
        let points = user.points_remaining
        preliminaryResults
          .filter((value) => value.seat == user.seat_number)
          .forEach((value) => {
            points -= value.bid
          })
        const promise = db
          .prepare("UPDATE users SET points_remaining = ? WHERE id = ?")
          .bind(points, user.id)
          .run()
        promises.push(promise)
      })
      const responses = await Promise.all(promises)
      const errors = responses.filter((response) => {
        return response.error
      })
      if (errors.length > 0) {
        console.error(
          "Error: Could not subtrack points from users: ",
          errors.flatMap((value) => value.error).join(),
        )
        return error(500, "Database error")
      }
      const update = { newRound: round + 1 }
      broadcastUpdate(update, auctionId)
    }
    return { success: insertBids.success }
  },
}
