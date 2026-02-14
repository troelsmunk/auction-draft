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
  /** @type { number | null}  */
  const auctionId = await db
    .prepare("SELECT auction_id FROM users WHERE uid = ? LIMIT 1")
    .bind(uid)
    .first("auction_id")
  /** @type {D1Result<Record<string, number>>} */
  const pointsSelect = await db
    .prepare("SELECT points_remaining FROM users WHERE auction_id = ?")
    .bind(auctionId)
    .run()
  const points = pointsSelect?.results.map((record) => {
    return record.points_remaining
  })
  const auctionSize = pointsSelect?.results.length
  if (!auctionSize) {
    console.error("The auction has no size")
    throw error(500, "Database error")
  }
  return {
    auctionSize: auctionSize,
    points: points,
  }
}
