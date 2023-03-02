import { derived, writable } from "svelte/store"

/** @type {import("svelte/store").Writable<import("firebase/auth").Auth>} */
export const auth = writable(null)
/** @type {import("svelte/store").Writable<string>} */
export const uid = writable(null)
/** @type {import("svelte/store").Writable<number>} */
export const pin = writable(null)

export const auctionSize = writable(0)
export const seat = writable(0)
export const color = derived(seat, ($seat) => colorDecoder($seat))
export const round = writable(1)
export const opener = derived([round, auctionSize], ([$round, $auctionSize]) =>
  colorDecoder($round % $auctionSize)
)

export const currentlyBidding = writable(true)
export const isWelcome = writable(true)
export const loading = writable(false)

function colorDecoder(bidder) {
  switch (bidder) {
    case 1:
      return "purple"
    case 2:
      return "yellow"
    case 3:
      return "brown"
    case 4:
      return "gray"
    case 5:
      return "lightblue"
    case 6:
      return "orange"
    default:
      return ""
  }
}
