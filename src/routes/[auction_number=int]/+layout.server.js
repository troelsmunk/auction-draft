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
  /** @type { number | null} } */
  const seat = await db
    .prepare("SELECT seat_number FROM users WHERE uid = ? LIMIT 1")
    .bind(uid)
    .first("seat_number")
  if (typeof seat !== "number") {
    throw error(403, "You are not enrolled in an auction")
  }
  const colors = [
    "#A0A6A6",
    "#B98EF6",
    "#FF931F",
    "#FF70AE",
    "#C27C5B",
    "#FAC30F",
  ]
  colors.length = 4
  return {
    colors: colors,
    seat: seat,
  }
}
