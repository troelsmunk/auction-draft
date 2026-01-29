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
    /** @type {Array<number|null>} bids */
    const bids = JSON.parse(formData?.get("bids"))
    const round = parseInt(event.params.round)
    const pin = event.params.pin
    if (!round) {
      throw error(500, "The round is not a number")
    }
    if (bids.length != 15) {
      return fail(400, {
        error: "Wrong number of bids",
        bids: bids,
      })
    }
    const filteredBids = bids.map((bid) => {
      if (!bid) return 0
      return bid
    })
    if (filteredBids.some((bid) => typeof bid !== "number")) {
      return fail(400, {
        error: "The bids should be numbers",
        bids: bids,
      })
    }
    if (filteredBids.some((bid) => bid < 0)) {
      return fail(400, {
        error: "The bids can't be negative",
        bids: bids,
      })
    }
    const sumOfBids = filteredBids.reduce((sum, value) => sum + value)
    // const auctionRef = admin.database().ref(`auctions/${pin}`)
    const seat = 1
    //  await auctionRef
    //   .child(`seats/${uid}`)
    //   .get()
    //   .then((snap) => snap.val())
    const scoreboard = 100
    // await auctionRef
    //   .child(`scoreboard/${seat}`)
    //   .get()
    //   .then((snap) => snap.val())
    if (scoreboard < sumOfBids) {
      return fail(400, {
        error: "Insufficient funds",
        bids: bids,
      })
    }
    // await auctionRef.child(`bids/${uid}`).set(filteredBids)
    // await auctionRef.child(`readys/${uid}`).set(round)
    return { success: true }
  },
}
