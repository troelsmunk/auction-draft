import { admin } from "$lib/admin.server"

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ params }) {
  const pin = params?.pin
  const round = params?.round
  if (!round || !pin) {
    console.error(
      "Error BlAuDr: Invalid data. params didn't hold round and pin: %s",
      params
    )
    return
  }
  const scoreboard = await admin
    .database()
    .ref(`auctions/${pin}/scoreboard`)
    .get()
    .then((snap) => snap.val())
  if (!scoreboard || Object.keys(scoreboard).length === 0) {
    console.error(
      "Error BlAuDr: Invalid scoreboard from database: %s",
      scoreboard
    )
  }
  return {
    scores: scoreboard,
    round: round,
  }
}
