import { derived, writable } from "svelte/store"
import { page } from "$app/stores"

/** @type {import("svelte/store").Writable<number>} */
export const currentRound = writable(0)
/** @type {import("svelte/store").Readable<number>} */
export const auctionNumber = derived(page, ($page) =>
  parseInt($page.params.auction_number),
)
/** @type {import("svelte/store").Readable<number>} */
export const round = derived(page, ($page) => parseInt($page.params.round))
/** @type {import("svelte/store").Writable<boolean>} */
export const bidByButtons = writable(true)
