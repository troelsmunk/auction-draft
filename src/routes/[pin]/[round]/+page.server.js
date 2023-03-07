import { admin } from "$lib/admin.server"

/** @type {import('@sveltejs/kit').Actions} */
export const actions = {
  submit: async (event) => {
    const formData = await event.request.formData()
    const uid = event.cookies.get("firebaseuid")
    const auctionRef = admin.database().ref("auctions/" + event.params.pin)
    await auctionRef.child("/bids/" + uid).set(formData.get("bids"))
    await auctionRef.child("/readys/" + uid).set(event.params.round)
    return { success: true }
  },
}
