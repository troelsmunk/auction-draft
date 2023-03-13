import { admin } from "$lib/admin.server"

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ params, cookies }) {
  const uid = cookies.get("firebaseuid")
  const auctionRef = admin.database().ref(`auctions/${params.pin}`)
  const seat = await auctionRef
    .child(`seats/${uid}`)
    .get()
    .then((snap) => snap.val())
  const size = await auctionRef
    .child("size")
    .get()
    .then((snap) => snap.val())
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
    seat: seat,
  }
}
