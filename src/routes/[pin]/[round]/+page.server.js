import { admin } from "$lib/admin.server"
import { COOKIE_NAME } from "$lib/constants"
import { isInvalid } from "$lib/validation"

/** @type {import('@sveltejs/kit').Actions} */
export const actions = {
  submit: async (event) => {
    const formData = await event.request.formData()
    const bids = JSON.parse(formData.get("bids"))
    const uid = event.cookies.get(COOKIE_NAME)
    const round = parseInt(event.params.round)
    const pin = parseInt(event.params.pin)
    if (
      isInvalid(bids, "bids from form") ||
      isInvalid(uid, "uid from cookie") ||
      isInvalid(round, "round from params") ||
      isInvalid(pin, "pin from params")
    ) {
      return { success: false }
    }
    await admin.database().ref(`auctions/${pin}/bids/${uid}`).set(bids)
    await admin.database().ref(`auctions/${pin}/readys/${uid}`).set(round)
    return { success: true }
  },
}
