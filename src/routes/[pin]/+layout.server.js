import { admin } from "$lib/admin.server"
import { COOKIE_NAME } from "$lib/constants"

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ params, cookies }) {
  const uid = cookies.get(COOKIE_NAME)
  const pin = params.pin
  if (!uid || !pin) {
    console.error(
      "Error BlAuDr: Invalid data. uid from cookie: %s, pin from params: %s",
      uid,
      pin
    )
  }
  const auctionRef = admin.database().ref(`auctions/${pin}`)
  const seat = await auctionRef
    .child(`seats/${uid}`)
    .get()
    .then((snap) => snap.val())
  const size = await auctionRef
    .child("size")
    .get()
    .then((snap) => snap.val())
  if (typeof seat !== "number" || !size) {
    console.error(
      "Error BlAuDr: Invalid data. seat from database: %s, size from database: %s",
      seat,
      size
    )
  }
  const colors = [
    "#A0A6A6",
    "#B98EF6",
    "#FF931F",
    "#FF70AE",
    "#C27C5B",
    "#FAC30F",
  ]
  colors.length = size
  return {
    size: size,
    pin: pin,
    colors: colors,
    seat: seat,
  }
}
