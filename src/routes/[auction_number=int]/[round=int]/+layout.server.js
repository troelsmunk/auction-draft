import { COOKIE_NAME } from "$lib/constants"
import { error } from "@sveltejs/kit"

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
  /** @type {D1Result<Record<string, number>>} */
  const pointsSelect = await db
    .prepare(
      "SELECT points_remaining FROM users WHERE auction_id = " +
        "(SELECT auction_id FROM users WHERE uid = ? LIMIT 1) " +
        "ORDER BY seat_number",
    )
    .bind(uid)
    .run()
  const points = pointsSelect?.results.map((record) => {
    return record.points_remaining
  })
  return {
    points: points,
  }
}
