import { admin } from "$lib/admin.server"

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ params }) {
  const scoreboardSnap = await admin
    .database()
    .ref(`auctions/${params.pin}/scoreboard`)
    .get()
  return {
    scores: scoreboardSnap.val(),
    round: params.round,
  }
}
