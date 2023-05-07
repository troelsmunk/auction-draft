import { admin } from "$lib/admin.server"
import { COOKIE_NAME } from "$lib/constants"
import { isInvalid } from "$lib/validation"

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ params, cookies }) {
  const uid = cookies.get(COOKIE_NAME)
  const pin = params.pin
  isInvalid(uid, "uid from cookie")
  isInvalid(pin, "pin from params")
  const auctionRef = admin.database().ref(`auctions/${pin}`)
  const seat = await auctionRef
    .child(`seats/${uid}`)
    .get()
    .then((snap) => snap.val())
  const size = await auctionRef
    .child("size")
    .get()
    .then((snap) => snap.val())
  isInvalid(size, "size from database")
  if (typeof seat !== "number") {
    console.error("Error BlAuDr: Invalid data. seat from database: %s", seat)
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
