import { writable } from "svelte/store"

/** @type {import("svelte/store").Writable<import("firebase/auth").Auth> */
export const auth = writable(null)
/** @type {import("svelte/store").Writable<string> */
export const uid = writable(null)
/** @type {import("svelte/store").Writable<number> */
export const pin = writable(null)
