import { admin } from "$lib/admin.server"
import { logIfFalsy } from "$lib/validation"

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ params }) {
  const pin = params?.pin
  const round = params?.round
  if (logIfFalsy(round, "round from params")) return
  if (logIfFalsy(pin, "pin from params")) return
  const scoreboard = await admin
    .database()
    .ref(`auctions/${pin}/scoreboard`)
    .get()
    .then((snap) => snap.val())
  logIfFalsy(scoreboard, "scoreboard from database")
  return {
    scores: scoreboard,
    round: round,
  }
}
