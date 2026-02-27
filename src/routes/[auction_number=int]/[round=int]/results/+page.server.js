import { COOKIE_NAME, ERROR_MESSAGE_401 } from "$lib/constants"
import { error } from "@sveltejs/kit"

/** @type {import('../$types').LayoutServerLoad} */
export async function load(event) {
  const uid = event.cookies.get(COOKIE_NAME)
  if (!uid) {
    throw error(401, ERROR_MESSAGE_401)
  }
  const db = event.platform?.env?.db
  if (!db) {
    console.error("Error: Could not connect to database.")
    throw error(500, "Database error")
  }
  /** @type {{seat:number|null, bid:number}[]} */
  const results = await db
    .prepare(
      `SELECT results FROM results 
      WHERE round = ? AND auction_id = 
        (SELECT auction_id FROM users WHERE uid = ? LIMIT 1) 
      LIMIT 1`,
    )
    .bind(event.params.round, uid)
    .first("results")
    .then((value) => {
      if (typeof value == "string") {
        return JSON.parse(value)
      }
    })
  return {
    results: results,
  }
}
