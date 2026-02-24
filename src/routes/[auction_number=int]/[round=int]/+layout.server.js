import { COOKIE_NAME } from "$lib/constants"
import { error } from "@sveltejs/kit"

/**
 * @typedef {Object} UsersRow
 * @property {number} id
 * @property {string} uid
 * @property {number} auction_id
 * @property {number} points_remaining
 * @property {number} seat_number
 */

/** @type {import('./$types').LayoutServerLoad} */
export async function load(event) {
  const uid = event.cookies.get(COOKIE_NAME)
  if (!uid) {
    throw error(401, "Please log in")
  }
  const db = event.platform?.env?.db
  if (!db) {
    console.error("Error: Could not connect to database.")
    return error(500, "Database error")
  }
  const usersSelect = await db
    .prepare(
      "SELECT points_remaining, seat_number, uid, auction_id FROM users WHERE auction_id = " +
        "(SELECT auction_id FROM users WHERE uid = ? LIMIT 1) " +
        "ORDER BY seat_number",
    )
    .bind(uid)
    .run()
  const users = /** @type {UsersRow[]} */ (usersSelect.results)
  const points = users.map((record) => {
    return record.points_remaining
  })
  const seat = users.find((user) => user.uid == uid)?.seat_number
  let roundOfLatestResults = await db
    .prepare(
      "SELECT round FROM results WHERE auction_id = ? " +
        "ORDER BY round DESC LIMIT 1",
    )
    .bind(users.at(0)?.auction_id)
    .first("round")
  return {
    points: points,
    seat: seat,
    roundOfLatestResults: roundOfLatestResults,
  }
}
