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
  /** @type { {seat_number: number, auction_id: number} | null} } */
  const selectUser = await db
    .prepare("SELECT seat_number, auction_id FROM users WHERE uid = ? LIMIT 1")
    .bind(uid)
    .first()
  const seat = selectUser?.seat_number
  if (typeof seat !== "number") {
    throw error(403, "You are not enrolled in this auction")
  }
  const auctionId = selectUser?.auction_id
  /** @type {{count: number}| null} */
  const countUsers = await db
    .prepare("SELECT count(1) as count FROM users WHERE auction_id = ?")
    .bind(auctionId)
    .first()
  const auctionSize = countUsers?.count
  if (!auctionSize) {
    throw error(500, "The auction has no size")
  }
  const colors = [
    "#A0A6A6",
    "#B98EF6",
    "#FF931F",
    "#FF70AE",
    "#C27C5B",
    "#FAC30F",
  ]
  colors.length = auctionSize
  return {
    auctionSize: auctionSize,
    auctionId: auctionId,
    colors: colors,
    seat: seat,
  }
}
