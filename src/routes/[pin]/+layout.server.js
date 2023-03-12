import { admin } from "$lib/admin.server"

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ params }) {
  const auctionSize = await admin
    .database()
    .ref(`auctions/${params.pin}/size`)
    .get()
  return {
    size: auctionSize.val(),
    pin: params.pin,
  }
}
