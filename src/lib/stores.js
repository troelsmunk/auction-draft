import { derived, writable } from "svelte/store"

/** @type {import("svelte/store").Writable<string>} */
export const uid = writable(null)
export const auctionSize = writable(0)
export const seat = writable(0)
