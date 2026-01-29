import { derived, writable } from "svelte/store"
import { page } from "$app/stores"

/** @type {import("svelte/store").Writable<string>} */
export const uid = writable(null)
/** @type {import("svelte/store").Writable<number>} */
export const currentRound = writable(0)
/** @type {import("svelte/store").Readable<number>} */
export const pin = derived(page, ($page) => $page.params.pin)
/** @type {import("svelte/store").Readable<number>} */
export const round = derived(page, ($page) => $page.params.round)
/** @type {import("svelte/store").Writable<boolean>} */
export const bidByButtons = writable(false)
