import { admin } from "$lib/admin.server"
import { error } from "@sveltejs/kit"

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ params }) {
  if (!params || !params.round || !params.pin) {
    throw error(500, "params didn't hold round and pin: " + params)
  }
  const scoreboard = await admin
    .database()
    .ref(`auctions/${params.pin}/scoreboard`)
    .get()
    .then((snap) => snap.val())
  if (!scoreboard || Object.keys(scoreboard).length < 1) {
    throw error(500, "Invalid scoreboard from database: " + scoreboard)
  }
  return {
    scores: scoreboard,
    round: params.round,
  }
}
