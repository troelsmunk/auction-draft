import { admin } from "$lib/admin.server"
import { COOKIE_NAME } from "$lib/constants"
import { logIfFalsy } from "$lib/validation"

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ params, cookies }) {
  const uid = cookies.get(COOKIE_NAME)
  logIfFalsy(uid, "uid from cookie")
  const pin = params.pin
  logIfFalsy(pin, "pin from params")
  const auctionRef = admin.database().ref(`auctions/${pin}`)
  const seat = await auctionRef
    .child(`seats/${uid}`)
    .get()
    .then((snap) => snap.val())
  logIfFalsy(typeof seat === "number", "seat from database: " + seat)
  const size = await auctionRef
    .child("size")
    .get()
    .then((snap) => snap.val())
  logIfFalsy(size, "size from database")
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
