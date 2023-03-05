import { admin } from "$lib/admin.server"

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ params }) {
  const auctionSize = await admin
    .database()
    .ref(`auctions/${params.pin}/size`)
    .get()
  return {
    size: auctionSize.val(),
    scores: [190, 200, 110, 90, 100, 200],
    pin: params.pin,
    round: params.round,
  }
}
