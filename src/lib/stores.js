import { writable } from "svelte/store"
/**
 * @type {import("svelte/store").Writable<import("firebase/database").FirebaseDatabase>}
 */
export const db = writable(null)
export const auth = writable(null)
