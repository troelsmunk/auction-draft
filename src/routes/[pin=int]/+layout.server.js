import { admin } from "$lib/admin.server"
import { COOKIE_NAME } from "$lib/constants"
import { error } from "@sveltejs/kit"

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ params, cookies }) {
  const uid = cookies.get(COOKIE_NAME)
  if (!uid) {
    throw error(401, "Please log in")
  }
  const auctionRef = admin.database().ref(`auctions/${params.pin}`)
  const seat = await auctionRef
    .child(`seats/${uid}`)
    .get()
    .then((snap) => snap.val())
  if (typeof seat !== "number") {
    throw error(403, "You are not enrolled in this auction")
  }
  const size = await auctionRef
    .child("size")
    .get()
    .then((snap) => snap.val())
  if (!size) {
    throw error(500, "The auction has no size")
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
    colors: colors,
    seat: seat,
  }
}
