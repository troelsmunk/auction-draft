import { BID_OPTIONS, COOKIE_NAME } from "$lib/constants"
import { broadcastUpdate } from "$lib/sseManager"
import { fail } from "@sveltejs/kit"

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
      return fail(401, "Please log in")
    }
    const formData = await event.request.formData()
    /** @type {Array<any>} */
    const bids = JSON.parse(String(formData?.get("bids")))
    if (
      bids.length == 0 ||
      bids.some((bid) => typeof bid != "number") ||
      bids.some((bid) => bid < 0)
    ) {
      console.error("Failed parsing formData: ", formData)
      return fail(400, {
        error: "Error parsing input. The bids should be nonnegative numbers",
      })
    }
    const db = event.platform?.env?.db
    if (!db) {
      console.error("Error: Could not connect to database.")
      return fail(500, "Database error")
    }
    /** @type {UsersRow|null} */
    const userSelect = await db
      .prepare(
        `SELECT id, points_remaining, seat_number, auction_id FROM users 
        WHERE uid = ? 
        LIMIT 1`,
      )
      .bind(uid)
      .first()
    if (!userSelect) {
      console.error("Could not find user data for UID: ", uid)
      return fail(500, "Database error")
    }
    const pointsRemaining = userSelect?.points_remaining
    const userId = userSelect?.id
    const seat = userSelect?.seat_number
    const auctionId = userSelect?.auction_id
    /** @type {number|null} */
    const auctionSize = await db
      .prepare(`SELECT count(1) FROM users WHERE auction_id = ?`)
      .bind(auctionId)
      .first("count(1)")
    if (typeof auctionSize != "number") {
      console.error(
        `Could not find size for auction_id: ${auctionId}, related to UID: ${uid},`,
      )
      return fail(500, "Database error")
    }
    const optionsForThisUser = BID_OPTIONS.get(auctionSize)?.at(seat)
    const bidsConvertedToOptions = bids.map((bid) => {
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
        `INSERT INTO bids (user_id, round, bid_values) 
        VALUES (?,?,json(?)) 
        ON CONFLICT (user_id, round) DO UPDATE SET bid_values = excluded.bid_values`,
      )
      .bind(userId, round, JSON.stringify(bidsConvertedToOptions))
      .run()
    if (insertBids.error) {
      console.error("Failed to write bids to database for uid: ", uid)
      return fail(500, "Database error")
    }
    const selectUserAndBids = await db
      .prepare(
        `SELECT users.id, users.points_remaining, users.seat_number, bids.bid_values 
        FROM users JOIN bids ON users.id = bids.user_id 
        WHERE users.auction_id = ? AND bids.round = ?`,
      )
      .bind(auctionId, round)
      .run()
    const usersAndTheirBids = /** @type {(UsersRow & BidsRow)[]} */ (
      selectUserAndBids.results
    )
    if (usersAndTheirBids.length === auctionSize) {
      /** @type {{seat:number|null, bid:number}[]} */
      let auctionResults = []
      // Set default state for every item in a bid
      bidsConvertedToOptions.forEach(() => {
        auctionResults.push({ seat: null, bid: 0 })
      })
      usersAndTheirBids.forEach((record) => {
        const seatForUser = record.seat_number
        const bidsFromUser = JSON.parse(record.bid_values)
        auctionResults.forEach((item, index) => {
          if (item.bid < bidsFromUser[index]) {
            item.seat = seatForUser
            item.bid = bidsFromUser[index]
          }
        })
      })
      const insertResults = await db
        .prepare(
          `INSERT INTO results (auction_id, round, results) VALUES (?,?,json(?)) 
          ON CONFLICT (auction_id, round) DO NOTHING`,
        )
        .bind(auctionId, round, JSON.stringify(auctionResults))
        .run()
      if (!insertResults.meta.changed_db) {
        return { success: insertBids.success }
      }
      /** @type {Promise<D1Result>[]} */
      const promises = new Array()
      usersAndTheirBids.forEach((user) => {
        let points = user.points_remaining
        auctionResults
          .filter((value) => value.seat == user.seat_number)
          .forEach((value) => {
            points -= value.bid
          })
        const promise = db
          .prepare(`UPDATE users SET points_remaining = ? WHERE id = ?`)
          .bind(points, user.id)
          .run()
        promises.push(promise)
      })
      const responses = await Promise.all(promises)
      const haveErrors = responses.some((response) => Boolean(response.error))
      if (haveErrors) {
        console.error(
          `Error: Could not subtract points from users: ${responses}`,
        )
        return fail(500, "Database error")
      }
      const update = { newRound: round + 1 }
      broadcastUpdate(update, auctionId)
    }
    return { success: insertBids.success }
  },
}
