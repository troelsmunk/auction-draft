import { COOKIE_NAME } from "$lib/constants"
import { broadcastUpdate } from "$lib/sseManager"
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
    const bids = JSON.parse(formData?.get("bids")?.toString() || "[]")
    const round = parseInt(event.params.round)
    const pin = event.params.pin
    if (!round) {
      // TODO already checked by sveltekit route param
      throw error(500, "The round is not a number")
    }
    if (bids.length != 15) {
      return fail(400, {
        error: "Wrong number of bids",
        bids: bids,
      })
    }
    // TODO bids.some(bid => typeof bid !== 'number')
    const filteredBids = bids.map((bid) => {
      // TODO bid || 0
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
      // TODO combine the two checks
      return fail(400, {
        error: "The bids can't be negative",
        bids: bids,
      })
    }
    const sumOfBids = filteredBids.reduce((sum, value) => sum + value)
    const remainingPointsFromDb = 1000 // TODO get from db
    if (remainingPointsFromDb < sumOfBids) {
      return fail(400, {
        error: "Insufficient funds",
        bids: bids,
      })
    }
    const update = {
      uid: uid,
      bids: sumOfBids,
    }
    broadcastUpdate(update, parseInt(event.params.pin))
    // TODO write bids to db
    return { success: true } // TODO success from result of db write
  },
}
