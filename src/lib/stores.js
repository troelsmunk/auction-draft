import { writable } from "svelte/store"

/** @type {import("svelte/store").Writable<number>} */
export const currentRound = writable(0)
/** @type {import("svelte/store").Writable<boolean>} */
export const bidByButtons = writable(true)
