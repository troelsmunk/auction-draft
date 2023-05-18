import { admin } from "$lib/admin.server"

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ params }) {
  const scoreboard = await admin
    .database()
    .ref(`auctions/${params?.pin}/scoreboard`)
    .get()
    .then((snap) => snap.val())
  if (!scoreboard) {
    throw error(500, "The auction has no scoreboard")
  }
  return {
    scores: scoreboard,
    round: params?.round,
  }
}
