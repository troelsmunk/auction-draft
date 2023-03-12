import { admin } from "$lib/admin.server"

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ params }) {
  const auctionSize = await admin
    .database()
    .ref(`auctions/${params.pin}/size`)
    .get()
  const size = auctionSize.val()
  const colors = ["purple", "yellow", "brown", "gray", "lightblue", "orange"]
  colors.length = size
  return {
    size: size,
    pin: params.pin,
    colors: colors,
  }
}
