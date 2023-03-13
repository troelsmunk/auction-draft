import { admin } from "$lib/admin.server"

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ params }) {
  const auctionSize = await admin
    .database()
    .ref(`auctions/${params.pin}/size`)
    .get()
  const size = auctionSize.val()
  const colors = [
    "#858D8D",
    "#8338EC",
    "#F77F00",
    "#FF338B",
    "#7C472E",
    "#F2BB05",
  ]
  colors.length = size
  return {
    size: size,
    pin: params.pin,
    colors: colors,
  }
}
