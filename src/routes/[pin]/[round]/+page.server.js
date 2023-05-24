import { admin } from "$lib/admin.server"
import { COOKIE_NAME } from "$lib/constants"
import { error, fail } from "@sveltejs/kit"

/** @type {import('@sveltejs/kit').Actions} */
export const actions = {
  submit: async (event) => {
    const uid = event.cookies.get(COOKIE_NAME)
    if (!uid) {
      throw error(401, "Please log in")
    }
    const formData = await event.request.formData()
    const bids = JSON.parse(formData?.get("bids"))
    const round = parseInt(event.params.round)
    const pin = event.params.pin
    if (!round) {
      throw error(500, "The round is not a number")
    }
    const numericBids = Object.values(bids).filter(
      (bid) => typeof bid === "number"
    )
    if (numericBids.length === 0) {
      return fail(400, {
        error: "The bids should contain numbers.",
        bids: bids,
      })
    }
    await admin.database().ref(`auctions/${pin}/bids/${uid}`).set(bids)
    await admin.database().ref(`auctions/${pin}/readys/${uid}`).set(round)
    return { success: true }
  },
}
