import { admin } from "$lib/admin.server"
import { COOKIE_NAME } from "$lib/constants"

/** @type {import('@sveltejs/kit').Actions} */
export const actions = {
  submit: async (event) => {
    const formData = await event.request.formData()
    const bids = JSON.parse(formData.get("bids"))
    const uid = event.cookies.get(COOKIE_NAME)
    const round = parseInt(event.params.round)
    const pin = parseInt(event.params.pin)
    await admin.database().ref(`auctions/${pin}/bids/${uid}`).set(bids)
    await admin.database().ref(`auctions/${pin}/readys/${uid}`).set(round)
    return { success: true }
  },
}
