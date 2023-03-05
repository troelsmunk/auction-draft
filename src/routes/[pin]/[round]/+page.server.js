import { admin, validateUserAndGetUid } from "$lib/admin.server"

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
  return {
    post: {
      pin: params.pin,
      round: params.round,
    },
  }
}

/** @type {import('@sveltejs/kit').Actions} */
export const actions = {
  submit: async (event) => {
    const formData = await event.request.formData()
    const uid = await validateUserAndGetUid(formData.get("user-id-token"))
    const auctionRef = admin.database().ref("auctions/" + event.params.pin)
    await auctionRef.child("/bids/" + uid).set(formData.get("bids"))
    await auctionRef.child("/readys/" + uid).set(event.params.round)
    return { success: true }
  },
}
